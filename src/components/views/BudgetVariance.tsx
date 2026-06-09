"use client";

import { Scale, FileText } from "lucide-react";
import { useModel } from "../model-context";
import { Card, CardHeader, SectionTitle, InsightPanel, Pill } from "../ui";
import { StatTile } from "../kpi";
import { VarianceByOrgChart, VarianceByGradeChart } from "../charts";
import { DIVISIONS, SCENARIOS } from "@/lib/data";
import { fmtUSDCompact, fmtUSD, fmtSignedPct, fmtNum } from "@/lib/format";

export default function BudgetVariance() {
  const { model, scenarioId, params } = useModel();
  const k = model.kpis;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  const totalAuth = DIVISIONS.reduce((s, x) => s + x.authorized, 0);
  const orgVariance = model.divisions.map((d) => {
    const seed = DIVISIONS.find((x) => x.id === d.id)!;
    const planned = k.plannedBudget * (seed.authorized / totalAuth);
    return {
      id: d.id,
      name: d.shortName,
      planned,
      projected: d.annualCost,
      variance: planned - d.annualCost,
    };
  });

  const gradeVariance = model.gradeRollup.map((r) => ({
    grade: r.grade,
    costImpact: r.costImpact,
  }));

  // Variance drivers (qualitative attribution).
  const drivers = [
    {
      label: "Hiring pace",
      effect: params.hiringPace > 0.5 ? "Increases cost" : "Suppresses cost",
      tone: params.hiringPace > 0.5 ? ("amber" as const) : ("emerald" as const),
      note: `Filling ${(params.hiringPace * 100).toFixed(0)}% of the gap per year drives onboard cost.`,
    },
    {
      label: "Pay raise",
      effect: `${(params.payRaisePct * 100).toFixed(1)}% compounding`,
      tone: "amber" as const,
      note: "Locality and pay adjustments lift the loaded cost base each fiscal year.",
    },
    {
      label: "Contractor conversion",
      effect:
        params.contractorConversionPct > 0 ? "Lowers recurring cost" : "No conversion applied",
      tone: params.contractorConversionPct > 0 ? ("emerald" as const) : ("slate" as const),
      note: "Converting premium contractor capacity to federal FTE reduces unit cost over time.",
    },
    {
      label: "Budget topline",
      effect: fmtSignedPct(params.budgetDeltaPct, 0),
      tone: params.budgetDeltaPct >= 0 ? ("emerald" as const) : ("red" as const),
      note: "Change to the planned personnel appropriation against which cost is measured.",
    },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Budget Variance Analysis"
        subtitle="How the workforce plan compares to the planned personnel budget"
        icon={<Scale className="h-4 w-4" />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Planned Personnel Budget" value={fmtUSDCompact(k.plannedBudget)} />
        <StatTile label="Projected Personnel Cost" value={fmtUSDCompact(k.annualCost)} />
        <StatTile
          label={k.variance >= 0 ? "Projected Surplus" : "Projected Shortfall"}
          value={fmtUSDCompact(Math.abs(k.variance))}
          accent={k.variance >= 0 ? "emerald" : "red"}
        />
        <StatTile
          label="Variance %"
          value={fmtSignedPct(k.variancePct)}
          accent={k.variance >= 0 ? "emerald" : "red"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="Variance by Division" subtitle="Planned allocation minus projected cost" />
          <div className="p-4">
            <VarianceByOrgChart data={orgVariance.map((o) => ({ name: o.name, variance: o.variance }))} />
          </div>
        </Card>
        <Card>
          <CardHeader
            title="Variance by Grade Level"
            subtitle="Cost impact of moving from current to recommended mix"
          />
          <div className="p-4">
            <VarianceByGradeChart data={gradeVariance} />
          </div>
        </Card>
      </div>

      <InsightPanel
        title="Variance explanation for leadership"
        tone={k.variance < 0 ? "red" : k.variancePct > 0.05 ? "amber" : "navy"}
        icon={<FileText className="h-4 w-4" />}
      >
        Under the <strong>{scenario.name}</strong> scenario, OCFO&rsquo;s projected personnel cost
        of <strong>{fmtUSDCompact(k.annualCost)}</strong> is{" "}
        <strong>
          {k.variance >= 0 ? "below" : "above"} the {fmtUSDCompact(k.plannedBudget)} planned topline
          by {fmtUSDCompact(Math.abs(k.variance))} ({fmtSignedPct(k.variancePct)})
        </strong>
        .{" "}
        {k.variance < 0
          ? "The shortfall is driven primarily by hiring pace and compounding pay assumptions outrunning the appropriated topline. Options include moderating hiring pace, sequencing fills toward the highest-criticality divisions, or requesting a topline adjustment."
          : k.variancePct > 0.05
          ? "Funds are projected to under-execute. Slow fills leave both mission capacity and appropriated funds unused — accelerating recruitment in critical divisions would convert idle topline into delivered capability."
          : "Cost and topline are closely aligned; the plan is broadly executable as programmed, with limited headroom for unplanned demand."}{" "}
        At the division level, the largest pressure sits with{" "}
        <strong>
          {orgVariance
            .slice()
            .sort((a, b) => a.variance - b.variance)
            .slice(0, 2)
            .map((o) => o.name)
            .join(" and ")}
        </strong>
        .
      </InsightPanel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader title="Variance by Division (detail)" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5 font-medium">Division</th>
                  <th className="px-4 py-2.5 text-right font-medium">Planned</th>
                  <th className="px-4 py-2.5 text-right font-medium">Projected</th>
                  <th className="px-4 py-2.5 text-right font-medium">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orgVariance.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-medium text-navy-900">{o.name}</td>
                    <td className="px-4 py-2.5 text-right tabular text-slate-600">
                      {fmtUSD(o.planned)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular text-slate-600">
                      {fmtUSD(o.projected)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right tabular font-medium ${
                        o.variance >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {fmtUSDCompact(o.variance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Variance Drivers" subtitle="What is moving the number" />
          <div className="space-y-3 p-4">
            {drivers.map((d) => (
              <div key={d.label} className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-navy-900">{d.label}</div>
                  <div className="text-xs text-slate-500">{d.note}</div>
                </div>
                <Pill tone={d.tone}>{d.effect}</Pill>
              </div>
            ))}
            <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              Enterprise gap to requirement:{" "}
              <strong className="text-navy-900">
                {fmtNum(k.required - k.onboard)} FTE
              </strong>{" "}
              · Funded vacancies:{" "}
              <strong className="text-navy-900">{fmtNum(k.vacancies)}</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
