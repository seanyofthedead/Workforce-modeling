"use client";

import { useState } from "react";
import { Building2, LayoutGrid, Table2, X, ChevronRight } from "lucide-react";
import { useModel } from "../model-context";
import {
  Card,
  CardHeader,
  CriticalityBadge,
  RiskBadge,
  Meter,
  SectionTitle,
  toneForCoverage,
  Pill,
} from "../ui";
import { GRADES, DivisionResult } from "@/lib/types";
import { fmtNum, fmtUSD, fmtUSDCompact, fmtSigned } from "@/lib/format";
import StaffingWaterfall from "../StaffingWaterfall";

export default function DivisionModel() {
  const { model } = useModel();
  const [view, setView] = useState<"cards" | "table">("cards");
  const [selected, setSelected] = useState<DivisionResult | null>(null);
  const k = model.kpis;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle
          title="Division Workforce Model"
          subtitle="Onboard strength, requirement, grade mix, and risk by OCFO division"
          icon={<Building2 className="h-4 w-4" />}
        />
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
          <button
            onClick={() => setView("cards")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              view === "cards" ? "bg-navy-700 text-white" : "text-slate-600"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Cards
          </button>
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              view === "table" ? "bg-navy-700 text-white" : "text-slate-600"
            }`}
          >
            <Table2 className="h-3.5 w-3.5" /> Table
          </button>
        </div>
      </div>

      {/* Enterprise staffing waterfall — have vs funded vs need */}
      <Card>
        <CardHeader
          title="Enterprise Staffing — Have vs. Funded vs. Need"
          subtitle="Onboard strength against authorized funding and mission requirement"
          icon={<Building2 className="h-4 w-4" />}
        />
        <div className="p-5">
          <StaffingWaterfall
            onboard={k.onboard}
            authorized={k.authorized}
            required={k.required}
          />
        </div>
      </Card>

      {view === "cards" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
          {model.divisions.map((d) => {
            const gap = d.gap;
            const topGrades = GRADES.filter((g) => d.gradeCounts[g] > 0)
              .sort((a, b) => d.gradeCounts[b] - d.gradeCounts[a])
              .slice(0, 4);
            return (
              <Card
                key={d.id}
                className="cursor-pointer overflow-hidden transition-shadow hover:shadow-panel hover:ring-1 hover:ring-navy-200"
              >
                <button
                  type="button"
                  onClick={() => setSelected(d)}
                  className="w-full text-left"
                  aria-label={`Open ${d.name} detail`}
                >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-navy-900">{d.name}</h3>
                      <CriticalityBadge level={d.criticality} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{d.riskDriver}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RiskBadge level={d.risk} />
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 px-5 py-4">
                  <Metric label="Current FTE" value={fmtNum(d.onboard)} />
                  <Metric label="Required FTE" value={fmtNum(d.required)} />
                  <Metric
                    label={gap > 0 ? "Shortfall" : gap < 0 ? "Surplus" : "Balanced"}
                    value={fmtSigned(-gap)}
                    tone={gap > 0 ? "red" : gap < 0 ? "emerald" : "slate"}
                  />
                  <Metric label="Vacancies" value={fmtNum(d.vacancies)} tone="amber" />
                  <Metric label="Avg loaded cost" value={fmtUSDCompact(d.avgLoadedCost)} />
                  <Metric label="Annual cost" value={fmtUSDCompact(d.annualCost)} />
                </div>

                <div className="px-5 pb-3">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Mission coverage</span>
                    <span className="font-medium text-navy-900">{d.coverage.toFixed(0)}%</span>
                  </div>
                  <Meter value={d.coverage} tone={toneForCoverage(d.coverage)} />
                </div>

                <div className="flex flex-wrap gap-1.5 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Grade mix
                  </span>
                  {topGrades.map((g) => (
                    <Pill key={g} tone="navy">
                      {g}: {d.gradeCounts[g]}
                    </Pill>
                  ))}
                </div>
                </button>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Division</th>
                  <th className="px-4 py-3 text-right font-medium">Current</th>
                  <th className="px-4 py-3 text-right font-medium">Required</th>
                  <th className="px-4 py-3 text-right font-medium">Gap</th>
                  <th className="px-4 py-3 text-right font-medium">Vac.</th>
                  <th className="px-4 py-3 text-right font-medium">Avg Cost</th>
                  <th className="px-4 py-3 text-right font-medium">Annual Cost</th>
                  <th className="px-4 py-3 text-center font-medium">Criticality</th>
                  <th className="px-4 py-3 text-center font-medium">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {model.divisions.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSelected(d)}
                    className="cursor-pointer hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3 font-medium text-navy-900">
                      <span className="inline-flex items-center gap-1">
                        {d.name}
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular">{fmtNum(d.onboard)}</td>
                    <td className="px-4 py-3 text-right tabular">{fmtNum(d.required)}</td>
                    <td
                      className={`px-4 py-3 text-right tabular font-medium ${
                        d.gap > 0 ? "text-red-600" : d.gap < 0 ? "text-emerald-600" : "text-slate-500"
                      }`}
                    >
                      {fmtSigned(-d.gap)}
                    </td>
                    <td className="px-4 py-3 text-right tabular text-amber-700">
                      {fmtNum(d.vacancies)}
                    </td>
                    <td className="px-4 py-3 text-right tabular">{fmtUSD(d.avgLoadedCost)}</td>
                    <td className="px-4 py-3 text-right tabular">{fmtUSDCompact(d.annualCost)}</td>
                    <td className="px-4 py-3 text-center">
                      <CriticalityBadge level={d.criticality} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <RiskBadge level={d.risk} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-navy-900">
                  <td className="px-4 py-3">Enterprise total</td>
                  <td className="px-4 py-3 text-right tabular">{fmtNum(model.kpis.onboard)}</td>
                  <td className="px-4 py-3 text-right tabular">{fmtNum(model.kpis.required)}</td>
                  <td className="px-4 py-3 text-right tabular text-red-600">
                    {fmtSigned(-(model.kpis.required - model.kpis.onboard))}
                  </td>
                  <td className="px-4 py-3 text-right tabular text-amber-700">
                    {fmtNum(model.kpis.vacancies)}
                  </td>
                  <td className="px-4 py-3 text-right tabular">—</td>
                  <td className="px-4 py-3 text-right tabular">
                    {fmtUSDCompact(model.kpis.annualCost)}
                  </td>
                  <td className="px-4 py-3" colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {selected && (
        <DivisionDetail division={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function DivisionDetail({
  division: d,
  onClose,
}: {
  division: DivisionResult;
  onClose: () => void;
}) {
  const gradeRows = GRADES.map((g) => ({ g, n: d.gradeCounts[g] })).filter((r) => r.n > 0);
  const maxGrade = Math.max(1, ...gradeRows.map((r) => r.n));
  const erosion = d.projectedVacancies - d.vacancies;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-panel sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-navy-900 px-5 py-4 text-white">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">{d.name}</h3>
              <CriticalityBadge level={d.criticality} />
            </div>
            <p className="mt-1 max-w-md text-xs text-navy-100">{d.riskDriver}</p>
          </div>
          <div className="flex items-center gap-2">
            <RiskBadge level={d.risk} />
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1 text-navy-200 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Staffing waterfall */}
        <div className="border-b border-slate-100 p-5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Have vs. funded vs. need
          </div>
          <StaffingWaterfall
            onboard={d.onboard}
            authorized={d.authorized}
            required={d.required}
          />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-px border-b border-slate-100 bg-slate-100 sm:grid-cols-4">
          <Metric label="Onboard FTE" value={fmtNum(d.onboard)} />
          <Metric label="Authorized" value={fmtNum(d.authorized)} />
          <Metric label="Required" value={fmtNum(d.required)} />
          <Metric
            label={d.gap > 0 ? "Shortfall" : d.gap < 0 ? "Surplus" : "Balanced"}
            value={fmtSigned(-d.gap)}
            tone={d.gap > 0 ? "red" : d.gap < 0 ? "emerald" : "slate"}
          />
          <Metric label="Funded vacancies" value={fmtNum(d.vacancies)} tone="amber" />
          <Metric
            label="Projected EOY vac."
            value={fmtNum(d.projectedVacancies)}
            tone={erosion > 0 ? "red" : "emerald"}
          />
          <Metric label="Avg loaded cost" value={fmtUSDCompact(d.avgLoadedCost)} />
          <Metric label="Annual cost" value={fmtUSDCompact(d.annualCost)} />
        </div>

        {/* Coverage */}
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-500">Mission coverage</span>
            <span className="font-medium text-navy-900">{d.coverage.toFixed(0)}%</span>
          </div>
          <Meter value={d.coverage} tone={toneForCoverage(d.coverage)} />
          <p className="mt-2 text-xs text-slate-500">
            {erosion > 0
              ? `Without intervention, vacancies grow by ~${fmtNum(erosion)} by FY2030 as attrition outpaces hiring.`
              : "Vacancies are projected to hold or improve under the active scenario."}
          </p>
        </div>

        {/* Grade mix */}
        <div className="px-5 py-4">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Grade mix ({fmtNum(gradeRows.reduce((s, r) => s + r.n, 0))} FTE)
          </div>
          <div className="space-y-2">
            {gradeRows.map((r) => (
              <div key={r.g} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs font-medium text-navy-900">{r.g}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-navy-600"
                    style={{ width: `${(r.n / maxGrade) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs tabular text-slate-600">
                  {r.n}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "navy",
}: {
  label: string;
  value: string;
  tone?: "navy" | "red" | "emerald" | "amber" | "slate";
}) {
  const tones: Record<string, string> = {
    navy: "text-navy-900",
    red: "text-red-600",
    emerald: "text-emerald-600",
    amber: "text-amber-700",
    slate: "text-slate-600",
  };
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className={`mt-0.5 text-base font-semibold tabular ${tones[tone]}`}>{value}</div>
    </div>
  );
}
