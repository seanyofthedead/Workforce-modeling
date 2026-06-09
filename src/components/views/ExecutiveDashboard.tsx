"use client";

import {
  Users,
  BadgeCheck,
  UserMinus,
  CalendarClock,
  DollarSign,
  Scale,
  Gauge,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useModel } from "../model-context";
import { StatTile } from "../kpi";
import { Card, CardHeader, InsightPanel, RiskBadge } from "../ui";
import {
  CostTrendChart,
  DemandSupplyChart,
  VacancyByDivisionChart,
  VarianceByOrgChart,
} from "../charts";
import { DIVISIONS, SCENARIOS } from "@/lib/data";
import { fmtNum, fmtUSDCompact, fmtSignedPct, fmtSigned } from "@/lib/format";

export default function ExecutiveDashboard({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) {
  const { model, baselineModel, scenarioId } = useModel();
  const k = model.kpis;
  const b = baselineModel.kpis;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  const vacancyData = model.divisions.map((d) => ({
    name: d.shortName,
    rate: d.authorized > 0 ? (d.vacancies / d.authorized) * 100 : 0,
  }));

  const varianceData = model.divisions.map((d) => {
    const seed = DIVISIONS.find((x) => x.id === d.id)!;
    // Per-division planned share derived from authorized strength.
    const totalAuth = DIVISIONS.reduce((s, x) => s + x.authorized, 0);
    const planned =
      k.plannedBudget * (seed.authorized / totalAuth);
    return { name: d.shortName, variance: planned - d.annualCost };
  });

  const varianceTone = k.variance >= 0 ? "emerald" : "red";

  return (
    <div className="space-y-6">
      {/* KPI ROW */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-3">
        <StatTile
          label="Onboard FTE"
          value={fmtNum(k.onboard)}
          sublabel={`of ${fmtNum(k.authorized)} authorized`}
          icon={<Users className="h-4 w-4" />}
          delta={`${fmtSigned(k.onboard - b.onboard)} vs baseline`}
          deltaDirection={k.onboard > b.onboard ? "up" : k.onboard < b.onboard ? "down" : "flat"}
          deltaGoodWhen="up"
        />
        <StatTile
          label="Authorized Positions"
          value={fmtNum(k.authorized)}
          sublabel={`Required: ${fmtNum(k.required)}`}
          icon={<BadgeCheck className="h-4 w-4" />}
        />
        <StatTile
          label="Current Vacancies"
          value={fmtNum(k.vacancies)}
          sublabel={`${((k.vacancies / k.authorized) * 100).toFixed(1)}% vacancy rate`}
          icon={<UserMinus className="h-4 w-4" />}
          accent="amber"
          delta={`${fmtSigned(k.vacancies - b.vacancies)} vs baseline`}
          deltaDirection={k.vacancies > b.vacancies ? "up" : k.vacancies < b.vacancies ? "down" : "flat"}
          deltaGoodWhen="down"
        />
        <StatTile
          label="Projected EOY Vacancies"
          value={fmtNum(k.projectedVacancies)}
          sublabel={`End of FY2030 trajectory`}
          icon={<CalendarClock className="h-4 w-4" />}
          accent={k.projectedVacancies > k.vacancies ? "red" : "emerald"}
        />
        <StatTile
          label="Annual Personnel Cost"
          value={fmtUSDCompact(k.annualCost)}
          sublabel={`Planned: ${fmtUSDCompact(k.plannedBudget)}`}
          icon={<DollarSign className="h-4 w-4" />}
          delta={`${fmtSignedPct((k.annualCost - b.annualCost) / b.annualCost)} vs baseline`}
          deltaDirection={k.annualCost > b.annualCost ? "up" : k.annualCost < b.annualCost ? "down" : "flat"}
          deltaGoodWhen="down"
        />
        <StatTile
          label="Projected Budget Variance"
          value={fmtUSDCompact(k.variance)}
          sublabel={k.variance >= 0 ? "Surplus to topline" : "Shortfall vs topline"}
          icon={<Scale className="h-4 w-4" />}
          accent={varianceTone}
          delta={fmtSignedPct(k.variancePct)}
          deltaDirection={k.variance >= 0 ? "up" : "down"}
          deltaGoodWhen="up"
        />
      </div>

      {/* SECOND KPI ROW */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatTile
          label="Mission Coverage Score"
          value={`${k.coverage.toFixed(0)}%`}
          sublabel="Criticality-weighted readiness"
          icon={<Gauge className="h-4 w-4" />}
          accent={k.coverage >= 92 ? "emerald" : k.coverage >= 82 ? "amber" : "red"}
        />
        <StatTile
          label="Hiring Plan Status"
          value={
            k.timeToTargetMonths >= 99
              ? "Off track"
              : k.timeToTargetMonths === 0
              ? "At target"
              : `${k.timeToTargetMonths} mo`
          }
          sublabel={
            k.timeToTargetMonths >= 99
              ? "Attrition outpaces hiring"
              : "Time to fill authorized positions"
          }
          icon={<TrendingUp className="h-4 w-4" />}
          accent={k.timeToTargetMonths >= 99 ? "red" : k.timeToTargetMonths > 36 ? "amber" : "emerald"}
        />
        <StatTile
          label="Risk Alerts"
          value={fmtNum(model.alerts.length)}
          sublabel={`${k.riskCount} division(s) at elevated+ risk`}
          icon={<AlertTriangle className="h-4 w-4" />}
          accent={model.alerts.length >= 4 ? "red" : model.alerts.length >= 2 ? "amber" : "emerald"}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Workforce Cost Trend by Fiscal Year"
            subtitle="Historical actuals through FY2025; FY2026–FY2030 modeled under active scenario"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <div className="p-4">
            <CostTrendChart data={model.timeline} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="FTE Demand vs. Supply"
            subtitle="Mission-required demand against projected onboard supply"
            icon={<Users className="h-4 w-4" />}
          />
          <div className="p-4">
            <DemandSupplyChart data={model.timeline} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Vacancy Rate by Division"
            subtitle="Current vacancies as a share of authorized positions"
            icon={<UserMinus className="h-4 w-4" />}
          />
          <div className="p-4">
            <VacancyByDivisionChart data={vacancyData} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Budget Variance by Organization"
            subtitle="Planned personnel allocation vs. projected cost"
            icon={<Scale className="h-4 w-4" />}
          />
          <div className="p-4">
            <VarianceByOrgChart data={varianceData} />
          </div>
        </Card>
      </div>

      {/* INSIGHT + ALERTS */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InsightPanel
            title="What this means for leadership"
            tone={k.variance < 0 || k.coverage < 88 ? "amber" : "navy"}
            icon={<Gauge className="h-4 w-4" />}
          >
            Under the <strong>{scenario.name}</strong> scenario, OCFO carries{" "}
            <strong>{fmtNum(k.onboard)}</strong> onboard FTE against{" "}
            <strong>{fmtNum(k.required)}</strong> mission-required positions — a coverage of{" "}
            <strong>{k.coverage.toFixed(0)}%</strong>. Projected annual personnel cost of{" "}
            <strong>{fmtUSDCompact(k.annualCost)}</strong> runs{" "}
            <strong>
              {k.variance >= 0 ? "under" : "over"} the planned topline by{" "}
              {fmtUSDCompact(Math.abs(k.variance))}
            </strong>{" "}
            ({fmtSignedPct(k.variancePct)}).{" "}
            {k.timeToTargetMonths >= 99
              ? "At the current pace, attrition outpaces hiring and authorized vacancies will not close — a deliberate intervention is required."
              : `At the current pace, authorized vacancies close in roughly ${k.timeToTargetMonths} months.`}
          </InsightPanel>
        </div>

        <Card className="lg:col-span-1">
          <CardHeader
            title="Risk Alerts"
            icon={<AlertTriangle className="h-4 w-4" />}
            right={
              <button
                onClick={() => onNavigate("briefing")}
                className="inline-flex items-center gap-1 text-xs font-medium text-navy-600 hover:text-navy-800"
              >
                Briefing <ArrowRight className="h-3 w-3" />
              </button>
            }
          />
          <ul className="divide-y divide-slate-100">
            {model.alerts.slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                <RiskBadge level={a.severity} />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-navy-900">{a.title}</div>
                  <div className="text-xs text-slate-500">{a.detail}</div>
                </div>
              </li>
            ))}
            {model.alerts.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-500">
                No elevated risks under the active scenario.
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
