"use client";

import { SlidersHorizontal, RotateCcw, Check } from "lucide-react";
import { useModel } from "../model-context";
import { Card, CardHeader, SectionTitle, RiskBadge, InsightPanel } from "../ui";
import { SCENARIOS } from "@/lib/data";
import { ScenarioParams } from "@/lib/types";
import {
  fmtNum,
  fmtUSDCompact,
  fmtPct,
  fmtSignedPct,
} from "@/lib/format";

interface SliderDef {
  key: keyof ScenarioParams;
  label: string;
  min: number;
  max: number;
  step: number;
  hint: string;
  format: (v: number) => string;
}

const SLIDERS: SliderDef[] = [
  {
    key: "attritionRate",
    label: "Attrition Rate",
    min: 0,
    max: 0.25,
    step: 0.005,
    hint: "Annual separations as a share of onboard strength",
    format: (v) => fmtPct(v),
  },
  {
    key: "payRaisePct",
    label: "Pay Raise %",
    min: 0,
    max: 0.08,
    step: 0.0025,
    hint: "Annual pay and locality adjustment",
    format: (v) => fmtPct(v),
  },
  {
    key: "hiringPace",
    label: "Hiring Pace",
    min: 0,
    max: 1,
    step: 0.05,
    hint: "Share of the vacancy gap filled per year",
    format: (v) => fmtPct(v, 0),
  },
  {
    key: "contractorConversionPct",
    label: "Contractor Conversion %",
    min: 0,
    max: 0.4,
    step: 0.01,
    hint: "Contractor capacity converted to federal FTE",
    format: (v) => fmtPct(v, 0),
  },
  {
    key: "budgetDeltaPct",
    label: "Budget Increase / Decrease",
    min: -0.2,
    max: 0.2,
    step: 0.01,
    hint: "Change to the planned personnel topline",
    format: (v) => fmtSignedPct(v, 0),
  },
  {
    key: "missionDemandGrowthPct",
    label: "Mission Demand Growth",
    min: -0.1,
    max: 0.2,
    step: 0.01,
    hint: "Annual growth in mission-required staffing",
    format: (v) => fmtSignedPct(v, 0),
  },
];

export default function ScenarioModeling() {
  const {
    scenarioId,
    params,
    model,
    baselineModel,
    isCustom,
    selectScenario,
    setParam,
    resetScenario,
  } = useModel();

  const k = model.kpis;
  const b = baselineModel.kpis;

  const metrics: {
    label: string;
    value: string;
    base: string;
    better?: boolean;
  }[] = [
    {
      label: "Total Personnel Cost",
      value: fmtUSDCompact(k.annualCost),
      base: fmtUSDCompact(b.annualCost),
      better: k.annualCost <= b.annualCost,
    },
    {
      label: "Required FTE",
      value: fmtNum(k.required),
      base: fmtNum(b.required),
    },
    {
      label: "Filled FTE",
      value: fmtNum(k.onboard),
      base: fmtNum(b.onboard),
      better: k.onboard >= b.onboard,
    },
    {
      label: "Vacancy Gap",
      value: fmtNum(k.required - k.onboard),
      base: fmtNum(b.required - b.onboard),
      better: k.required - k.onboard <= b.required - b.onboard,
    },
    {
      label: "Budget Variance",
      value: fmtUSDCompact(k.variance),
      base: fmtUSDCompact(b.variance),
      better: k.variance >= b.variance,
    },
    {
      label: "Mission Coverage",
      value: `${k.coverage.toFixed(0)}%`,
      base: `${b.coverage.toFixed(0)}%`,
      better: k.coverage >= b.coverage,
    },
    {
      label: "Time to Target Staffing",
      value: k.timeToTargetMonths >= 99 ? "Off track" : `${k.timeToTargetMonths} mo`,
      base: b.timeToTargetMonths >= 99 ? "Off track" : `${b.timeToTargetMonths} mo`,
      better: k.timeToTargetMonths <= b.timeToTargetMonths,
    },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Scenario Modeling"
        subtitle="Select a prebuilt planning scenario or adjust the levers to model your own"
        icon={<SlidersHorizontal className="h-4 w-4" />}
      />

      {/* Prebuilt scenarios */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {SCENARIOS.map((s) => {
          const active = s.id === scenarioId && !isCustom;
          const selected = s.id === scenarioId;
          return (
            <button
              key={s.id}
              onClick={() => selectScenario(s.id)}
              className={`rounded-xl border p-4 text-left transition-all ${
                active
                  ? "border-navy-600 bg-navy-700 text-white shadow-panel"
                  : selected
                  ? "border-navy-300 bg-white shadow-card"
                  : "border-slate-200 bg-white hover:border-navy-300 hover:shadow-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${active ? "text-white" : "text-navy-900"}`}
                >
                  {s.name}
                </span>
                {active && <Check className="h-4 w-4 text-agency-accent" />}
              </div>
              <p className={`mt-1 text-xs ${active ? "text-navy-100" : "text-slate-500"}`}>
                {s.tagline}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Controls */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Modeling Levers"
            subtitle={isCustom ? "Custom-adjusted scenario" : "Scenario defaults"}
            icon={<SlidersHorizontal className="h-4 w-4" />}
            right={
              isCustom ? (
                <button
                  onClick={resetScenario}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              ) : undefined
            }
          />
          <div className="space-y-5 p-5">
            {SLIDERS.map((s) => (
              <div key={s.key}>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium text-navy-900">{s.label}</label>
                  <span className="rounded-md bg-navy-50 px-2 py-0.5 text-xs font-semibold tabular text-navy-700">
                    {s.format(params[s.key])}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={params[s.key]}
                  onChange={(e) => setParam(s.key, parseFloat(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-navy-700"
                />
                <p className="mt-1 text-[11px] text-slate-400">{s.hint}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Live metrics */}
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <CardHeader
              title="Scenario Outcomes"
              subtitle="Live results vs. the Baseline / Current Plan"
              right={<RiskBadge level={k.risk} />}
            />
            <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-3">
              {metrics.map((m) => (
                <div key={m.label} className="bg-white p-4">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    {m.label}
                  </div>
                  <div className="mt-1 text-xl font-semibold tabular text-navy-900">
                    {m.value}
                  </div>
                  <div
                    className={`mt-0.5 text-[11px] ${
                      m.better === undefined
                        ? "text-slate-400"
                        : m.better
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    baseline {m.base}
                  </div>
                </div>
              ))}
              <div className="bg-white p-4">
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Overall Risk
                </div>
                <div className="mt-2">
                  <RiskBadge level={k.risk} />
                </div>
              </div>
            </div>
          </Card>

          <InsightPanel
            title="Scenario read-out"
            tone={k.variance < 0 ? "amber" : "navy"}
          >
            This configuration projects{" "}
            <strong>{fmtUSDCompact(k.annualCost)}</strong> in annual personnel cost against a{" "}
            <strong>{fmtUSDCompact(k.plannedBudget)}</strong> topline — a{" "}
            <strong>
              {k.variance >= 0 ? "surplus" : "shortfall"} of {fmtUSDCompact(Math.abs(k.variance))}
            </strong>{" "}
            ({fmtSignedPct(k.variancePct)}). Mission coverage lands at{" "}
            <strong>{k.coverage.toFixed(0)}%</strong>
            {k.coverage >= b.coverage
              ? " — at or above the baseline."
              : ` — ${(b.coverage - k.coverage).toFixed(0)} points below the baseline.`}{" "}
            {k.timeToTargetMonths >= 99
              ? "Authorized vacancies do not close at this pace; a hiring or attrition intervention is required."
              : `Authorized vacancies close in about ${k.timeToTargetMonths} months.`}
          </InsightPanel>
        </div>
      </div>
    </div>
  );
}
