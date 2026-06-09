"use client";

import { Layers, Wand2 } from "lucide-react";
import { useModel } from "../model-context";
import { Card, CardHeader, SectionTitle, InsightPanel, Pill } from "../ui";
import { GradeMixChart } from "../charts";
import { GRADE_MISSION_NOTE } from "@/lib/calc";
import { fmtNum, fmtUSD, fmtUSDCompact, fmtSigned } from "@/lib/format";

export default function GradeMixPlanner() {
  const { model } = useModel();
  const rollup = model.gradeRollup;

  const totalCostImpact = rollup.reduce((s, r) => s + r.costImpact, 0);
  const contractorRow = rollup.find((r) => r.grade === "Contractor")!;
  const chartData = rollup.map((r) => ({
    grade: r.grade,
    current: r.current,
    recommended: r.recommended,
  }));

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Grade / Level Mix Planner"
        subtitle="Estimated staffing need by grade level, with cost and mission impact of re-balancing"
        icon={<Layers className="h-4 w-4" />}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Current vs. Recommended Mix"
            subtitle="Recommended mix scales to mission requirement and reduces contractor reliance"
            icon={<Layers className="h-4 w-4" />}
          />
          <div className="p-4">
            <GradeMixChart data={chartData} />
          </div>
        </Card>

        <div className="space-y-4">
          <InsightPanel
            title="Recommended re-balancing"
            tone={totalCostImpact > 0 ? "amber" : "emerald"}
            icon={<Wand2 className="h-4 w-4" />}
          >
            Aligning to the recommended mix shifts roughly{" "}
            <strong>{fmtNum(Math.abs(contractorRow.delta))}</strong> contractor-funded positions
            toward journey and senior federal grades. Net modeled cost impact:{" "}
            <strong>{fmtUSDCompact(totalCostImpact)}</strong>{" "}
            {totalCostImpact <= 0
              ? "— converting premium contractor capacity to federal FTE reduces recurring cost while deepening institutional capability."
              : "— a modest near-term investment that buys durable in-house capacity and lowers conversion risk."}
          </InsightPanel>

          <Card>
            <CardHeader title="Mix at a glance" />
            <div className="space-y-2 p-4">
              {rollup.map((r) => (
                <div key={r.grade} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-navy-900">{r.grade}</span>
                  <div className="flex items-center gap-2">
                    <span className="tabular text-slate-500">{r.current}</span>
                    <span className="text-slate-300">→</span>
                    <span className="tabular font-semibold text-navy-900">{r.recommended}</span>
                    <Pill tone={r.delta > 0 ? "emerald" : r.delta < 0 ? "amber" : "slate"}>
                      {fmtSigned(r.delta)}
                    </Pill>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Grade-Level Staffing Model"
          subtitle="Per-grade recommendation, cost impact, mission impact, and risk if not staffed"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Level</th>
                <th className="px-4 py-3 text-right font-medium">Current</th>
                <th className="px-4 py-3 text-right font-medium">Recommended</th>
                <th className="px-4 py-3 text-right font-medium">Δ</th>
                <th className="px-4 py-3 text-right font-medium">Loaded Cost</th>
                <th className="px-4 py-3 text-right font-medium">Cost Impact</th>
                <th className="px-4 py-3 font-medium">Mission Impact</th>
                <th className="px-4 py-3 font-medium">Risk if Not Staffed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rollup.map((r) => (
                <tr key={r.grade} className="align-top hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-navy-900">
                    {r.grade}
                    <div className="mt-0.5 max-w-[180px] text-[11px] font-normal text-slate-400">
                      {GRADE_MISSION_NOTE[r.grade]}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular">{fmtNum(r.current)}</td>
                  <td className="px-4 py-3 text-right tabular font-semibold">
                    {fmtNum(r.recommended)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular font-medium ${
                      r.delta > 0 ? "text-emerald-600" : r.delta < 0 ? "text-amber-700" : "text-slate-400"
                    }`}
                  >
                    {fmtSigned(r.delta)}
                  </td>
                  <td className="px-4 py-3 text-right tabular text-slate-600">
                    {fmtUSD(r.unitCost)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular font-medium ${
                      r.costImpact > 0 ? "text-amber-700" : r.costImpact < 0 ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {fmtUSDCompact(r.costImpact)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{r.missionImpact}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{r.riskIfUnstaffed}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-navy-900">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right tabular">
                  {fmtNum(rollup.reduce((s, r) => s + r.current, 0))}
                </td>
                <td className="px-4 py-3 text-right tabular">
                  {fmtNum(rollup.reduce((s, r) => s + r.recommended, 0))}
                </td>
                <td className="px-4 py-3 text-right tabular">
                  {fmtSigned(rollup.reduce((s, r) => s + r.delta, 0))}
                </td>
                <td className="px-4 py-3" />
                <td
                  className={`px-4 py-3 text-right tabular ${
                    totalCostImpact > 0 ? "text-amber-700" : "text-emerald-600"
                  }`}
                >
                  {fmtUSDCompact(totalCostImpact)}
                </td>
                <td className="px-4 py-3" colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
