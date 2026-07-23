import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_REFRESH_TOKEN,
} = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env. Did you copy .env.example to .env and fill it in?"
  );
}

export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// If we already have a refresh token (normal running mode), set it now.
// googleapis will automatically use it to mint fresh access tokens on every
// call and re-mint them silently when they expire - no re-auth needed.
if (GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
}

// Optional: log when a new access token is minted, useful for debugging.
oauth2Client.on("tokens", (tokens) => {
  if (tokens.refresh_token) {
    console.log(
      "Received a new refresh token - if this ever happens unexpectedly, update .env"
    );
  }
});

export const gmail = google.gmail({ version: "v1", auth: oauth2Client });
export const drive = google.drive({ version: "v3", auth: oauth2Client });
