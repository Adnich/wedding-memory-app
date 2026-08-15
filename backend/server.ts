import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { google } from "googleapis";
import { Readable } from "stream";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.FRONTEND_URL || "",
    ].filter(Boolean),
  })
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

function getGoogleAuth() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return oauth2Client;
}

function getDriveClient() {
  return google.drive({
    version: "v3",
    auth: getGoogleAuth(),
  });
}

function getSheetsClient() {
  return google.sheets({
    version: "v4",
    auth: getGoogleAuth(),
  });
}

function bufferToStream(buffer: Buffer) {
  return Readable.from(buffer);
}

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Wedding upload backend radi.",
  });
});

app.get("/admin/messages", async (req, res) => {
  try {
    const adminPassword = req.header("x-admin-password");

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        error: "Pogrešna admin šifra.",
      });
    }

    const sheets = getSheetsClient();

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: "A:E",
    });

    const rows = result.data.values || [];
    const messages = rows
      .slice(1)
      .reverse()
      .map((row) => ({
        time: String(row[0] || ""),
        name: String(row[1] || ""),
        message: String(row[2] || ""),
        fileCount: String(row[3] || ""),
        files: String(row[4] || ""),
      }));

    return res.json({
      messages,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Admin poruke nije moguće učitati.",
    });
  }
});

app.post("/upload", upload.array("files"), async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const message = String(req.body.message || "").trim();

    if (!name) {
      return res.status(400).json({
        error: "Ime je obavezno.",
      });
    }

    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: "Dodajte barem jednu sliku ili video.",
      });
    }

    const drive = getDriveClient();
    const sheets = getSheetsClient();

    const uploadedFiles: string[] = [];

    for (const file of files) {
      const safeName = `${Date.now()}-${name}-${file.originalname}`;

      const result = await drive.files.create({
        requestBody: {
          name: safeName,
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
        },
        media: {
          mimeType: file.mimetype,
          body: bufferToStream(file.buffer),
        },
        fields: "id,name,webViewLink",
      });

      uploadedFiles.push(
        `${result.data.name} (${result.data.webViewLink || result.data.id})`
      );
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: "A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date().toLocaleString("bs-BA"),
            name,
            message,
            uploadedFiles.length,
            uploadedFiles.join("\n"),
          ],
        ],
      },
    });

    return res.json({
      success: true,
      uploaded: uploadedFiles.length,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Upload nije uspio. Pokušajte ponovo.",
    });
  }
});

const port = Number(process.env.PORT || 8080);

app.listen(port, () => {
  console.log(`Backend radi na portu ${port}`);
});
