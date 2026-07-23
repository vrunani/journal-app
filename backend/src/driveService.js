import { drive } from "./googleClient.js";
import dotenv from "dotenv";
dotenv.config();

const FOLDER_ID = process.env.DRIVE_FOLDER_ID;

if (!FOLDER_ID) {
  console.warn(
    "\nWARNING: DRIVE_FOLDER_ID is not set in .env.\n" +
    "Run the server once and hit POST /api/setup-folder to create the folder,\n" +
    "then copy the returned folderId into .env as DRIVE_FOLDER_ID.\n"
  );
}

// One-time helper: creates the storage folder in the sender's Drive.
// Because we only have the `drive.file` scope, the app can only see files/folders
// it created itself - so this folder MUST be created through this app, not manually.
export async function createJournalFolder() {
  const res = await drive.files.create({
    requestBody: {
      name: "Relationship Journal Letters",
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id, name",
  });
  return res.data; // { id, name }
}

function fileNameForDate(dateStr) {
  return `${dateStr}.txt`; // e.g. 2026-07-21.txt
}

export async function saveLetterToDrive(dateStr, text) {
  if (!FOLDER_ID) throw new Error("DRIVE_FOLDER_ID is not configured");

  // Check if an entry for this date already exists - if so, update it instead
  // of creating a duplicate file.
  const existing = await findFileByDate(dateStr);

  if (existing) {
    const res = await drive.files.update({
      fileId: existing.id,
      media: { mimeType: "text/plain", body: text },
    });
    return res.data;
  }

  const res = await drive.files.create({
    requestBody: {
      name: fileNameForDate(dateStr),
      parents: [FOLDER_ID],
      mimeType: "text/plain",
    },
    media: { mimeType: "text/plain", body: text },
    fields: "id, name",
  });
  return res.data;
}

async function findFileByDate(dateStr) {
  const res = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and name = '${fileNameForDate(dateStr)}' and trashed = false`,
    fields: "files(id, name)",
    spaces: "drive",
  });
  return res.data.files?.[0] || null;
}

// Returns a sorted list of dates (YYYY-MM-DD) that have an entry.
export async function listEntryDates() {
  if (!FOLDER_ID) throw new Error("DRIVE_FOLDER_ID is not configured");

  let files = [];
  let pageToken = undefined;

  do {
    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name)",
      spaces: "drive",
      pageSize: 1000,
      pageToken,
    });
    files = files.concat(res.data.files || []);
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return files
    .map((f) => f.name.replace(/\.txt$/, ""))
    .filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name))
    .sort();
}

export async function getLetterByDate(dateStr) {
  const file = await findFileByDate(dateStr);
  if (!file) return null;

  const res = await drive.files.get(
    { fileId: file.id, alt: "media" },
    { responseType: "text" }
  );
  return res.data;
}
