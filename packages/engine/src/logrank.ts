import type { Observation, LogRankResult } from "./types.js";

/**
 * Log-rank test comparing two groups.
 * Uses the Mantel-Haenszel form of the chi-square statistic.
 */
export function logRankTest(observations: Observation[]): LogRankResult {
  const groups = [...new Set(observations.map((o) => o.group ?? "All"))];
  if (groups.length !== 2) {
    throw new Error(`Log-rank test requires exactly 2 groups, got ${groups.length}`);
  }

  const [groupA, groupB] = groups;
  const sorted = [...observations].sort((a, b) => a.time - b.time);

  // Collect unique event times
  const eventTimes = [...new Set(sorted.filter((o) => o.event).map((o) => o.time))].sort(
    (a, b) => a - b
  );

  let nA = sorted.filter((o) => o.group === groupA).length;
  let nB = sorted.filter((o) => o.group === groupB).length;

  let observedA = 0;
  let expectedA = 0;
  let varianceSum = 0;

  let idxA = 0;
  let idxB = 0;
  const sortedA = sorted.filter((o) => o.group === groupA).sort((a, b) => a.time - b.time);
  const sortedB = sorted.filter((o) => o.group === groupB).sort((a, b) => a.time - b.time);

  for (const t of eventTimes) {
    // Count events and censored before this time
    while (idxA < sortedA.length && sortedA[idxA].time < t) {
      nA--;
      idxA++;
    }
    while (idxB < sortedB.length && sortedB[idxB].time < t) {
      nB--;
      idxB++;
    }

    // Count events at time t in each group
    let dA = 0;
    let cA = 0;
    while (idxA < sortedA.length && sortedA[idxA].time === t) {
      if (sortedA[idxA].event) dA++;
      else cA++;
      idxA++;
    }
    let dB = 0;
    let cB = 0;
    while (idxB < sortedB.length && sortedB[idxB].time === t) {
      if (sortedB[idxB].event) dB++;
      else cB++;
      idxB++;
    }

    const d = dA + dB;
    const n = nA + nB;

    if (n > 0) {
      observedA += dA;
      expectedA += (nA * d) / n;

      // Variance term
      if (n > 1) {
        varianceSum += (nA * nB * d * (n - d)) / (n * n * (n - 1));
      }
    }

    nA -= dA + cA;
    nB -= dB + cB;
  }

  const totalObsA = sorted.filter((o) => o.group === groupA && o.event).length;
  const totalObsB = sorted.filter((o) => o.group === groupB && o.event).length;
  const totalExpB = totalObsA + totalObsB - expectedA;

  // Chi-square using variance form: (O-E)^2 / V
  const chiSquare = varianceSum > 0 ? ((observedA - expectedA) ** 2) / varianceSum : 0;
  const pValue = 1 - chiSquareCDF(chiSquare, 1);

  // Simple hazard ratio estimate: (Oa/Ea) / (Ob/Eb)
  const hrA = expectedA > 0 ? totalObsA / expectedA : 1;
  const hrB = totalExpB > 0 ? totalObsB / totalExpB : 1;
  const hazardRatio = hrB > 0 ? hrA / hrB : 1;

  return {
    chiSquare,
    degreesOfFreedom: 1,
    pValue,
    observedA: totalObsA,
    expectedA,
    observedB: totalObsB,
    expectedB: totalExpB,
    hazardRatio,
  };
}

/**
 * Chi-square CDF using the regularized incomplete gamma function.
 * For df=1: CDF = erf(sqrt(x/2))
 */
function chiSquareCDF(x: number, df: number): number {
  if (x <= 0) return 0;
  if (df === 1) {
    return erf(Math.sqrt(x / 2));
  }
  // General case via incomplete gamma (not needed for df=1)
  return regularizedGammaP(df / 2, x / 2);
}

/** Error function approximation (Abramowitz & Stegun) */
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t) *
      Math.exp(-x * x);
  return sign * y;
}

/** Regularized incomplete gamma function P(a, x) via series expansion */
function regularizedGammaP(a: number, x: number): number {
  if (x === 0) return 0;
  let sum = 1 / a;
  let term = 1 / a;
  for (let n = 1; n < 200; n++) {
    term *= x / (a + n);
    sum += term;
    if (Math.abs(term) < 1e-12) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - lnGamma(a));
}

/** Log-gamma via Stirling's series */
function lnGamma(z: number): number {
  if (z <= 0) return Infinity;
  const c = [
    76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155,
    0.001208650973866179, -0.000005395239384953,
  ];
  let x = z;
  let y = z;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    ser += c[j] / ++y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}
