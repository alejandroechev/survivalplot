import type { AtRiskRow } from "@survivalplot/engine";

interface Props {
  rows: AtRiskRow[];
}

export function AtRiskTable({ rows }: Props) {
  if (rows.length === 0) return null;
  const timePoints = rows[0].counts.map((c) => c.time);

  const exportTable = () => {
    const lines = ["Group," + timePoints.join(",")];
    for (const row of rows) {
      lines.push(row.group + "," + row.counts.map((c) => c.atRisk).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "at-risk-table.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
    <table className="at-risk-table">
      <thead>
        <tr>
          <th>Group</th>
          {timePoints.map((t) => (
            <th key={t}>{t}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.group}>
            <td style={{ fontWeight: 600, textAlign: "left" }}>{row.group}</td>
            {row.counts.map((c) => (
              <td key={c.time}>{c.atRisk}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    <div className="export-row" style={{ marginTop: 8 }}>
      <button className="btn-secondary" onClick={exportTable} style={{ fontSize: 12, padding: "4px 10px" }}>
        📄 Export Table
      </button>
    </div>
    </>
  );
}
