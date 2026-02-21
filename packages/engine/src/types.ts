/** A single observation: subject's time-to-event record */
export interface Observation {
  time: number;
  event: boolean; // true = event occurred, false = censored
  group?: string;
}

/** One step in the KM survival curve */
export interface KMStep {
  time: number;
  survival: number;
  atRisk: number;
  events: number;
  censored: number;
  variance: number; // Greenwood cumulative variance component
  ciLower: number;
  ciUpper: number;
}

/** Full result for one group */
export interface KMResult {
  group: string;
  steps: KMStep[];
  medianSurvival: number | null;
  medianCILower: number | null;
  medianCIUpper: number | null;
  totalSubjects: number;
  totalEvents: number;
  totalCensored: number;
}

/** Log-rank test comparing two groups */
export interface LogRankResult {
  chiSquare: number;
  degreesOfFreedom: number;
  pValue: number;
  observedA: number;
  expectedA: number;
  observedB: number;
  expectedB: number;
  hazardRatio: number;
}

/** At-risk table row for display */
export interface AtRiskRow {
  group: string;
  counts: { time: number; atRisk: number }[];
}
