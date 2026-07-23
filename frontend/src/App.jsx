import React, { useEffect, useState } from "react";
import Calendar from "./components/Calendar.jsx";
import EntryForm from "./components/EntryForm.jsx";
import LetterView from "./components/LetterView.jsx";
import { fetchEntryDates } from "./api.js";

export default function App() {
  const [entryDates, setEntryDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  async function refreshDates() {
    try {
      const dates = await fetchEntryDates();
      setEntryDates(dates);
    } catch (err) {
      console.error("Failed to load entry dates:", err);
    }
  }

  useEffect(() => {
    refreshDates();
  }, []);

  return (
    <>
      <h1 className="title">Our Letters</h1>
      <div className="subtitle">A letter a day, kept safe</div>
      <div className="layout">
        <Calendar
          entryDates={entryDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        <div style={{ display: "grid", gap: "24px" }}>
          <EntryForm
            onSent={(date) => {
              refreshDates();
              setSelectedDate(date);
            }}
          />
          <LetterView date={selectedDate} />
        </div>
      </div>
    </>
  );
}
