import type { AtRiskRow } from "@survivalplot/engine";

interface Props {
  rows: AtRiskRow[];
}

export function AtRiskTable({ rows }: Props) {
  if (rows.length === 0) return null;
  const timePoints = rows[0].counts.map((c) => c.time);

  return (
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
  );
}
