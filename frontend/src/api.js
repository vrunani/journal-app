const BASE = "/api";

export async function submitEntry(date, text) {
  const res = await fetch(`${BASE}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, text }),
  });
  const data = await res.json();
  if (!res.ok && res.status !== 207) {
    throw new Error(data.error || "Failed to submit entry");
  }
  return data;
}

export async function fetchEntryDates() {
  const res = await fetch(`${BASE}/entries/dates`);
  if (!res.ok) throw new Error("Failed to fetch dates");
  const data = await res.json();
  return data.dates;
}

export async function fetchEntry(date) {
  const res = await fetch(`${BASE}/entries/${date}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch entry");
  const data = await res.json();
  return data.text;
}
