"use client";

import { useState } from "react";
import { Target, Lightbulb } from "lucide-react";
import { useModel } from "../model-context";
import { Card, CardHeader, SectionTitle, Meter, Pill, InsightPanel, toneForCoverage } from "../ui";
import { fmtNum, fmtUSDCompact, fmtPct } from "@/lib/format";

export default function MissionEstimator() {
  const { model } = useModel();
  const [selectedId, setSelectedId] = useState(model.missions[0].id);
  const mission = model.missions.find((m) => m.id === selectedId) ?? model.missions[0];

  const coverage = mission.recommendedFte > 0 ? (mission.currentFte / mission.recommendedFte) * 100 : 0;
  const confidenceTone =
    mission.confidence >= 0.82 ? "emerald" : mission.confidence >= 0.7 ? "amber" : "red";

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Mission Staffing Estimator"
        subtitle="Recommended staffing, grade levels, and cost by mission area"
        icon={<Target className="h-4 w-4" />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Mission selector */}
        <div className="space-y-2 lg:col-span-1">
          {model.missions.map((m) => {
            const active = m.id === selectedId;
            const cov = m.recommendedFte > 0 ? (m.currentFte / m.recommendedFte) * 100 : 0;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  active
                    ? "border-navy-600 bg-navy-700 text-white"
                    : "border-slate-200 bg-white hover:border-navy-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${active ? "text-white" : "text-navy-900"}`}>
                    {m.name}
                  </span>
                  <span
                    className={`text-xs tabular ${
                      active ? "text-navy-100" : m.gap > 0 ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {m.gap > 0 ? `-${m.gap}` : `+${-m.gap}`} FTE
                  </span>
                </div>
                <div className={`mt-1 text-[11px] ${active ? "text-navy-100" : "text-slate-500"}`}>
                  {cov.toFixed(0)}% staffed · {fmtUSDCompact(m.annualCost)}/yr
                </div>
              </button>
            );
          })}
        </div>

        {/* Mission detail */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader
              title={mission.name}
              subtitle={mission.summary}
              icon={<Target className="h-4 w-4" />}
              right={
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">
                    Confidence
                  </div>
                  <Pill tone={confidenceTone}>{fmtPct(mission.confidence, 0)}</Pill>
                </div>
              }
            />
            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
              <Stat label="Recommended FTE" value={fmtNum(mission.recommendedFte)} />
              <Stat label="Current FTE" value={fmtNum(mission.currentFte)} />
              <Stat
                label="Staffing Gap"
                value={`${mission.gap > 0 ? "-" : "+"}${fmtNum(Math.abs(mission.gap))}`}
                tone={mission.gap > 0 ? "red" : "emerald"}
              />
              <Stat label="Est. Annual Cost" value={fmtUSDCompact(mission.annualCost)} />
            </div>
            <div className="px-5 pb-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-500">Mission staffing coverage</span>
                <span className="font-medium text-navy-900">{coverage.toFixed(0)}%</span>
              </div>
              <Meter value={coverage} tone={toneForCoverage(coverage)} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Required Roles & Recommended Grade Levels" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-2.5 font-medium">Role</th>
                    <th className="px-4 py-2.5 font-medium">Recommended Grades</th>
                    <th className="px-4 py-2.5 text-right font-medium">Positions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mission.roles.map((r) => (
                    <tr key={r.role} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 font-medium text-navy-900">{r.role}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {r.grades.map((g) => (
                            <Pill key={g} tone="navy">
                              {g}
                            </Pill>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular">{fmtNum(r.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <InsightPanel title="Estimator rationale" tone="navy" icon={<Lightbulb className="h-4 w-4" />}>
            {mission.rationale} The estimate reflects a confidence of{" "}
            <strong>{fmtPct(mission.confidence, 0)}</strong>, recognizing{" "}
            {mission.confidence >= 0.82
              ? "well-characterized, recurring demand."
              : mission.confidence >= 0.7
              ? "moderate uncertainty in demand and skill mix."
              : "material uncertainty in emergent demand and specialized talent availability."}
          </InsightPanel>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "navy",
}: {
  label: string;
  value: string;
  tone?: "navy" | "red" | "emerald";
}) {
  const tones: Record<string, string> = {
    navy: "text-navy-900",
    red: "text-red-600",
    emerald: "text-emerald-600",
  };
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold tabular ${tones[tone]}`}>{value}</div>
    </div>
  );
}
