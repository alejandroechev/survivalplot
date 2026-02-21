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
    </div>
  );
}
