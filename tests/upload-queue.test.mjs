import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_FILE_COUNT,
  calculateUploadPercentage,
  canAddFiles,
  processUploadQueue,
  sortFilesSmallestFirst,
} from "../app/upload-queue.ts";

test("one successful file is attempted once", async () => {
  const calls = [];
  const file = { name: "one.jpg", size: 2 };
  const result = await processUploadQueue([file], async (item, context) => {
    calls.push(`${item.name}:${context.attemptNumber}`);
  });

  assert.deepEqual(calls, ["one.jpg:1"]);
  assert.deepEqual(result.successful, [file]);
  assert.deepEqual(result.failed, []);
});

test("several files are stably sorted smallest first", () => {
  const files = [
    { name: "large.mp4", size: 30 },
    { name: "small-a.jpg", size: 2 },
    { name: "small-b.jpg", size: 2 },
    { name: "medium.heic", size: 12 },
  ];

  assert.deepEqual(
    sortFilesSmallestFirst(files).map((file) => file.name),
    ["small-a.jpg", "small-b.jpg", "medium.heic", "large.mp4"]
  );
});

test("exactly 100 files are accepted and more than 100 are refused", () => {
  assert.equal(canAddFiles(0, MAX_FILE_COUNT), true);
  assert.equal(canAddFiles(99, 1), true);
  assert.equal(canAddFiles(100, 1), false);
  assert.equal(canAddFiles(80, 21), false);
});

test("an initial failure waits until all untouched first-pass files finish", async () => {
  const files = [
    { name: "first.jpg", size: 1 },
    { name: "problem.mov", size: 2 },
    { name: "last.jpg", size: 3 },
  ];
  const calls = [];

  const result = await processUploadQueue(files, async (item, context) => {
    calls.push(`${item.name}:${context.attemptNumber}`);
    if (item.name === "problem.mov" && context.attemptNumber === 1)
      throw new Error("temporary");
  });

  assert.deepEqual(calls, [
    "first.jpg:1",
    "problem.mov:1",
    "last.jpg:1",
    "problem.mov:2",
  ]);
  assert.equal(result.successful.length, 3);
  assert.equal(result.failed.length, 0);
});

test("a file may succeed on the second retry without retrying successes", async () => {
  const files = [
    { name: "safe.jpg", size: 1 },
    { name: "eventual.mov", size: 2 },
  ];
  const calls = [];

  const result = await processUploadQueue(files, async (item, context) => {
    calls.push(`${item.name}:${context.attemptNumber}`);
    if (item.name === "eventual.mov" && context.attemptNumber < 3)
      throw new Error("temporary");
  });

  assert.deepEqual(calls, [
    "safe.jpg:1",
    "eventual.mov:1",
    "eventual.mov:2",
    "eventual.mov:3",
  ]);
  assert.equal(result.successful.length, 2);
  assert.equal(result.failed.length, 0);
});

test("a permanently failing file stops after two additional retries", async () => {
  const file = { name: "broken.mov", size: 1 };
  const attempts = [];

  const result = await processUploadQueue([file], async (_item, context) => {
    attempts.push(context.attemptNumber);
    throw new Error(`failure ${context.attemptNumber}`);
  });

  assert.deepEqual(attempts, [1, 2, 3]);
  assert.equal(result.successful.length, 0);
  assert.equal(result.failed.length, 1);
  assert.equal(result.failed[0].attempts, 3);
});

test("progress is byte-based, resets for the next file, and reaches 100 only when confirmed", () => {
  assert.equal(calculateUploadPercentage(0, 0, 1_000), 0);
  assert.equal(calculateUploadPercentage(200, 100, 1_000), 30);
  assert.equal(calculateUploadPercentage(900, 100, 1_000), 99);
  assert.equal(calculateUploadPercentage(1_000, 0, 1_000), 100);
  assert.equal(calculateUploadPercentage(0, 0, 2_000), 0);
});
