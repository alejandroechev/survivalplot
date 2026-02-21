import type { Observation } from "./types.js";

/**
 * Parse tab/comma-separated survival data.
 * Expected columns: Time, Event (1/0), Group (optional)
 * Supports header row detection.
 */
export function parseData(raw: string): Observation[] {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) throw new Error("No data provided");

  // Detect and skip header
  const firstFields = splitLine(lines[0]);
  const hasHeader = isNaN(Number(firstFields[0]));
  const dataLines = hasHeader ? lines.slice(1) : lines;

  if (dataLines.length === 0) throw new Error("No data rows found");

  const observations: Observation[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const fields = splitLine(dataLines[i]);
    if (fields.length < 2)
      throw new Error(`Row ${i + 1}: expected at least 2 columns (time, event)`);

    const time = Number(fields[0]);
    if (isNaN(time) || time < 0)
      throw new Error(`Row ${i + 1}: invalid time "${fields[0]}"`);

    const eventVal = Number(fields[1]);
    if (eventVal !== 0 && eventVal !== 1)
      throw new Error(`Row ${i + 1}: event must be 0 or 1, got "${fields[1]}"`);

    const group = fields.length >= 3 ? fields[2].trim() : "All";

    observations.push({ time, event: eventVal === 1, group });
  }

  // Sort by time
  observations.sort((a, b) => a.time - b.time);

  return observations;
}

function splitLine(line: string): string[] {
  // Support tab, comma, pipe, or multiple spaces
  return line.split(/[\t,|]|\s{2,}/).map((s) => s.trim()).filter((s) => s.length > 0);
}
