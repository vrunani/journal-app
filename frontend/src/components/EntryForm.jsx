import React, { useState } from "react";
import { submitEntry } from "../api.js";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function EntryForm({ onSent }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // { ok: bool, message: string }
  const date = todayStr();

  async function handleSubmit() {
    if (!text.trim()) return;
    setSending(true);
    setStatus(null);
    try {
      const result = await submitEntry(date, text);
      if (result.errors) {
        setStatus({
          ok: false,
          message: `Partial failure - ${Object.entries(result.errors)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")}`,
        });
      } else {
        setStatus({ ok: true, message: "Sent and saved." });
        setText("");
        onSent?.(date);
      }
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card">
      <div className="entry-date-label">Today · {date}</div>
      <textarea
        className="letter-input"
        placeholder="Write today's letter..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="send-btn" onClick={handleSubmit} disabled={sending || !text.trim()}>
        {sending ? "Sending..." : "Send letter"}
      </button>
      {status && (
        <div className={`status-msg ${status.ok ? "" : "error"}`}>{status.message}</div>
      )}
    </div>
  );
}
