import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { KMResult } from "@survivalplot/engine";
import { useState, useRef } from "react";
import { toPng, toSvg } from "html-to-image";

const COLORS = ["#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed"];

interface Props {
  results: KMResult[];
}

/**
 * Build step-function data: duplicate each point so the line is horizontal
 * until the next event, then drops vertically.
 */
function buildStepData(results: KMResult[]) {
  const allTimes = new Set<number>();
  for (const r of results) {
    for (const s of r.steps) allTimes.add(s.time);
  }
  const times = [...allTimes].sort((a, b) => a - b);

  const rows: Record<string, number | null>[] = [];

  for (const r of results) {
    const g = r.group;
    let stepIdx = 0;
    for (let i = 0; i < times.length; i++) {
      const t = times[i];
      // Advance to the step at or before this time
      while (
        stepIdx < r.steps.length - 1 &&
        r.steps[stepIdx + 1].time <= t
      ) {
        stepIdx++;
      }
      const step = r.steps[stepIdx];

      // Find or create the row for this time
      let row = rows.find((r) => r.time === t);
      if (!row) {
        row = { time: t };
        rows.push(row);
      }
      row[`${g}`] = step.survival;
      row[`${g}_lower`] = step.ciLower;
      row[`${g}_upper`] = step.ciUpper;

      // Add censoring marks
      const censAt = r.steps.find(
        (s) => s.time === t && s.censored > 0
      );
      if (censAt) {
        row[`${g}_cens`] = step.survival;
      }
    }
  }

  rows.sort((a, b) => (a.time as number) - (b.time as number));

  // Build true step data: for each event step, insert a point just before it
  // at the previous survival level
  const stepRows: Record<string, number | null>[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (i > 0) {
      // Insert horizontal segment: same time as current row, but previous survival
      const prev = rows[i - 1];
      const curr = rows[i];
      const bridge: Record<string, number | null> = {
        time: curr.time,
      };
      let needsBridge = false;
      for (const r of results) {
        const g = r.group;
        const prevVal = prev[g] as number | undefined;
        const currVal = curr[g] as number | undefined;
        if (
          prevVal !== undefined &&
          currVal !== undefined &&
          prevVal !== currVal
        ) {
          bridge[g] = prevVal;
          bridge[`${g}_lower`] = prev[`${g}_lower`] as number;
          bridge[`${g}_upper`] = prev[`${g}_upper`] as number;
          needsBridge = true;
        } else if (currVal !== undefined) {
          bridge[g] = currVal;
          bridge[`${g}_lower`] = curr[`${g}_lower`] as number | null;
          bridge[`${g}_upper`] = curr[`${g}_upper`] as number | null;
        }
      }
      if (needsBridge) {
        stepRows.push(bridge);
      }
    }
    stepRows.push(rows[i]);
  }

  return stepRows;
}

export function KMChart({ results }: Props) {
  const [showCI, setShowCI] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);

  const data = buildStepData(results);

  const exportPng = async () => {
    if (!chartRef.current) return;
    const url = await toPng(chartRef.current, { backgroundColor: "#ffffff" });
    const a = document.createElement("a");
    a.href = url;
    a.download = "km-curve.png";
    a.click();
  };

  const exportSvg = async () => {
    if (!chartRef.current) return;
    const url = await toSvg(chartRef.current, { backgroundColor: "#ffffff" });
    const a = document.createElement("a");
    a.href = url;
    a.download = "km-curve.svg";
    a.click();
  };

  const exportCsv = () => {
    const headers = ["Time", ...results.map((r) => `${r.group}_Survival`), ...results.map((r) => `${r.group}_CI_Lower`), ...results.map((r) => `${r.group}_CI_Upper`)];
    const csvRows = [headers.join(",")];
    for (const row of data) {
      const vals = [
        row.time,
        ...results.map((r) => row[r.group] ?? ""),
        ...results.map((r) => row[`${r.group}_lower`] ?? ""),
        ...results.map((r) => row[`${r.group}_upper`] ?? ""),
      ];
      csvRows.push(vals.join(","));
    }
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "km-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
        <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={showCI}
            onChange={(e) => setShowCI(e.target.checked)}
          />
          95% CI
        </label>
        <div style={{ marginLeft: "auto" }} className="export-row">
          <button className="btn-secondary" onClick={exportPng} style={{ fontSize: 12, padding: "4px 10px" }}>
            📷 PNG
          </button>
          <button className="btn-secondary" onClick={exportSvg} style={{ fontSize: 12, padding: "4px 10px" }}>
            📐 SVG
          </button>
          <button className="btn-secondary" onClick={exportCsv} style={{ fontSize: 12, padding: "4px 10px" }}>
            📊 CSV
          </button>
        </div>
      </div>
      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="time"
              label={{ value: "Time", position: "insideBottomRight", offset: -5, fontSize: 12 }}
              type="number"
              domain={[0, "dataMax"]}
            />
            <YAxis
              domain={[0, 1]}
              tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
              label={{ value: "Survival Probability", angle: -90, position: "insideLeft", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${(value * 100).toFixed(1)}%`,
                name,
              ]}
              labelFormatter={(label: number) => `Time: ${label}`}
            />
            <Legend />
            <ReferenceLine y={0.5} stroke="#9ca3af" strokeDasharray="6 3" label={{ value: "50%", fontSize: 11 }} />

            {results.map((r, i) => (
              <Line
                key={r.group}
                type="stepAfter"
                dataKey={r.group}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            ))}

            {showCI &&
              results.map((r, i) => (
                <Area
                  key={`${r.group}_ci`}
                  type="stepAfter"
                  dataKey={`${r.group}_upper`}
                  stroke="none"
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.08}
                  connectNulls
                  isAnimationActive={false}
                  legendType="none"
                />
              ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
