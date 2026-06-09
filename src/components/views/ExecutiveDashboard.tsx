"use client";

import {
  Users,
  BadgeCheck,
  UserMinus,
  CalendarClock,
  DollarSign,
  Scale,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { UserPlus, Eye } from "lucide-react";
import { useModel } from "../model-context";
import { StatTile } from "../kpi";
import { Card, CardHeader, HowToRead, RiskBadge, CriticalityBadge, Pill } from "../ui";
import DecisionBanner from "./DecisionBanner";
import {
  CostTrendChart,
  DemandSupplyChart,
  VacancyByDivisionChart,
  VarianceByOrgChart,
} from "../charts";
import { DIVISIONS } from "@/lib/data";
import { topStaffingRisks, topHiringActions } from "@/lib/selectors";
import { fmtNum, fmtUSDCompact, fmtSignedPct, fmtSigned } from "@/lib/format";

export default function ExecutiveDashboard({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) {
  const { model, baselineModel, scenarioId, isCustom } = useModel();
  const k = model.kpis;
  const b = baselineModel.kpis;
  const onBaseline = scenarioId === "baseline" && !isCustom;
  const vacancyRate = k.authorized > 0 ? (k.vacancies / k.authorized) * 100 : 0;

  const vacancyData = model.divisions.map((d) => ({
    name: d.shortName,
    rate: d.authorized > 0 ? (d.vacancies / d.authorized) * 100 : 0,
  }));

  const totalAuth = DIVISIONS.reduce((s, x) => s + x.authorized, 0);
  const varianceData = model.divisions.map((d) => {
    const seed = DIVISIONS.find((x) => x.id === d.id)!;
    const planned = k.plannedBudget * (seed.authorized / totalAuth);
    return { name: d.shortName, variance: planned - d.annualCost };
  });

  const hiringActions = topHiringActions(model, 3);
  const watchlist = topStaffingRisks(model, 3);

  return (
    <div className="space-y-6">
      {/* ANSWER-FIRST VERDICT */}
      <DecisionBanner />

      {/* HOW TO READ THIS */}
      <HowToRead />

      {/* SECONDARY KPI STRIP — supporting detail under the hero verdict */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatTile
          label="Onboard FTE"
          value={fmtNum(k.onboard)}
          sublabel={`of ${fmtNum(k.authorized)} authorized`}
          icon={<Users className="h-4 w-4" />}
          delta={onBaseline ? undefined : `${fmtSigned(k.onboard - b.onboard)} vs baseline`}
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
          sublabel={`${vacancyRate.toFixed(1)}% vacancy rate`}
          icon={<UserMinus className="h-4 w-4" />}
          accent="amber"
          statusWord={vacancyRate > 12 ? "Above target" : "On target"}
          statusTone={vacancyRate > 12 ? "amber" : "emerald"}
        />
        <StatTile
          label="Projected EOY Vacancies"
          value={fmtNum(k.projectedVacancies)}
          sublabel="End of FY2030 trajectory"
          icon={<CalendarClock className="h-4 w-4" />}
          accent={k.projectedVacancies > k.vacancies ? "red" : "emerald"}
          statusWord={k.projectedVacancies > k.vacancies ? "Rising" : "Improving"}
          statusTone={k.projectedVacancies > k.vacancies ? "red" : "emerald"}
        />
        <StatTile
          label="Annual Personnel Cost"
          value={fmtUSDCompact(k.annualCost)}
          sublabel={`Planned: ${fmtUSDCompact(k.plannedBudget)}`}
          icon={<DollarSign className="h-4 w-4" />}
          delta={onBaseline ? undefined : `${fmtSignedPct((k.annualCost - b.annualCost) / b.annualCost)} vs baseline`}
          deltaDirection={k.annualCost > b.annualCost ? "up" : k.annualCost < b.annualCost ? "down" : "flat"}
          deltaGoodWhen="down"
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
              : "To fill authorized positions"
          }
          icon={<TrendingUp className="h-4 w-4" />}
          accent={k.timeToTargetMonths >= 99 ? "red" : k.timeToTargetMonths > 36 ? "amber" : "emerald"}
          statusWord={k.timeToTargetMonths >= 99 ? "Off track" : k.timeToTargetMonths > 36 ? "Slow" : "On pace"}
          statusTone={k.timeToTargetMonths >= 99 ? "red" : k.timeToTargetMonths > 36 ? "amber" : "emerald"}
        />
      </div>

      {/* WHAT TO DO NEXT — recommended actions + watchlist */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recommended Next Actions"
            subtitle="Hiring prioritized by mission criticality and shortfall"
            icon={<UserPlus className="h-4 w-4" />}
            right={
              <button
                onClick={() => onNavigate("briefing")}
                className="inline-flex items-center gap-1 text-xs font-medium text-navy-600 hover:text-navy-800"
              >
                Full plan <ArrowRight className="h-3 w-3" />
              </button>
            }
          />
          <ol className="divide-y divide-slate-100">
            {hiringActions.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-500">
                No net hiring required — divisions are at or above requirement.
              </li>
            )}
            {hiringActions.map((d, i) => (
              <li key={d.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-700 text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-navy-900">{d.shortName}</span>
                    <CriticalityBadge level={d.criticality} />
                  </div>
                  <p className="text-xs text-slate-500">
                    Hire <strong className="text-navy-900">{fmtNum(d.gap)}</strong> FTE to reach
                    requirement · {fmtNum(d.vacancies)} funded vacancies
                  </p>
                </div>
                <Pill tone={d.coverage >= 92 ? "emerald" : d.coverage >= 82 ? "amber" : "red"}>
                  {d.coverage.toFixed(0)}%
                </Pill>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <CardHeader
            title="Divisions to Watch"
            subtitle="Highest criticality-weighted workforce risk"
            icon={<Eye className="h-4 w-4" />}
            right={
              <button
                onClick={() => onNavigate("divisions")}
                className="inline-flex items-center gap-1 text-xs font-medium text-navy-600 hover:text-navy-800"
              >
                Division model <ArrowRight className="h-3 w-3" />
              </button>
            }
          />
          <ol className="divide-y divide-slate-100">
            {watchlist.map((d, i) => (
              <li key={d.id} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-semibold text-navy-700">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-navy-900">{d.shortName}</span>
                    <RiskBadge level={d.risk} />
                  </div>
                  <p className="text-xs text-slate-500">{d.riskDriver}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
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
            <CostTrendChart data={model.timeline} plannedBudget={k.plannedBudget} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="FTE Demand vs. Supply"
            subtitle="Red band is the coverage gap — mission demand above projected supply"
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

      {/* RISK ALERTS */}
      <Card>
        <CardHeader
          title="Risk Alerts"
          subtitle="Active budget and workforce alerts under the current scenario"
          icon={<AlertTriangle className="h-4 w-4" />}
          right={
            <button
              onClick={() => onNavigate("briefing")}
              className="inline-flex items-center gap-1 text-xs font-medium text-navy-600 hover:text-navy-800"
            >
              Open briefing <ArrowRight className="h-3 w-3" />
            </button>
          }
        />
        <ul className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2">
          {model.alerts.slice(0, 6).map((a) => (
            <li key={a.id} className="flex items-start gap-3 bg-white px-4 py-3">
              <RiskBadge level={a.severity} />
              <div className="min-w-0">
                <div className="text-sm font-medium text-navy-900">{a.title}</div>
                <div className="text-xs text-slate-500">{a.detail}</div>
              </div>
            </li>
          ))}
          {model.alerts.length === 0 && (
            <li className="bg-white px-4 py-6 text-center text-sm text-slate-500 sm:col-span-2">
              No elevated risks under the active scenario.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
