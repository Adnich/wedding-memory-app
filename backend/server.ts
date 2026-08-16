import "dotenv/config";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "crypto";
import express from "express";
import cors from "cors";
import { drive_v3, google } from "googleapis";

const app = express();

const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024;
const CHUNK_SIZE_BYTES = 8 * 1024 * 1024;
const UPLOAD_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DRIVE_UPLOAD_HOST = "www.googleapis.com";
const DRIVE_UPLOAD_PATH = "/upload/drive/v3/files";

app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL || ""].filter(
      Boolean
    ),
  })
);
app.use(express.json({ limit: "64kb" }));

type UploadTokenPayload = {
  version: 1;
  uploadId: string;
  fileId: string;
  driveName: string;
  originalName: string;
  mimeType: string;
  size: number;
  guestName: string;
  message: string;
  sessionHash: string;
  expiresAt: number;
};

type NewUploadRequest = {
  name?: unknown;
  message?: unknown;
  file?: { name?: unknown; size?: unknown; type?: unknown };
  uploadToken?: unknown;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Nedostaje obavezna konfiguracija: ${name}`);
  return value;
}

function getGoogleAuth() {
  const oauth2Client = new google.auth.OAuth2(
    getRequiredEnv("GOOGLE_CLIENT_ID"),
    getRequiredEnv("GOOGLE_CLIENT_SECRET")
  );
  oauth2Client.setCredentials({
    refresh_token: getRequiredEnv("GOOGLE_REFRESH_TOKEN"),
  });
  return oauth2Client;
}

function getDriveClient() {
  return google.drive({ version: "v3", auth: getGoogleAuth() });
}

function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getGoogleAuth() });
}

function getErrorDetails(error: unknown) {
  if (
    typeof error === "object" && error !== null && "response" in error &&
    typeof error.response === "object" && error.response !== null &&
    "data" in error.response
  ) return JSON.stringify(error.response.data);
  if (error instanceof Error) return error.message;
  return "Nepoznata greška.";
}

function getHttpStatus(error: unknown) {
  if (typeof error !== "object" || error === null) return undefined;
  if ("code" in error && typeof error.code === "number") return error.code;
  if (
    "response" in error && typeof error.response === "object" &&
    error.response !== null && "status" in error.response &&
    typeof error.response.status === "number"
  ) return error.response.status;
  return undefined;
}

function signUploadToken(payload: UploadTokenPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getRequiredEnv("GOOGLE_CLIENT_SECRET"))
    .update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function verifyUploadToken(token: unknown) {
  if (typeof token !== "string" || token.length > 20_000)
    throw new Error("Nevažeća upload sesija.");
  const [encodedPayload, suppliedSignature, extra] = token.split(".");
  if (!encodedPayload || !suppliedSignature || extra)
    throw new Error("Nevažeća upload sesija.");
  const expected = createHmac("sha256", getRequiredEnv("GOOGLE_CLIENT_SECRET"))
    .update(encodedPayload).digest();
  const supplied = Buffer.from(suppliedSignature, "base64url");
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied))
    throw new Error("Nevažeća upload sesija.");
  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8")
  ) as UploadTokenPayload;
  if (
    payload.version !== 1 || !payload.uploadId || !payload.fileId ||
    !payload.sessionHash || !Number.isSafeInteger(payload.size) ||
    payload.size <= 0 || payload.size > MAX_FILE_SIZE_BYTES ||
    !Number.isSafeInteger(payload.expiresAt) || payload.expiresAt < Date.now()
  ) throw new Error("Upload sesija je nevažeća ili je istekla.");
  return payload;
}

function hashSessionUrl(sessionUrl: string) {
  return createHash("sha256").update(sessionUrl).digest("base64url");
}

function validateSessionUrl(sessionUrl: unknown, payload: UploadTokenPayload) {
  if (typeof sessionUrl !== "string" || sessionUrl.length > 4_096)
    throw new Error("Nevažeća Drive upload sesija.");
  const parsed = new URL(sessionUrl);
  if (
    parsed.protocol !== "https:" || parsed.hostname !== DRIVE_UPLOAD_HOST ||
    parsed.pathname !== DRIVE_UPLOAD_PATH ||
    parsed.searchParams.get("uploadType") !== "resumable" ||
    !parsed.searchParams.get("upload_id") ||
    hashSessionUrl(sessionUrl) !== payload.sessionHash
  ) throw new Error("Nevažeća Drive upload sesija.");
  return sessionUrl;
}

function cleanFileNamePart(value: string, maxLength: number) {
  return value.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function parseNewUploadRequest(body: NewUploadRequest) {
  const guestName = String(body.name || "").trim();
  const message = String(body.message || "").trim();
  const originalName = String(body.file?.name || "").trim();
  const mimeType = String(body.file?.type || "application/octet-stream").trim();
  const size = Number(body.file?.size);
  if (!guestName) throw new Error("Ime je obavezno.");
  if (guestName.length > 120 || message.length > 5_000)
    throw new Error("Ime ili poruka su predugi.");
  if (!originalName || originalName.length > 255)
    throw new Error("Naziv fajla nije važeći.");
  if (!Number.isSafeInteger(size) || size <= 0)
    throw new Error("Veličina fajla nije važeća.");
  if (size > MAX_FILE_SIZE_BYTES)
    throw new Error("Fajl je veći od dozvoljenog limita od 1 GB po fajlu.");
  const safeGuestName = cleanFileNamePart(guestName, 80) || "gost";
  const safeOriginalName = cleanFileNamePart(originalName, 180) || "fajl";
  return {
    guestName, message, originalName,
    mimeType: mimeType.slice(0, 255) || "application/octet-stream", size,
    driveName: `${Date.now()}-${safeGuestName}-${safeOriginalName}`,
  };
}

function toPublicDriveFile(file: drive_v3.Schema$File) {
  return {
    id: file.id || "", name: file.name || "",
    webViewLink: file.webViewLink || "", size: Number(file.size || 0),
  };
}

async function getDriveFile(fileId: string) {
  try {
    const result = await getDriveClient().files.get({
      fileId, fields: "id,name,webViewLink,size,parents,appProperties",
    });
    return result.data;
  } catch (error) {
    if (getHttpStatus(error) === 404) return null;
    throw error;
  }
}

function verifyCompletedDriveFile(file: drive_v3.Schema$File, payload: UploadTokenPayload) {
  return file.id === payload.fileId && Number(file.size || 0) === payload.size &&
    (file.parents || []).includes(getRequiredEnv("GOOGLE_DRIVE_FOLDER_ID")) &&
    file.appProperties?.weddingUploadId === payload.uploadId;
}

async function generateDriveFileId() {
  const result = await getDriveClient().files.generateIds({
    count: 1, space: "drive", type: "files",
  });
  const fileId = result.data.ids?.[0];
  if (!fileId) throw new Error("Drive nije vratio ID za novi fajl.");
  return fileId;
}

async function createDriveResumableSession(
  payload: Omit<UploadTokenPayload, "sessionHash" | "expiresAt">
) {
  const accessToken = await getGoogleAuth().getAccessToken();
  if (!accessToken.token) throw new Error("Google pristupni token nije dostupan.");
  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,webViewLink,size,parents,appProperties",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": payload.mimeType,
        "X-Upload-Content-Length": String(payload.size),
      },
      body: JSON.stringify({
        id: payload.fileId, name: payload.driveName, mimeType: payload.mimeType,
        parents: [getRequiredEnv("GOOGLE_DRIVE_FOLDER_ID")],
        appProperties: {
          weddingUploadId: payload.uploadId, weddingMetadataStatus: "pending",
        },
      }),
    }
  );
  if (!response.ok) {
    const error = new Error(
      `Drive nije pokrenuo resumable upload (${response.status}).`
    ) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  const sessionUrl = response.headers.get("location");
  if (!sessionUrl) throw new Error("Drive nije vratio resumable session URL.");
  return sessionUrl;
}

function parseConfirmedBytes(rangeHeader: string | null) {
  const match = rangeHeader?.match(/^bytes=0-(\d+)$/i);
  return match ? Number(match[1]) + 1 : 0;
}

async function queryDriveUploadStatus(sessionUrl: string, payload: UploadTokenPayload) {
  const response = await fetch(sessionUrl, {
    method: "PUT",
    headers: {
      "Content-Length": "0",
      "Content-Range": `bytes */${payload.size}`,
    },
  });
  if (response.status === 200 || response.status === 201) {
    const body = (await response.json()) as drive_v3.Schema$File;
    return { state: "complete" as const, file: toPublicDriveFile(body) };
  }
  if (response.status === 308) return {
    state: "incomplete" as const,
    confirmedBytes: parseConfirmedBytes(response.headers.get("range")),
  };
  if (response.status === 404 || response.status === 410)
    return { state: "expired" as const, confirmedBytes: 0 };
  throw new Error(`Drive status provjera nije uspjela (${response.status}).`);
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function setMetadataRecorded(file: drive_v3.Schema$File) {
  try {
    await getDriveClient().files.update({
      fileId: file.id!,
      requestBody: { appProperties: {
        ...(file.appProperties || {}), weddingMetadataStatus: "recorded",
      } },
    });
  } catch (error) {
    console.error("Drive metadata marker update failed", {
      fileId: file.id, details: getErrorDetails(error),
    });
  }
}

async function recordSheetMetadataOnce(file: drive_v3.Schema$File, payload: UploadTokenPayload) {
  if (file.appProperties?.weddingMetadataStatus === "recorded") return;
  const sheets = getSheetsClient();
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const existingRows = await sheets.spreadsheets.values.get({
    spreadsheetId, range: "E:E",
  });
  const alreadyRecorded = (existingRows.data.values || []).some((row) =>
    String(row[0] || "").includes(file.id || "__missing_file_id__")
  );
  if (!alreadyRecorded) {
    const publicFile = toPublicDriveFile(file);
    await sheets.spreadsheets.values.append({
      spreadsheetId, range: "A:E", valueInputOption: "USER_ENTERED",
      requestBody: { values: [[
        new Date().toLocaleString("bs-BA"), payload.guestName, payload.message, 1,
        `${publicFile.name} (${publicFile.webViewLink || publicFile.id})`,
      ]] },
    });
  }
  await setMetadataRecorded(file);
}

async function recordSheetMetadata(file: drive_v3.Schema$File, payload: UploadTokenPayload) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await recordSheetMetadataOnce(file, payload);
      return true;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await wait(250 * 2 ** attempt);
    }
  }
  console.error("Sheets metadata write failed after Drive success", {
    fileId: file.id, details: getErrorDetails(lastError),
  });
  return false;
}

app.get("/", (_req, res) => res.json({
  status: "ok", message: "Wedding upload backend radi.",
  uploadMode: "drive-resumable",
}));

app.get("/admin/messages", async (req, res) => {
  try {
    if (req.header("x-admin-password") !== process.env.ADMIN_PASSWORD)
      return res.status(401).json({ error: "Pogrešna admin šifra." });
    const result = await getSheetsClient().spreadsheets.values.get({
      spreadsheetId: getRequiredEnv("GOOGLE_SHEET_ID"), range: "A:E",
    });
    const messages = (result.data.values || []).slice(1).reverse().map((row) => ({
      time: String(row[0] || ""), name: String(row[1] || ""),
      message: String(row[2] || ""), fileCount: String(row[3] || ""),
      files: String(row[4] || ""),
    }));
    return res.json({ messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Admin poruke nije moguće učitati." });
  }
});

app.post("/uploads/init", async (req, res) => {
  try {
    const body = req.body as NewUploadRequest;
    let basePayload: Omit<UploadTokenPayload, "sessionHash" | "expiresAt">;
    if (body.uploadToken) {
      const previous = verifyUploadToken(body.uploadToken);
      const completed = await getDriveFile(previous.fileId);
      if (completed) {
        if (!verifyCompletedDriveFile(completed, previous))
          return res.status(409).json({ error: "Postojeći Drive fajl ne odgovara ovoj upload sesiji." });
        return res.json({
          alreadyComplete: true, uploadToken: body.uploadToken,
          file: toPublicDriveFile(completed),
        });
      }
      const { sessionHash: _sessionHash, expiresAt: _expiresAt, ...base } = previous;
      void _sessionHash;
      void _expiresAt;
      basePayload = base;
    } else {
      const parsed = parseNewUploadRequest(body);
      basePayload = {
        version: 1, uploadId: randomUUID(), fileId: await generateDriveFileId(),
        driveName: parsed.driveName, originalName: parsed.originalName,
        mimeType: parsed.mimeType, size: parsed.size,
        guestName: parsed.guestName, message: parsed.message,
      };
    }
    let sessionUrl: string;
    try {
      sessionUrl = await createDriveResumableSession(basePayload);
    } catch (error) {
      if (typeof error === "object" && error !== null &&
          "status" in error && error.status === 409) {
        const completed = await getDriveFile(basePayload.fileId);
        const checkPayload: UploadTokenPayload = {
          ...basePayload, sessionHash: "completed",
          expiresAt: Date.now() + UPLOAD_TOKEN_TTL_MS,
        };
        if (completed && verifyCompletedDriveFile(completed, checkPayload))
          return res.json({ alreadyComplete: true, file: toPublicDriveFile(completed) });
      }
      throw error;
    }
    const payload: UploadTokenPayload = {
      ...basePayload, sessionHash: hashSessionUrl(sessionUrl),
      expiresAt: Date.now() + UPLOAD_TOKEN_TTL_MS,
    };
    return res.json({
      alreadyComplete: false, uploadToken: signUploadToken(payload), sessionUrl,
      chunkSizeBytes: CHUNK_SIZE_BYTES,
    });
  } catch (error) {
    console.error("Resumable upload initialization failed", { details: getErrorDetails(error) });
    const message = error instanceof Error ? error.message : "Upload nije pokrenut.";
    const validation = /obavezno|važeć|predug|veći|istekla/.test(message);
    return res.status(validation ? 400 : 500).json({
      error: validation ? message : "Upload nije moguće pokrenuti.",
    });
  }
});

app.post("/uploads/status", async (req, res) => {
  try {
    const payload = verifyUploadToken(req.body?.uploadToken);
    const sessionUrl = validateSessionUrl(req.body?.sessionUrl, payload);
    const completed = await getDriveFile(payload.fileId);
    if (completed) {
      if (!verifyCompletedDriveFile(completed, payload))
        return res.status(409).json({ error: "Drive fajl ne odgovara upload sesiji." });
      return res.json({ state: "complete", file: toPublicDriveFile(completed) });
    }
    return res.json(await queryDriveUploadStatus(sessionUrl, payload));
  } catch (error) {
    console.error("Resumable upload status check failed", { details: getErrorDetails(error) });
    return res.status(503).json({ error: "Status uploada trenutno nije moguće provjeriti." });
  }
});

app.post("/uploads/complete", async (req, res) => {
  try {
    const payload = verifyUploadToken(req.body?.uploadToken);
    const completed = await getDriveFile(payload.fileId);
    if (!completed)
      return res.status(409).json({ error: "Drive još nije potvrdio završetak fajla." });
    if (!verifyCompletedDriveFile(completed, payload))
      return res.status(409).json({ error: "Završeni Drive fajl ne odgovara upload sesiji." });
    const metadataRecorded = await recordSheetMetadata(completed, payload);
    return res.json({
      success: true, file: toPublicDriveFile(completed), metadataRecorded,
    });
  } catch (error) {
    console.error("Upload completion verification failed", { details: getErrorDetails(error) });
    return res.status(500).json({ error: "Završetak uploada nije moguće potvrditi." });
  }
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`Backend radi na portu ${port}`));
