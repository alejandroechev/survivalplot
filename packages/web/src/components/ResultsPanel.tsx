import type { KMResult, LogRankResult } from "@survivalplot/engine";

interface Props {
  results: KMResult[];
  logRank: LogRankResult | null;
}

export function ResultsPanel({ results, logRank }: Props) {
  return (
    <div className="panel" style={{ marginTop: 16 }}>
      <h2>Results</h2>
      <div className="results-grid">
        {results.map((r) => (
          <div key={r.group} className="stat-card">
            <div className="label">{r.group}</div>
            <div className="value">
              {r.medianSurvival !== null
                ? r.medianSurvival.toFixed(1)
                : "N/R"}
            </div>
            <div className="sub">
              Median survival
              {r.medianCILower !== null && r.medianCIUpper !== null
                ? ` (${r.medianCILower.toFixed(1)}–${r.medianCIUpper.toFixed(1)})`
                : ""}
            </div>
            <div className="sub" style={{ marginTop: 4 }}>
              {r.totalEvents} events / {r.totalSubjects} subjects
            </div>
          </div>
        ))}

        {logRank && (
          <>
            <div className="stat-card">
              <div className="label">Log-Rank p-value</div>
              <div className="value" style={{ color: logRank.pValue < 0.05 ? "#dc2626" : "#059669" }}>
                {logRank.pValue < 0.001
                  ? "< 0.001"
                  : logRank.pValue.toFixed(4)}
              </div>
              <div className="sub">
                χ² = {logRank.chiSquare.toFixed(2)}, df = {logRank.degreesOfFreedom}
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Hazard Ratio</div>
              <div className="value">{logRank.hazardRatio.toFixed(3)}</div>
              <div className="sub">
                O/E: {logRank.observedA}/{logRank.expectedA.toFixed(1)} vs{" "}
                {logRank.observedB}/{logRank.expectedB.toFixed(1)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
