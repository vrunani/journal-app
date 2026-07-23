import { gmail } from "./googleClient.js";
import dotenv from "dotenv";
dotenv.config();

const { SENDER_EMAIL, RECEIVER_EMAIL } = process.env;

function encodeMessage(raw) {
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildMimeMessage({ from, to, subject, body }) {
  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    body,
  ];
  return messageParts.join("\n");
}

export async function sendLetterEmail(dateStr, text) {
  if (!SENDER_EMAIL || !RECEIVER_EMAIL) {
    throw new Error("SENDER_EMAIL / RECEIVER_EMAIL not configured in .env");
  }

  const raw = buildMimeMessage({
    from: SENDER_EMAIL,
    to: RECEIVER_EMAIL,
    subject: `Letter - ${dateStr}`,
    body: text,
  });

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodeMessage(raw) },
  });

  return res.data;
}
