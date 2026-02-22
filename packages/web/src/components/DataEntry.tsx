interface Props {
  value: string;
  onChange: (v: string) => void;
  onAnalyze: () => void;
}

export function DataEntry({ value, onChange, onAnalyze }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onAnalyze();
    }
  };

  const exportData = () => {
    const blob = new Blob([value], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "survival-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel">
      <h2>Data Entry</h2>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
        Paste: <code>Time | Event (1/0) | Group</code> — tab, comma, or pipe separated.
        Press <kbd>Ctrl+Enter</kbd> to analyze.
      </p>
      <textarea
        rows={14}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        placeholder="Time  Event  Group&#10;6     1      Treatment&#10;10    0      Control"
      />
      <div className="export-row" style={{ marginTop: 8 }}>
        <button className="btn-secondary" onClick={exportData} style={{ fontSize: 12, padding: "4px 10px" }}>
          📄 Export Data
        </button>
      </div>
    </div>
  );
}
