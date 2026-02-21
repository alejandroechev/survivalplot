import type { Observation, KMStep, KMResult } from "./types.js";

const Z_95 = 1.96;

/**
 * Compute Kaplan-Meier survival estimate for a single group of observations.
 * Handles ties (multiple events at the same time).
 */
export function kaplanMeier(observations: Observation[], groupName?: string): KMResult {
  const group = groupName ?? observations[0]?.group ?? "All";
  const data = observations.filter((o) => groupName == null || o.group === group);
  const sorted = [...data].sort((a, b) => a.time - b.time);

  const totalSubjects = sorted.length;
  let totalEvents = 0;
  let totalCensored = 0;

  const steps: KMStep[] = [];
  let survival = 1;
  let greenwoodSum = 0;
  let atRisk = totalSubjects;

  // Initial point: time 0, survival 1
  steps.push({
    time: 0,
    survival: 1,
    atRisk: totalSubjects,
    events: 0,
    censored: 0,
    variance: 0,
    ciLower: 1,
    ciUpper: 1,
  });

  // Group by unique times
  let i = 0;
  while (i < sorted.length) {
    const t = sorted[i].time;
    let events = 0;
    let censored = 0;

    // Count all observations at this time
    while (i < sorted.length && sorted[i].time === t) {
      if (sorted[i].event) events++;
      else censored++;
      i++;
    }

    totalEvents += events;
    totalCensored += censored;

    if (events > 0) {
      // KM step: S(t) = S(t-1) * (1 - d/n)
      survival *= 1 - events / atRisk;

      // Greenwood's formula cumulative sum: d / (n * (n - d))
      if (atRisk > events) {
        greenwoodSum += events / (atRisk * (atRisk - events));
      }

      const variance = survival * survival * greenwoodSum;
      const se = Math.sqrt(variance);
      const ciLower = Math.max(0, survival - Z_95 * se);
      const ciUpper = Math.min(1, survival + Z_95 * se);

      steps.push({
        time: t,
        survival,
        atRisk,
        events,
        censored,
        variance,
        ciLower,
        ciUpper,
      });
    }

    // Remove events + censored from at-risk
    atRisk -= events + censored;
  }

  // Compute median survival and CI
  const { median, ciLower: mCIL, ciUpper: mCIU } = computeMedian(steps);

  return {
    group,
    steps,
    medianSurvival: median,
    medianCILower: mCIL,
    medianCIUpper: mCIU,
    totalSubjects,
    totalEvents,
    totalCensored,
  };
}

/**
 * Compute median survival = first time S(t) ≤ 0.5
 * CI via Brookmeyer-Crowley: times where CI band crosses 0.5
 */
function computeMedian(steps: KMStep[]): {
  median: number | null;
  ciLower: number | null;
  ciUpper: number | null;
} {
  let median: number | null = null;
  let ciLower: number | null = null;
  let ciUpper: number | null = null;

  for (let i = 1; i < steps.length; i++) {
    if (median === null && steps[i].survival <= 0.5) {
      median = steps[i].time;
    }
    if (ciLower === null && steps[i].ciUpper <= 0.5) {
      ciLower = steps[i].time;
    }
    if (ciUpper === null && steps[i].ciLower <= 0.5) {
      ciUpper = steps[i].time;
    }
  }

  return { median, ciLower, ciUpper };
}

/**
 * Run KM analysis on all groups, returning one KMResult per group.
 */
export function kaplanMeierByGroup(observations: Observation[]): KMResult[] {
  const groups = [...new Set(observations.map((o) => o.group ?? "All"))];
  return groups.map((g) => kaplanMeier(observations, g));
}
