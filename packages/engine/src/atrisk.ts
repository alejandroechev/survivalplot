import type { KMResult, AtRiskRow } from "./types.js";

/**
 * Generate at-risk table rows for display below KM plot.
 * Returns counts at evenly spaced time points.
 */
export function generateAtRiskTable(
  results: KMResult[],
  numPoints?: number
): AtRiskRow[] {
  const maxTime = Math.max(
    ...results.flatMap((r) => r.steps.map((s) => s.time))
  );
  const n = numPoints ?? Math.min(6, Math.max(3, Math.ceil(maxTime / 5) + 1));
  const interval = maxTime / (n - 1);
  const timePoints = Array.from({ length: n }, (_, i) =>
    Math.round(i * interval * 100) / 100
  );

  return results.map((r) => ({
    group: r.group,
    counts: timePoints.map((t) => ({
      time: t,
      atRisk: countAtRisk(r, t),
    })),
  }));
}

function countAtRisk(result: KMResult, time: number): number {
  // At-risk = subjects who haven't had an event or been censored before this time
  // Find the last step at or before this time
  let atRisk = result.totalSubjects;
  for (let i = 1; i < result.steps.length; i++) {
    if (result.steps[i].time > time) break;
    atRisk = result.steps[i].atRisk - result.steps[i].events - result.steps[i].censored;
  }
  return Math.max(0, atRisk);
}
