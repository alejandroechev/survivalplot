import type { KMResult, LogRankResult } from "@survivalplot/engine";

interface Props {
  results: KMResult[];
  logRank: LogRankResult | null;
}

export function ResultsPanel({ results, logRank }: Props) {
  const exportResults = () => {
    const lines = ["Group,Median Survival,CI Lower,CI Upper,Events,Subjects"];
    for (const r of results) {
      lines.push([
        r.group,
        r.medianSurvival !== null ? r.medianSurvival.toFixed(1) : "N/R",
        r.medianCILower !== null ? r.medianCILower.toFixed(1) : "",
        r.medianCIUpper !== null ? r.medianCIUpper.toFixed(1) : "",
        r.totalEvents,
        r.totalSubjects,
      ].join(","));
    }
    if (logRank) {
      lines.push("");
      lines.push("Log-Rank Test");
      lines.push("Chi-Square,p-value,Degrees of Freedom,Hazard Ratio");
      lines.push([
        logRank.chiSquare.toFixed(2),
        logRank.pValue < 0.001 ? "< 0.001" : logRank.pValue.toFixed(4),
        logRank.degreesOfFreedom,
        logRank.hazardRatio.toFixed(3),
      ].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "km-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
      <div className="export-row" style={{ marginTop: 8 }}>
        <button className="btn-secondary" onClick={exportResults} style={{ fontSize: 12, padding: "4px 10px" }}>
          📄 Export Results
        </button>
      </div>
    </div>
  );
}
