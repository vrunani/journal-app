import React, { useEffect, useState } from "react";
import { fetchEntry } from "../api.js";

export default function LetterView({ date }) {
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    fetchEntry(date)
      .then(setText)
      .finally(() => setLoading(false));
  }, [date]);

  if (!date) {
    return (
      <div className="card letter-view">
        <div className="letter-empty">Pick a date on the calendar to read that letter.</div>
      </div>
    );
  }

  return (
    <div className="card letter-view">
      <div className="entry-date-label">{date}</div>
      {loading && <div className="letter-empty">Loading...</div>}
      {!loading && text === null && (
        <div className="letter-empty">No letter was written on this day.</div>
      )}
      {!loading && text !== null && <div className="letter-body">{text}</div>}
    </div>
  );
}
