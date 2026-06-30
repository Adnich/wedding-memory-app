import "dotenv/config";
import readline from "readline";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost"
);

const scopes = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: scopes,
});

console.log("\nOtvori ovaj link u browseru:\n");
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\nZalijepi authorization code ovdje: ", async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());

    console.log("\nTvoj REFRESH TOKEN je:\n");
    console.log(tokens.refresh_token);

    console.log("\nKopiraj ovaj refresh token u backend/.env kao GOOGLE_REFRESH_TOKEN.");
  } catch (error) {
    console.error("\nGreška pri dobijanju tokena:");
    console.error(error);
  } finally {
    rl.close();
  }
});