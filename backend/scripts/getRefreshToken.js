// Run this ONCE (npm run get-token) to get a refresh token for the SENDER account.
// It prints a URL - open it, log into the sender Gmail account, approve access,
// copy the code Google gives you back into the terminal prompt.
import { google } from "googleapis";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("Fill in GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first.");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI || "urn:ietf:wg:oauth:2.0:oob"
);

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/drive.file",
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline", // required to get a refresh token
  prompt: "consent", // forces Google to actually hand back a refresh token
  scope: SCOPES,
});

console.log("\n1. Open this URL in your browser, and log in as the SENDER account:\n");
console.log(authUrl);
console.log("\n2. Approve access, then copy the code Google shows you.\n");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Paste the code here: ", async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    if (!tokens.refresh_token) {
      console.error(
        "\nNo refresh token returned. This usually means you've authorized this app before.\n" +
        "Go to https://myaccount.google.com/permissions, remove access for this app, and run this script again."
      );
      process.exit(1);
    }
    console.log("\nSuccess! Add this line to your .env file:\n");
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
  } catch (err) {
    console.error("Error exchanging code for tokens:", err.message);
  }
});
