import express from "express";
import { sendLetterEmail } from "./gmailService.js";
import {
  saveLetterToDrive,
  listEntryDates,
  getLetterByDate,
  createJournalFolder,
} from "./driveService.js";

export const router = express.Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// One-time setup helper: creates the Drive folder that will store letters.
// Call this once, then copy the returned folderId into .env as DRIVE_FOLDER_ID
// and restart the server.
router.post("/setup-folder", async (req, res) => {
  try {
    const folder = await createJournalFolder();
    res.json({
      message: "Folder created. Add this to your .env as DRIVE_FOLDER_ID, then restart the server.",
      folderId: folder.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/entries  { date: "2026-07-21", text: "..." }
// Sends the email AND saves the .txt file to Drive.
router.post("/entries", async (req, res) => {
  const { date, text } = req.body;

  if (!date || !DATE_RE.test(date)) {
    return res.status(400).json({ error: "date must be in YYYY-MM-DD format" });
  }
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "text is required" });
  }

  try {
    // Run both actions; if either fails we still want to know about the other's result.
    const [emailResult, driveResult] = await Promise.allSettled([
      sendLetterEmail(date, text),
      saveLetterToDrive(date, text),
    ]);

    const errors = {};
    if (emailResult.status === "rejected") errors.email = emailResult.reason.message;
    if (driveResult.status === "rejected") errors.drive = driveResult.reason.message;

    if (Object.keys(errors).length > 0) {
      return res.status(207).json({
        message: "Partial success",
        emailSent: emailResult.status === "fulfilled",
        savedToDrive: driveResult.status === "fulfilled",
        errors,
      });
    }

    res.json({ message: "Letter sent and saved", date });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/entries/dates -> ["2026-07-01", "2026-07-05", ...]
router.get("/entries/dates", async (req, res) => {
  try {
    const dates = await listEntryDates();
    res.json({ dates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/entries/:date -> { date, text }
router.get("/entries/:date", async (req, res) => {
  const { date } = req.params;
  if (!DATE_RE.test(date)) {
    return res.status(400).json({ error: "date must be in YYYY-MM-DD format" });
  }

  try {
    const text = await getLetterByDate(date);
    if (text === null) {
      return res.status(404).json({ error: "No entry found for this date" });
    }
    res.json({ date, text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
