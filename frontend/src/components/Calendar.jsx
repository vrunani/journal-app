import React, { useState } from "react";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateStr(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export default function Calendar({ entryDates, selectedDate, onSelectDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const entrySet = new Set(entryDates);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <div className="card">
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
        <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button className="cal-nav-btn" onClick={nextMonth}>›</button>
      </div>
      <div className="cal-grid">
        {DOW.map((d, i) => (
          <div className="cal-dow" key={i}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="cal-day empty" />;
          const dateStr = toDateStr(viewYear, viewMonth, day);
          const hasEntry = entrySet.has(dateStr);
          const isSelected = dateStr === selectedDate;
          return (
            <button
              key={i}
              className={`cal-day ${hasEntry ? "has-entry" : ""} ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectDate(dateStr)}
              title={hasEntry ? "Has an entry" : "No entry yet"}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
