"use client";

import { useMemo } from "react";
import {
  ClipboardList,
  AlertTriangle,
  Wallet,
  UserPlus,
  GitCompareArrows,
  MessageSquareQuote,
  ShieldHalf,
} from "lucide-react";
import { useModel } from "../model-context";
import { Card, CardHeader, SectionTitle, RiskBadge, Pill, CriticalityBadge } from "../ui";
import { computeModel } from "@/lib/calc";
import { DIVISIONS, SCENARIOS } from "@/lib/data";
import { fmtNum, fmtUSDCompact, fmtSignedPct } from "@/lib/format";

export default function BriefingView() {
  const { model, scenarioId } = useModel();
  const k = model.kpis;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  // Top 5 staffing risks.
  const staffingRisks = [...model.divisions]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  // Top 5 budget risks (most negative variance contributions).
  const totalAuth = DIVISIONS.reduce((s, x) => s + x.authorized, 0);
  const budgetRisks = model.divisions
    .map((d) => {
      const seed = DIVISIONS.find((x) => x.id === d.id)!;
      const planned = k.plannedBudget * (seed.authorized / totalAuth);
      return { name: d.name, variance: planned - d.annualCost, criticality: d.criticality };
    })
    .sort((a, b) => a.variance - b.variance)
    .slice(0, 5);

  // Recommended hiring actions — highest criticality x gap.
  const hiringActions = [...model.divisions]
    .filter((d) => d.gap > 0)
    .map((d) => ({
      ...d,
      priority: d.gap * (d.criticality === "Critical" ? 1.5 : d.criticality === "High" ? 1.15 : 0.85),
    }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);

  // Scenario tradeoffs — compute every scenario once.
  const scenarioCompare = useMemo(
    () =>
      SCENARIOS.map((s) => {
        const m = computeModel(s.id, s.params);
        return {
          id: s.id,
          name: s.name,
          cost: m.kpis.annualCost,
          coverage: m.kpis.coverage,
          variance: m.kpis.variance,
          variancePct: m.kpis.variancePct,
          gap: m.kpis.required - m.kpis.onboard,
          risk: m.kpis.risk,
          ttt: m.kpis.timeToTargetMonths,
        };
      }),
    []
  );

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Leadership Briefing View"
        subtitle="OCFO Resource Management Division — workforce posture and decision brief"
        icon={<ClipboardList className="h-4 w-4" />}
      />

      {/* Posture banner */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 bg-navy-900 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white/10 p-2 ring-1 ring-white/15">
              <ShieldHalf className="h-5 w-5 text-agency-accent" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-navy-200">
                Current Workforce Posture · {scenario.name}
              </div>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-navy-50">
                OCFO is operating at <strong>{fmtNum(k.onboard)}</strong> onboard FTE against{" "}
                <strong>{fmtNum(k.required)}</strong> mission-required and{" "}
                <strong>{fmtNum(k.authorized)}</strong> authorized positions —{" "}
                <strong>{k.coverage.toFixed(0)}%</strong> criticality-weighted coverage with{" "}
                <strong>{fmtNum(k.vacancies)}</strong> funded vacancies. Projected personnel cost of{" "}
                <strong>{fmtUSDCompact(k.annualCost)}</strong> runs{" "}
                <strong>{fmtSignedPct(k.variancePct)}</strong> against the planned topline.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[11px] uppercase tracking-wide text-navy-200">Overall Risk</div>
            <div className="mt-1">
              <RiskBadge level={k.risk} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Top staffing risks */}
        <Card>
          <CardHeader
            title="Top 5 Staffing Risks"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <ol className="divide-y divide-slate-100">
            {staffingRisks.map((d, i) => (
              <li key={d.id} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-semibold text-navy-700">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-navy-900">{d.name}</span>
                    <RiskBadge level={d.risk} />
                  </div>
                  <p className="text-xs text-slate-500">{d.riskDriver}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        {/* Top budget risks */}
        <Card>
          <CardHeader title="Top 5 Budget Risks" icon={<Wallet className="h-4 w-4" />} />
          <ol className="divide-y divide-slate-100">
            {budgetRisks.map((d, i) => (
              <li key={d.name} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-semibold text-navy-700">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-navy-900">{d.name}</span>
                    <CriticalityBadge level={d.criticality} />
                  </div>
                  <p className="text-xs text-slate-500">
                    {d.variance < 0
                      ? `Projected to exceed allocation by ${fmtUSDCompact(Math.abs(d.variance))}`
                      : `Projected ${fmtUSDCompact(d.variance)} under allocation (under-execution risk)`}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold tabular ${
                    d.variance < 0 ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {fmtUSDCompact(d.variance)}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Recommended hiring actions */}
      <Card>
        <CardHeader
          title="Recommended Hiring Actions"
          subtitle="Prioritized by mission criticality and shortfall against requirement"
          icon={<UserPlus className="h-4 w-4" />}
        />
        <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-3">
          {hiringActions.length === 0 && (
            <div className="bg-white p-6 text-sm text-slate-500">
              No net hiring required under this scenario — divisions are at or above requirement.
            </div>
          )}
          {hiringActions.map((d, i) => (
            <div key={d.id} className="bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-navy-900">
                  {i + 1}. {d.shortName}
                </span>
                <CriticalityBadge level={d.criticality} />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Hire <strong className="text-navy-900">{fmtNum(d.gap)}</strong> FTE to reach mission
                requirement; {fmtNum(d.vacancies)} funded vacancies available.
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Pill tone="navy">Coverage {d.coverage.toFixed(0)}%</Pill>
                <Pill tone={d.risk === "Severe" ? "red" : d.risk === "Elevated" ? "amber" : "slate"}>
                  {d.risk} risk
                </Pill>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Scenario tradeoffs */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Tradeoffs Between Scenarios"
          subtitle="Side-by-side outcomes across the prebuilt planning scenarios"
          icon={<GitCompareArrows className="h-4 w-4" />}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Scenario</th>
                <th className="px-4 py-3 text-right font-medium">Annual Cost</th>
                <th className="px-4 py-3 text-right font-medium">Coverage</th>
                <th className="px-4 py-3 text-right font-medium">Vacancy Gap</th>
                <th className="px-4 py-3 text-right font-medium">Variance</th>
                <th className="px-4 py-3 text-right font-medium">Time to Target</th>
                <th className="px-4 py-3 text-center font-medium">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scenarioCompare.map((s) => (
                <tr
                  key={s.id}
                  className={`hover:bg-slate-50/70 ${s.id === scenarioId ? "bg-navy-50/50" : ""}`}
                >
                  <td className="px-4 py-3 font-medium text-navy-900">
                    {s.name}
                    {s.id === scenarioId && (
                      <span className="ml-2 text-[11px] font-normal text-navy-500">(active)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular">{fmtUSDCompact(s.cost)}</td>
                  <td className="px-4 py-3 text-right tabular">{s.coverage.toFixed(0)}%</td>
                  <td className="px-4 py-3 text-right tabular">{fmtNum(s.gap)}</td>
                  <td
                    className={`px-4 py-3 text-right tabular font-medium ${
                      s.variance >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {fmtSignedPct(s.variancePct)}
                  </td>
                  <td className="px-4 py-3 text-right tabular">
                    {s.ttt >= 99 ? "Off track" : `${s.ttt} mo`}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <RiskBadge level={s.risk} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Talking points */}
      <Card>
        <CardHeader
          title="Suggested Talking Points for OCFO Leadership"
          icon={<MessageSquareQuote className="h-4 w-4" />}
        />
        <ul className="space-y-2.5 p-5 text-sm leading-relaxed text-slate-700">
          <TalkingPoint>
            We are staffed to <strong>{k.coverage.toFixed(0)}%</strong> of mission requirement; the
            shortfall concentrates in our highest-criticality divisions —{" "}
            <strong>{staffingRisks[0]?.name}</strong> and{" "}
            <strong>{staffingRisks[1]?.name}</strong>.
          </TalkingPoint>
          <TalkingPoint>
            Under the active plan, personnel cost runs{" "}
            <strong>{fmtSignedPct(k.variancePct)}</strong> against the topline
            {k.variance < 0
              ? " — we need either a topline adjustment or a deliberate slowdown in hiring pace."
              : k.variancePct > 0.05
              ? " — we are under-executing and leaving appropriated funds and capacity on the table."
              : " — the plan is executable as programmed."}
          </TalkingPoint>
          <TalkingPoint>
            {(() => {
              const accel = scenarioCompare.find((s) => s.id === "accelerated-hiring");
              const base = scenarioCompare.find((s) => s.id === "baseline");
              if (accel && base)
                return (
                  <>
                    Accelerated Hiring lifts coverage to{" "}
                    <strong>{accel.coverage.toFixed(0)}%</strong> (from{" "}
                    <strong>{base.coverage.toFixed(0)}%</strong>) but adds{" "}
                    <strong>{fmtUSDCompact(accel.cost - base.cost)}</strong> in annual cost — a
                    readiness-vs-cost tradeoff for leadership to weigh.
                  </>
                );
              return null;
            })()}
          </TalkingPoint>
          <TalkingPoint>
            Converting premium contractor capacity to federal FTE in the Financial Systems and
            Internal Controls portfolios reduces recurring cost and conversion risk while deepening
            in-house capability.
          </TalkingPoint>
          <TalkingPoint>
            Our recommended near-term action is to prioritize fills in{" "}
            <strong>{hiringActions[0]?.shortName ?? "critical divisions"}</strong> and{" "}
            <strong>{hiringActions[1]?.shortName ?? "supporting offices"}</strong>, sequencing
            recruitment to protect mission-critical delivery first.
          </TalkingPoint>
        </ul>
      </Card>
    </div>
  );
}

function TalkingPoint({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-agency-accent" />
      <span>{children}</span>
    </li>
  );
}
