import { useState, useCallback } from "react";
import {
  parseData,
  kaplanMeierByGroup,
  logRankTest,
  generateAtRiskTable,
  type KMResult,
  type LogRankResult,
  type AtRiskRow,
} from "@survivalplot/engine";
import { DataEntry } from "./components/DataEntry.tsx";
import { KMChart } from "./components/KMChart.tsx";
import { ResultsPanel } from "./components/ResultsPanel.tsx";
import { AtRiskTable } from "./components/AtRiskTable.tsx";

const SAMPLE_DATA = `Time\tEvent\tGroup
6\t1\tTreatment
6\t1\tTreatment
6\t1\tTreatment
7\t1\tTreatment
10\t0\tTreatment
13\t1\tTreatment
16\t1\tTreatment
22\t1\tTreatment
23\t1\tTreatment
6\t1\tControl
9\t1\tControl
10\t1\tControl
11\t0\tControl
17\t1\tControl
19\t1\tControl
20\t1\tControl
25\t0\tControl
32\t1\tControl
32\t1\tControl
34\t1\tControl
35\t0\tControl
1\t1\tControl
1\t1\tControl
2\t1\tControl
2\t1\tControl
3\t1\tControl
4\t1\tControl
4\t1\tControl
5\t1\tControl
5\t1\tControl`;

interface AnalysisState {
  kmResults: KMResult[];
  logRank: LogRankResult | null;
  atRisk: AtRiskRow[];
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [rawData, setRawData] = useState(SAMPLE_DATA);
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const analyze = useCallback(() => {
    try {
      setError(null);
      const observations = parseData(rawData);
      const kmResults = kaplanMeierByGroup(observations);
      const groups = [...new Set(observations.map((o) => o.group))];
      const logRank = groups.length === 2 ? logRankTest(observations) : null;
      const atRisk = generateAtRiskTable(kmResults);
      setAnalysis({ kmResults, logRank, atRisk });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setAnalysis(null);
    }
  }, [rawData]);

  return (
    <div className="app">
      <div className="toolbar">
        <h1>
          <span>Survival</span>Plot
        </h1>
        <button className="btn-primary" onClick={analyze}>
          ▶ Analyze
        </button>
        <button className="btn-secondary" onClick={() => window.open('/intro.html', '_blank')}>
          📖 Guide
        </button>
        <button className="btn-secondary" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️"} Theme
        </button>
      </div>

      <div className="grid">
        <div>
          <DataEntry value={rawData} onChange={setRawData} onAnalyze={analyze} />
          {error && <div className="error-msg">⚠ {error}</div>}
          {analysis && (
            <ResultsPanel
              results={analysis.kmResults}
              logRank={analysis.logRank}
            />
          )}
        </div>

        <div>
          {analysis && (
            <>
              <div className="panel chart-container" id="km-chart-panel">
                <h2>Kaplan-Meier Survival Curve</h2>
                <KMChart results={analysis.kmResults} />
              </div>
              <div className="panel" style={{ marginTop: 16 }}>
                <h2>Number at Risk</h2>
                <AtRiskTable rows={analysis.atRisk} />
              </div>
            </>
          )}
          {!analysis && (
            <div className="panel chart-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "var(--text-muted)" }}>
                Paste survival data and click <strong>Analyze</strong> to generate KM curves.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
