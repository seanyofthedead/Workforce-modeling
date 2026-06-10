"use client";

import { useState } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { useModel } from "../model-context";
import { Card, CardHeader, SectionTitle, RiskBadge, InsightPanel } from "../ui";
import { SCENARIOS } from "@/lib/data";
import { ScenarioParams, DivisionLever } from "@/lib/types";
import {
  fmtNum,
  fmtUSDCompact,
  fmtPct,
  fmtSignedPct,
} from "@/lib/format";

interface ImpactItem {
  label: string;
  now: string;
  base: string;
  diff: number;
  goodWhen: "up" | "down";
}

function ImpactChip({ item }: { item: ImpactItem }) {
  const flat = Math.abs(item.diff) < 1e-9;
  const dir: "up" | "down" | "flat" = flat ? "flat" : item.diff > 0 ? "up" : "down";
  const good = dir === item.goodWhen;
  const Icon = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;
  const tone = flat ? "text-slate-400" : good ? "text-emerald-600" : "text-red-600";
  return (
    <div className="bg-white p-4 transition-colors">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {item.label}
      </div>
      <div className="mt-1 text-xl font-semibold tabular tracking-tight text-navy-900 transition-all duration-300">
        {item.now}
      </div>
      <div className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
        {flat ? "no change" : "vs"}
        {!flat && <span className="text-slate-400">baseline {item.base}</span>}
        {flat && <span className="text-slate-400">vs baseline</span>}
      </div>
    </div>
  );
}

interface SliderDef {
  key: keyof ScenarioParams;
  label: string;
  min: number;
  max: number;
  step: number;
  hint: string;
  format: (v: number) => string;
  /** Whether this lever can be overridden per division. */
  perDivision: boolean;
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
    perDivision: true,
  },
  {
    key: "payRaisePct",
    label: "Pay Raise %",
    min: 0,
    max: 0.08,
    step: 0.0025,
    hint: "Annual pay and locality adjustment",
    format: (v) => fmtPct(v),
    perDivision: false,
  },
  {
    key: "hiringPace",
    label: "Hiring Pace",
    min: 0,
    max: 1,
    step: 0.05,
    hint: "Share of the vacancy gap filled per year",
    format: (v) => fmtPct(v, 0),
    perDivision: true,
  },
  {
    key: "contractorConversionPct",
    label: "Contractor Conversion %",
    min: 0,
    max: 0.4,
    step: 0.01,
    hint: "Contractor capacity converted to federal FTE",
    format: (v) => fmtPct(v, 0),
    perDivision: true,
  },
  {
    key: "budgetDeltaPct",
    label: "Budget Increase / Decrease",
    min: -0.2,
    max: 0.2,
    step: 0.01,
    hint: "Change to the planned personnel topline",
    format: (v) => fmtSignedPct(v, 0),
    perDivision: false,
  },
  {
    key: "missionDemandGrowthPct",
    label: "Mission Demand Growth",
    min: -0.1,
    max: 0.2,
    step: 0.01,
    hint: "Annual growth in mission-required staffing",
    format: (v) => fmtSignedPct(v, 0),
    perDivision: true,
  },
];

/** One lever row. In division mode, non-per-division levers render read-only. */
function LeverSlider({
  def,
  value,
  onChange,
  disabled = false,
  overridden = false,
  onRevert,
  enterpriseTag = false,
}: {
  def: SliderDef;
  value: number;
  onChange?: (v: number) => void;
  disabled?: boolean;
  overridden?: boolean;
  onRevert?: () => void;
  enterpriseTag?: boolean;
}) {
  return (
    <div className={disabled ? "opacity-60" : undefined}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm font-medium text-navy-900">
          {def.label}
          {enterpriseTag && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              enterprise
            </span>
          )}
          {overridden && (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              overridden
            </span>
          )}
        </label>
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-navy-50 px-2 py-0.5 text-xs font-semibold tabular text-navy-700">
            {def.format(value)}
          </span>
          {overridden && onRevert && (
            <button
              type="button"
              onClick={onRevert}
              aria-label={`Revert ${def.label} to enterprise`}
              title="Revert to enterprise"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-navy-700"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-navy-700 disabled:cursor-not-allowed"
      />
      <p className="mt-1 text-[11px] text-slate-400">
        {disabled ? "Set at the enterprise level" : def.hint}
      </p>
    </div>
  );
}

export default function ScenarioModeling() {
  const {
    scenarioId,
    params,
    model,
    baselineModel,
    isCustom,
    overrides,
    customizedDivisionIds,
    selectScenario,
    setParam,
    resetScenario,
    setDivisionParam,
    resetDivisionParam,
    resetDivision,
    resetAllDivisions,
  } = useModel();

  const [scope, setScope] = useState<"enterprise" | "division">("enterprise");
  const [divId, setDivId] = useState<string>(model.divisions[0]?.id ?? "");

  const k = model.kpis;
  const b = baselineModel.kpis;
  const divOverride = overrides[divId] ?? {};
  const divHasOverrides = Object.keys(divOverride).length > 0;

  const ttt = (m: number) => (m >= 99 ? "Off track" : `${m} mo`);
  const impact: ImpactItem[] = [
    {
      label: "Personnel cost",
      now: fmtUSDCompact(k.annualCost),
      base: fmtUSDCompact(b.annualCost),
      diff: k.annualCost - b.annualCost,
      goodWhen: "down",
    },
    {
      label: "Mission coverage",
      now: `${k.coverage.toFixed(0)}%`,
      base: `${b.coverage.toFixed(0)}%`,
      diff: k.coverage - b.coverage,
      goodWhen: "up",
    },
    {
      label: "Budget variance",
      now: fmtUSDCompact(k.variance),
      base: fmtUSDCompact(b.variance),
      diff: k.variance - b.variance,
      goodWhen: "up",
    },
    {
      label: "Time to target",
      now: ttt(k.timeToTargetMonths),
      base: ttt(b.timeToTargetMonths),
      diff: k.timeToTargetMonths - b.timeToTargetMonths,
      goodWhen: "down",
    },
  ];

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

      {/* Impact ribbon — what this scenario changes vs the baseline */}
      <Card>
        <CardHeader
          title="Impact vs. Baseline"
          subtitle={
            isCustom || customizedDivisionIds.length > 0
              ? "Live effect of your adjustments against the Baseline / Current Plan"
              : "Effect of this scenario against the Baseline / Current Plan"
          }
        />
        <div className="grid grid-cols-2 gap-px bg-slate-100 lg:grid-cols-4">
          {impact.map((m) => (
            <ImpactChip key={m.label} item={m} />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Controls */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Modeling Levers"
            subtitle={
              scope === "enterprise"
                ? isCustom
                  ? "Custom-adjusted scenario"
                  : "Scenario defaults"
                : "Per-division overrides on the enterprise defaults"
            }
            icon={<SlidersHorizontal className="h-4 w-4" />}
            right={
              scope === "enterprise" ? (
                isCustom ? (
                  <button
                    onClick={resetScenario}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset
                  </button>
                ) : undefined
              ) : divHasOverrides ? (
                <button
                  onClick={() => resetDivision(divId)}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <RotateCcw className="h-3 w-3" /> Reset division
                </button>
              ) : undefined
            }
          />

          {/* Scope toggle */}
          <div className="border-b border-slate-100 px-5 py-3">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                onClick={() => setScope("enterprise")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  scope === "enterprise" ? "bg-navy-700 text-white" : "text-slate-600"
                }`}
              >
                Enterprise
              </button>
              <button
                onClick={() => setScope("division")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  scope === "division" ? "bg-navy-700 text-white" : "text-slate-600"
                }`}
              >
                By division
              </button>
            </div>
            {scope === "division" && (
              <select
                value={divId}
                onChange={(e) => setDivId(e.target.value)}
                className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-navy-900 outline-none focus:ring-2 focus:ring-navy-500"
              >
                {model.divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Levers */}
          <div className="space-y-5 p-5">
            {scope === "enterprise"
              ? SLIDERS.map((s) => (
                  <LeverSlider
                    key={s.key}
                    def={s}
                    value={params[s.key]}
                    onChange={(v) => setParam(s.key, v)}
                  />
                ))
              : SLIDERS.map((s) => {
                  if (!s.perDivision) {
                    return (
                      <LeverSlider
                        key={s.key}
                        def={s}
                        value={params[s.key]}
                        disabled
                        enterpriseTag
                      />
                    );
                  }
                  const leverKey = s.key as DivisionLever;
                  const overridden = leverKey in divOverride;
                  const value = overridden
                    ? (divOverride[leverKey] as number)
                    : params[s.key];
                  return (
                    <LeverSlider
                      key={s.key}
                      def={s}
                      value={value}
                      overridden={overridden}
                      onChange={(v) => setDivisionParam(divId, leverKey, v)}
                      onRevert={() => resetDivisionParam(divId, leverKey)}
                    />
                  );
                })}
          </div>

          {/* Customized summary */}
          {scope === "division" && customizedDivisionIds.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs">
              <span className="text-slate-500">
                {customizedDivisionIds.length} of {model.divisions.length} divisions
                customized
              </span>
              <button
                onClick={resetAllDivisions}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-medium text-slate-600 hover:bg-slate-50"
              >
                <RotateCcw className="h-3 w-3" /> Reset all divisions
              </button>
            </div>
          )}
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
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
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
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
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
