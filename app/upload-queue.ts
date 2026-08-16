export const MAX_FILE_COUNT = 100;
export const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024;
export const MAX_FILE_RETRIES = 2;

export type UploadAttemptContext = {
  phase: "first-pass" | "retry";
  attemptNumber: number;
  retryNumber: number;
};

export type UploadFailure<T> = {
  item: T;
  error: unknown;
  attempts: number;
};

export type UploadQueueResult<T> = {
  successful: T[];
  failed: UploadFailure<T>[];
};

export function canAddFiles(currentCount: number, addedCount: number) {
  return currentCount + addedCount <= MAX_FILE_COUNT;
}

export function sortFilesSmallestFirst<T extends { size: number }>(
  files: readonly T[]
) {
  return files
    .map((file, originalIndex) => ({ file, originalIndex }))
    .sort(
      (left, right) =>
        left.file.size - right.file.size ||
        left.originalIndex - right.originalIndex
    )
    .map(({ file }) => file);
}

export function calculateUploadPercentage(
  confirmedBytes: number,
  inFlightBytes: number,
  totalBytes: number
) {
  if (totalBytes <= 0) return 0;
  if (confirmedBytes >= totalBytes) return 100;

  const transferredBytes = Math.min(
    totalBytes,
    Math.max(0, confirmedBytes) + Math.max(0, inFlightBytes)
  );

  return Math.min(99, Math.floor((transferredBytes / totalBytes) * 100));
}

export async function processUploadQueue<T>(
  items: readonly T[],
  attemptUpload: (
    item: T,
    context: UploadAttemptContext
  ) => Promise<void>
): Promise<UploadQueueResult<T>> {
  const successful: T[] = [];
  let pendingFailures: UploadFailure<T>[] = [];

  for (const item of items) {
    try {
      await attemptUpload(item, {
        phase: "first-pass",
        attemptNumber: 1,
        retryNumber: 0,
      });
      successful.push(item);
    } catch (error) {
      pendingFailures.push({ item, error, attempts: 1 });
    }
  }

  for (
    let retryNumber = 1;
    retryNumber <= MAX_FILE_RETRIES && pendingFailures.length > 0;
    retryNumber += 1
  ) {
    const nextFailures: UploadFailure<T>[] = [];

    for (const failure of pendingFailures) {
      try {
        await attemptUpload(failure.item, {
          phase: "retry",
          attemptNumber: retryNumber + 1,
          retryNumber,
        });
        successful.push(failure.item);
      } catch (error) {
        nextFailures.push({
          item: failure.item,
          error,
          attempts: retryNumber + 1,
        });
      }
    }

    pendingFailures = nextFailures;
  }

  return { successful, failed: pendingFailures };
}
