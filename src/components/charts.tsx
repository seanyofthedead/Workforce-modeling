"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiscalYearPoint } from "@/lib/types";
import { fmtUSDCompact, fmtNum } from "@/lib/format";

const NAVY = "#1f3a59";
const NAVY_LIGHT = "#5a83a8";
const GOLD = "#b8842c";
const RED = "#dc2626";
const EMERALD = "#059669";
const AMBER = "#d97706";

const axisStyle = { fontSize: 11, fill: "#64748b" };

function PanelTooltip({
  active,
  payload,
  label,
  fmt,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  fmt: (v: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-panel">
      <div className="mb-1 font-semibold text-navy-900">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-medium text-navy-900">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// --- Workforce cost trend by fiscal year ----------------------------------

export function CostTrendChart({
  data,
  plannedBudget,
}: {
  data: FiscalYearPoint[];
  /** Planned personnel topline; drawn as a reference line when provided. */
  plannedBudget?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={NAVY} stopOpacity={0.35} />
            <stop offset="100%" stopColor={NAVY} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="fyShort" tick={axisStyle} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmtUSDCompact(v)}
          width={56}
        />
        <Tooltip content={<PanelTooltip fmt={fmtUSDCompact} />} />
        {plannedBudget != null && (
          <ReferenceLine
            y={plannedBudget}
            stroke={RED}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Planned topline ${fmtUSDCompact(plannedBudget)}`,
              position: "insideTopRight",
              fill: RED,
              fontSize: 10,
              fontWeight: 600,
            }}
          />
        )}
        <Area
          type="monotone"
          dataKey="cost"
          name="Personnel cost"
          stroke={NAVY}
          strokeWidth={2.5}
          fill="url(#costFill)"
          dot={{ r: 3, fill: NAVY }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// --- FTE demand vs supply -------------------------------------------------

export function DemandSupplyChart({ data }: { data: FiscalYearPoint[] }) {
  // Shade the shortfall (demand above supply) as a stacked area on top of an
  // invisible base equal to the filled line — so the red band fills the gap.
  const projected = data
    .filter((d) => !d.historical)
    .map((d) => ({
      ...d,
      filledBase: d.filled,
      shortfall: Math.max(0, d.required - d.filled),
    }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={projected} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="gapFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={RED} stopOpacity={0.22} />
            <stop offset="100%" stopColor={RED} stopOpacity={0.06} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="fyShort" tick={axisStyle} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={42} />
        <Tooltip content={<PanelTooltip fmt={fmtNum} />} />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          iconType="plainline"
          payload={[
            {
              value: "Required FTE (demand)",
              type: "plainline",
              color: GOLD,
              id: "required",
              payload: { strokeDasharray: "5 4" },
            },
            {
              value: "Filled FTE (supply)",
              type: "plainline",
              color: NAVY,
              id: "filled",
              payload: { strokeDasharray: "0" },
            },
            {
              value: "Coverage gap",
              type: "square",
              color: RED,
              id: "shortfall",
              payload: { strokeDasharray: "0" },
            },
          ]}
        />
        {/* invisible base lifts the shortfall band up to the supply line */}
        <Area
          type="monotone"
          dataKey="filledBase"
          stackId="gap"
          stroke="none"
          fill="none"
          legendType="none"
          tooltipType="none"
          activeDot={false}
        />
        <Area
          type="monotone"
          dataKey="shortfall"
          name="Coverage gap"
          stackId="gap"
          stroke="none"
          fill="url(#gapFill)"
          legendType="none"
          activeDot={false}
        />
        <Line
          type="monotone"
          dataKey="required"
          name="Required FTE (demand)"
          stroke={GOLD}
          strokeWidth={2.5}
          strokeDasharray="5 4"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="filled"
          name="Filled FTE (supply)"
          stroke={NAVY}
          strokeWidth={2.5}
          dot={{ r: 3, fill: NAVY }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// --- Vacancy rate by division ---------------------------------------------

export function VacancyByDivisionChart({
  data,
}: {
  data: { name: string; rate: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 28, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
        <XAxis
          type="number"
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "#334155" }}
          tickLine={false}
          axisLine={false}
          width={104}
        />
        <Tooltip content={<PanelTooltip fmt={(v) => `${v.toFixed(1)}%`} />} />
        <ReferenceLine
          x={12}
          stroke={AMBER}
          strokeDasharray="4 4"
          label={{ value: "Target ≤12%", position: "top", fill: AMBER, fontSize: 10, fontWeight: 600 }}
        />
        <Bar dataKey="rate" name="Vacancy rate" radius={[0, 4, 4, 0]} barSize={14}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.rate >= 18 ? RED : d.rate >= 12 ? AMBER : NAVY_LIGHT}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// --- Budget variance by organization --------------------------------------

export function VarianceByOrgChart({
  data,
}: {
  data: { name: string; variance: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#334155" }}
          tickLine={false}
          axisLine={{ stroke: "#e2e8f0" }}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmtUSDCompact(v)}
          width={56}
        />
        <Tooltip content={<PanelTooltip fmt={fmtUSDCompact} />} />
        <ReferenceLine y={0} stroke="#94a3b8" />
        <Bar dataKey="variance" name="Variance" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.variance >= 0 ? EMERALD : RED} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// --- Grade mix: current vs recommended ------------------------------------

export function GradeMixChart({
  data,
}: {
  data: { grade: string; current: number; recommended: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="grade" tick={axisStyle} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={42} />
        <Tooltip content={<PanelTooltip fmt={fmtNum} />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="current" name="Current mix" fill={NAVY_LIGHT} radius={[3, 3, 0, 0]} barSize={16} />
        <Bar
          dataKey="recommended"
          name="Recommended mix"
          fill={NAVY}
          radius={[3, 3, 0, 0]}
          barSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// --- Variance by grade level ----------------------------------------------

export function VarianceByGradeChart({
  data,
}: {
  data: { grade: string; costImpact: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="grade" tick={axisStyle} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmtUSDCompact(v)}
          width={56}
        />
        <Tooltip content={<PanelTooltip fmt={fmtUSDCompact} />} />
        <ReferenceLine y={0} stroke="#94a3b8" />
        <Bar dataKey="costImpact" name="Cost impact to align mix" radius={[3, 3, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.costImpact >= 0 ? GOLD : EMERALD} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
