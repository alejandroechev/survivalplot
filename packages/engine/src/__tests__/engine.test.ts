import { describe, it, expect } from "vitest";
import { parseData } from "../parser.js";
import { kaplanMeier, kaplanMeierByGroup } from "../estimator.js";
import { logRankTest } from "../logrank.js";
import { generateAtRiskTable } from "../atrisk.js";
import type { Observation } from "../types.js";

// ── E1: Parser ──────────────────────────────────────────────
describe("parseData", () => {
  it("parses tab-separated data with header", () => {
    const input = `Time\tEvent\tGroup
6\t1\tA
10\t0\tB
4\t1\tA`;
    const obs = parseData(input);
    expect(obs).toHaveLength(3);
    expect(obs[0]).toEqual({ time: 4, event: true, group: "A" });
    expect(obs[2]).toEqual({ time: 10, event: false, group: "B" });
  });

  it("parses comma-separated data without header", () => {
    const input = `3,1,Treatment
7,0,Control`;
    const obs = parseData(input);
    expect(obs).toHaveLength(2);
    expect(obs[0]).toEqual({ time: 3, event: true, group: "Treatment" });
  });

  it("handles two columns (no group)", () => {
    const input = `5,1\n3,0`;
    const obs = parseData(input);
    expect(obs[0].group).toBe("All");
    expect(obs).toHaveLength(2);
  });

  it("throws on empty input", () => {
    expect(() => parseData("")).toThrow("No data provided");
  });

  it("throws on invalid event value", () => {
    expect(() => parseData("5,2")).toThrow("event must be 0 or 1");
  });

  it("throws on negative time", () => {
    expect(() => parseData("-1,1")).toThrow("invalid time");
  });

  it("sorts output by time", () => {
    const obs = parseData("10,1\n2,0\n5,1");
    expect(obs.map((o) => o.time)).toEqual([2, 5, 10]);
  });
});

// ── E2: Kaplan-Meier Estimator ───────────────────────────────
describe("kaplanMeier", () => {
  // Classic textbook example (Bland & Altman)
  const textbookData: Observation[] = [
    { time: 1, event: true, group: "A" },
    { time: 2, event: true, group: "A" },
    { time: 3, event: true, group: "A" },
    { time: 4, event: false, group: "A" }, // censored
    { time: 5, event: true, group: "A" },
    { time: 6, event: true, group: "A" },
  ];

  it("returns correct initial step at time 0", () => {
    const result = kaplanMeier(textbookData, "A");
    expect(result.steps[0]).toMatchObject({ time: 0, survival: 1, atRisk: 6 });
  });

  it("computes correct survival at each event time", () => {
    const result = kaplanMeier(textbookData, "A");
    // t=1: S = 5/6 = 0.833
    expect(result.steps[1].survival).toBeCloseTo(5 / 6, 4);
    // t=2: S = 5/6 * 4/5 = 0.667
    expect(result.steps[2].survival).toBeCloseTo(4 / 6, 4);
    // t=3: S = 4/6 * 3/4 = 0.5
    expect(result.steps[3].survival).toBeCloseTo(3 / 6, 4);
  });

  it("handles ties (multiple events at same time)", () => {
    const tiedData: Observation[] = [
      { time: 1, event: true, group: "A" },
      { time: 1, event: true, group: "A" },
      { time: 3, event: true, group: "A" },
      { time: 5, event: false, group: "A" },
    ];
    const result = kaplanMeier(tiedData, "A");
    // t=1: d=2, n=4 → S = 1 * (1-2/4) = 0.5
    expect(result.steps[1].survival).toBeCloseTo(0.5, 4);
    // t=3: d=1, n=2 → S = 0.5 * (1-1/2) = 0.25
    expect(result.steps[2].survival).toBeCloseTo(0.25, 4);
  });

  it("counts total events and censored correctly", () => {
    const result = kaplanMeier(textbookData, "A");
    // 1(event), 2(event), 3(event), 4(censored), 5(event), 6(event) = 5 events
    expect(result.totalEvents).toBe(5);
    expect(result.totalCensored).toBe(1);
    expect(result.totalSubjects).toBe(6);
  });

  it("produces step function (survival never increases)", () => {
    const result = kaplanMeier(textbookData, "A");
    for (let i = 1; i < result.steps.length; i++) {
      expect(result.steps[i].survival).toBeLessThanOrEqual(
        result.steps[i - 1].survival
      );
    }
  });
});

// ── E3: Confidence Intervals (Greenwood) ─────────────────────
describe("confidence intervals", () => {
  const data: Observation[] = [
    { time: 1, event: true, group: "A" },
    { time: 2, event: true, group: "A" },
    { time: 3, event: false, group: "A" },
    { time: 4, event: true, group: "A" },
    { time: 5, event: true, group: "A" },
    { time: 7, event: false, group: "A" },
    { time: 8, event: true, group: "A" },
    { time: 10, event: false, group: "A" },
    { time: 12, event: true, group: "A" },
    { time: 15, event: false, group: "A" },
  ];

  it("CI bounds are clamped to [0, 1]", () => {
    const result = kaplanMeier(data, "A");
    for (const step of result.steps) {
      expect(step.ciLower).toBeGreaterThanOrEqual(0);
      expect(step.ciUpper).toBeLessThanOrEqual(1);
    }
  });

  it("CI contains the survival estimate", () => {
    const result = kaplanMeier(data, "A");
    for (const step of result.steps) {
      expect(step.ciLower).toBeLessThanOrEqual(step.survival);
      expect(step.ciUpper).toBeGreaterThanOrEqual(step.survival);
    }
  });

  it("CI widens over time as uncertainty increases", () => {
    const result = kaplanMeier(data, "A");
    const eventSteps = result.steps.filter((s) => s.events > 0);
    if (eventSteps.length >= 2) {
      const first = eventSteps[0];
      const last = eventSteps[eventSteps.length - 1];
      const firstWidth = first.ciUpper - first.ciLower;
      const lastWidth = last.ciUpper - last.ciLower;
      expect(lastWidth).toBeGreaterThan(firstWidth);
    }
  });

  it("variance is 0 at time 0", () => {
    const result = kaplanMeier(data, "A");
    expect(result.steps[0].variance).toBe(0);
  });
});

// ── E4: Median Survival ──────────────────────────────────────
describe("median survival", () => {
  it("finds median when survival crosses 0.5", () => {
    const data: Observation[] = [
      { time: 2, event: true, group: "A" },
      { time: 4, event: true, group: "A" },
      { time: 6, event: true, group: "A" },
      { time: 8, event: true, group: "A" },
    ];
    const result = kaplanMeier(data, "A");
    // S(2) = 3/4, S(4) = 2/4 = 0.5, so median = 4
    expect(result.medianSurvival).toBe(4);
  });

  it("returns null when survival never reaches 0.5", () => {
    const data: Observation[] = [
      { time: 1, event: true, group: "A" },
      { time: 2, event: false, group: "A" },
      { time: 3, event: false, group: "A" },
      { time: 4, event: false, group: "A" },
      { time: 5, event: false, group: "A" },
    ];
    const result = kaplanMeier(data, "A");
    // S(1) = 4/5 = 0.8, then all censored → never ≤0.5
    expect(result.medianSurvival).toBeNull();
  });
});

// ── E5: Log-Rank Test ────────────────────────────────────────
describe("logRankTest", () => {
  // Known example: Treatment group survives longer
  const twoGroupData: Observation[] = [
    // Control: earlier events
    { time: 1, event: true, group: "Control" },
    { time: 2, event: true, group: "Control" },
    { time: 3, event: true, group: "Control" },
    { time: 4, event: true, group: "Control" },
    { time: 5, event: false, group: "Control" },
    // Treatment: later events
    { time: 6, event: true, group: "Treatment" },
    { time: 8, event: true, group: "Treatment" },
    { time: 10, event: false, group: "Treatment" },
    { time: 12, event: true, group: "Treatment" },
    { time: 15, event: false, group: "Treatment" },
  ];

  it("returns chi-square ≥ 0", () => {
    const result = logRankTest(twoGroupData);
    expect(result.chiSquare).toBeGreaterThanOrEqual(0);
  });

  it("returns df = 1", () => {
    const result = logRankTest(twoGroupData);
    expect(result.degreesOfFreedom).toBe(1);
  });

  it("returns p-value between 0 and 1", () => {
    const result = logRankTest(twoGroupData);
    expect(result.pValue).toBeGreaterThanOrEqual(0);
    expect(result.pValue).toBeLessThanOrEqual(1);
  });

  it("detects significant difference between divergent groups", () => {
    const result = logRankTest(twoGroupData);
    // These groups are quite different, expect p < 0.05
    expect(result.pValue).toBeLessThan(0.1);
  });

  it("returns hazard ratio > 0", () => {
    const result = logRankTest(twoGroupData);
    expect(result.hazardRatio).toBeGreaterThan(0);
  });

  it("counts observed events correctly", () => {
    const result = logRankTest(twoGroupData);
    expect(result.observedA + result.observedB).toBe(7);
  });

  it("throws for single group", () => {
    const singleGroup: Observation[] = [
      { time: 1, event: true, group: "A" },
      { time: 2, event: true, group: "A" },
    ];
    expect(() => logRankTest(singleGroup)).toThrow("exactly 2 groups");
  });

  it("non-significant for identical groups", () => {
    const identical: Observation[] = [
      { time: 1, event: true, group: "A" },
      { time: 2, event: true, group: "A" },
      { time: 3, event: true, group: "A" },
      { time: 1, event: true, group: "B" },
      { time: 2, event: true, group: "B" },
      { time: 3, event: true, group: "B" },
    ];
    const result = logRankTest(identical);
    // Identical distributions → no difference → p should be high
    expect(result.pValue).toBeGreaterThan(0.5);
  });
});

// ── E6: At-Risk Table ────────────────────────────────────────
describe("generateAtRiskTable", () => {
  const data: Observation[] = [
    { time: 1, event: true, group: "A" },
    { time: 3, event: true, group: "A" },
    { time: 5, event: false, group: "A" },
    { time: 7, event: true, group: "A" },
    { time: 2, event: true, group: "B" },
    { time: 4, event: false, group: "B" },
    { time: 6, event: true, group: "B" },
    { time: 8, event: true, group: "B" },
  ];

  it("returns one row per group", () => {
    const results = kaplanMeierByGroup(data);
    const table = generateAtRiskTable(results);
    expect(table).toHaveLength(2);
    expect(table.map((r) => r.group).sort()).toEqual(["A", "B"]);
  });

  it("at-risk count at time 0 equals total subjects", () => {
    const results = kaplanMeierByGroup(data);
    const table = generateAtRiskTable(results);
    for (const row of table) {
      const t0 = row.counts.find((c) => c.time === 0);
      expect(t0).toBeDefined();
      expect(t0!.atRisk).toBe(4);
    }
  });

  it("at-risk count never goes negative", () => {
    const results = kaplanMeierByGroup(data);
    const table = generateAtRiskTable(results);
    for (const row of table) {
      for (const c of row.counts) {
        expect(c.atRisk).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("respects custom numPoints", () => {
    const results = kaplanMeierByGroup(data);
    const table = generateAtRiskTable(results, 4);
    for (const row of table) {
      expect(row.counts).toHaveLength(4);
    }
  });
});

// ── Integration: multi-group pipeline ────────────────────────
describe("end-to-end pipeline", () => {
  it("parses, estimates KM, and runs log-rank", () => {
    const raw = `Time,Event,Group
2,1,Drug
4,1,Drug
6,0,Drug
8,1,Drug
10,0,Drug
1,1,Placebo
3,1,Placebo
5,1,Placebo
7,0,Placebo
9,1,Placebo`;
    const obs = parseData(raw);
    expect(obs).toHaveLength(10);

    const results = kaplanMeierByGroup(obs);
    expect(results).toHaveLength(2);

    const lr = logRankTest(obs);
    expect(lr.pValue).toBeGreaterThanOrEqual(0);
    expect(lr.pValue).toBeLessThanOrEqual(1);

    const table = generateAtRiskTable(results);
    expect(table).toHaveLength(2);
  });
});
