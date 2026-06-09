"use client";

import { useMemo, useState } from "react";
import { GitCompareArrows, ArrowRight } from "lucide-react";
import { Card, CardHeader, SectionTitle, RiskBadge, InsightPanel } from "../ui";
import StaffingWaterfall from "../StaffingWaterfall";
import { computeModel } from "@/lib/calc";
import { SCENARIOS } from "@/lib/data";
import { KpiSummary } from "@/lib/types";
import { fmtUSDCompact, fmtNum, fmtSignedPct } from "@/lib/format";

type Cmp = "higher" | "lower";

interface Row {
  label: string;
  a: string;
  b: string;
  /** signed B − A for tone; omitted for non-numeric rows */
  diff?: number;
  better?: Cmp;
  /** formatted delta for display */
  deltaText?: string;
}

export default function ScenarioCompare() {
  const [aId, setAId] = useState(SCENARIOS[0].id); // Baseline
  const [bId, setBId] = useState(SCENARIOS[1].id); // Hiring Freeze

  const a = useMemo(() => {
    const s = SCENARIOS.find((x) => x.id === aId)!;
    return { s, k: computeModel(s.id, s.params).kpis };
  }, [aId]);
  const b = useMemo(() => {
    const s = SCENARIOS.find((x) => x.id === bId)!;
    return { s, k: computeModel(s.id, s.params).kpis };
  }, [bId]);

  const gap = (k: KpiSummary) => k.required - k.onboard;
  const ttt = (m: number) => (m >= 99 ? "Off track" : `${m} mo`);

  const rows: Row[] = [
    {
      label: "Annual personnel cost",
      a: fmtUSDCompact(a.k.annualCost),
      b: fmtUSDCompact(b.k.annualCost),
      diff: b.k.annualCost - a.k.annualCost,
      better: "lower",
      deltaText: fmtUSDCompact(b.k.annualCost - a.k.annualCost),
    },
    {
      label: "Mission coverage",
      a: `${a.k.coverage.toFixed(0)}%`,
      b: `${b.k.coverage.toFixed(0)}%`,
      diff: b.k.coverage - a.k.coverage,
      better: "higher",
      deltaText: `${b.k.coverage - a.k.coverage >= 0 ? "+" : ""}${(b.k.coverage - a.k.coverage).toFixed(0)} pts`,
    },
    {
      label: "Onboard FTE",
      a: fmtNum(a.k.onboard),
      b: fmtNum(b.k.onboard),
      diff: b.k.onboard - a.k.onboard,
      better: "higher",
      deltaText: `${b.k.onboard - a.k.onboard >= 0 ? "+" : ""}${fmtNum(b.k.onboard - a.k.onboard)}`,
    },
    {
      label: "Gap to requirement",
      a: fmtNum(gap(a.k)),
      b: fmtNum(gap(b.k)),
      diff: gap(b.k) - gap(a.k),
      better: "lower",
      deltaText: `${gap(b.k) - gap(a.k) >= 0 ? "+" : ""}${fmtNum(gap(b.k) - gap(a.k))}`,
    },
    {
      label: "Budget variance",
      a: fmtSignedPct(a.k.variancePct),
      b: fmtSignedPct(b.k.variancePct),
      diff: b.k.variance - a.k.variance,
      better: "higher",
      deltaText: fmtUSDCompact(b.k.variance - a.k.variance),
    },
    {
      label: "Time to target staffing",
      a: ttt(a.k.timeToTargetMonths),
      b: ttt(b.k.timeToTargetMonths),
      diff: b.k.timeToTargetMonths - a.k.timeToTargetMonths,
      better: "lower",
      deltaText: `${b.k.timeToTargetMonths - a.k.timeToTargetMonths >= 0 ? "+" : ""}${
        b.k.timeToTargetMonths - a.k.timeToTargetMonths
      } mo`,
    },
  ];

  const costDelta = b.k.annualCost - a.k.annualCost;
  const covDelta = b.k.coverage - a.k.coverage;

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Scenario A / B Compare"
        subtitle="Put two planning scenarios side by side to frame the leadership choice"
        icon={<GitCompareArrows className="h-4 w-4" />}
      />

      {/* Pickers */}
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <ScenarioPicker label="Scenario A" value={aId} onChange={setAId} accent="navy" />
        <div className="hidden justify-center sm:flex">
          <ArrowRight className="h-5 w-5 text-slate-400" />
        </div>
        <ScenarioPicker label="Scenario B" value={bId} onChange={setBId} accent="gold" />
      </div>

      {/* Side-by-side outcomes */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Outcomes Side by Side"
          subtitle="Δ shows Scenario B relative to Scenario A; green is the more favorable direction"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Metric</th>
                <th className="px-4 py-3 text-right font-medium">
                  A · {a.s.name}
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  B · {b.s.name}
                </th>
                <th className="px-4 py-3 text-right font-medium">Δ (B − A)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => {
                const flat = r.diff === undefined || Math.abs(r.diff) < 1e-9;
                const good =
                  r.diff !== undefined &&
                  r.better !== undefined &&
                  ((r.better === "higher" && r.diff > 0) ||
                    (r.better === "lower" && r.diff < 0));
                const tone = flat ? "text-slate-400" : good ? "text-emerald-600" : "text-red-600";
                return (
                  <tr key={r.label} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-navy-900">{r.label}</td>
                    <td className="px-4 py-3 text-right tabular text-slate-600">{r.a}</td>
                    <td className="px-4 py-3 text-right tabular font-semibold text-navy-900">
                      {r.b}
                    </td>
                    <td className={`px-4 py-3 text-right tabular font-medium ${tone}`}>
                      {flat ? "—" : r.deltaText}
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-4 py-3 font-semibold text-navy-900">Overall risk</td>
                <td className="px-4 py-3 text-right">
                  <RiskBadge level={a.k.risk} />
                </td>
                <td className="px-4 py-3 text-right">
                  <RiskBadge level={b.k.risk} />
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Staffing posture side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={`A · ${a.s.name}`} subtitle="Staffing posture" />
          <div className="p-5">
            <StaffingWaterfall
              onboard={a.k.onboard}
              authorized={a.k.authorized}
              required={a.k.required}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title={`B · ${b.s.name}`} subtitle="Staffing posture" />
          <div className="p-5">
            <StaffingWaterfall
              onboard={b.k.onboard}
              authorized={b.k.authorized}
              required={b.k.required}
            />
          </div>
        </Card>
      </div>

      <InsightPanel
        title="The choice in one line"
        tone={covDelta >= 0 ? "navy" : "amber"}
      >
        Moving from <strong>{a.s.name}</strong> to <strong>{b.s.name}</strong>{" "}
        {covDelta >= 0 ? "lifts" : "lowers"} mission coverage by{" "}
        <strong>{Math.abs(covDelta).toFixed(0)} points</strong> and{" "}
        {costDelta >= 0 ? "adds" : "saves"}{" "}
        <strong>{fmtUSDCompact(Math.abs(costDelta))}</strong> in annual personnel cost —{" "}
        {covDelta >= 0 && costDelta >= 0
          ? "a readiness-versus-cost tradeoff for leadership to weigh."
          : covDelta < 0 && costDelta < 0
          ? "lower cost at the expense of readiness."
          : covDelta >= 0 && costDelta < 0
          ? "more readiness at lower cost — a clear improvement."
          : "lower readiness at higher cost — generally unfavorable."}
      </InsightPanel>
    </div>
  );
}

function ScenarioPicker({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  accent: "navy" | "gold";
}) {
  const ring = accent === "navy" ? "focus:ring-navy-500" : "focus:ring-agency-accent";
  const dot = accent === "navy" ? "bg-navy-700" : "bg-agency-accent";
  const scenario = SCENARIOS.find((s) => s.id === value)!;
  return (
    <label className="block rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-navy-900 outline-none focus:ring-2 ${ring}`}
      >
        {SCENARIOS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs text-slate-500">{scenario.tagline}</p>
    </label>
  );
}
