import { useState, useCallback, useRef } from "react";
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
import { SAMPLE_DATASETS } from "./samples/index.ts";

interface AnalysisState {
  kmResults: KMResult[];
  logRank: LogRankResult | null;
  atRisk: AtRiskRow[];
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("survivalplot-theme");
    const t = saved === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    return t;
  });
  const [rawData, setRawData] = useState(SAMPLE_DATASETS[0].data);
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("survivalplot-theme", next);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === "string") {
        setRawData(text);
        setAnalysis(null);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
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
        <select
          className="btn-secondary"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              setRawData(SAMPLE_DATASETS[Number(e.target.value)].data);
              setAnalysis(null);
            }
            e.target.value = "";
          }}
        >
          <option value="" disabled>📂 Samples</option>
          {SAMPLE_DATASETS.map((s, i) => (
            <option key={i} value={i}>{s.name}</option>
          ))}
        </select>
        <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
          📂 Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.txt"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
        <div className="toolbar-spacer" />
        <button className="btn-secondary" onClick={() => window.open('/intro.html', '_blank')}>
          📖 Guide
        </button>
        <button className="btn-secondary" onClick={() => window.open('https://github.com/alejandroechev/survivalplot/issues/new', '_blank')} title="Feedback">
          💬 Feedback
        </button>
        <button className="btn-secondary" onClick={toggleTheme} title="Toggle theme">
          {theme === "light" ? "🌙" : "☀️"}
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
