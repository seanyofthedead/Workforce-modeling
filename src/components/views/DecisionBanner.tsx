"use client";

import { ShieldHalf, Gauge, Scale, AlertTriangle } from "lucide-react";
import { useModel } from "../model-context";
import { RiskBadge } from "../ui";
import { SCENARIOS } from "@/lib/data";
import { fmtUSDCompact, fmtNum } from "@/lib/format";

/**
 * Answer-first banner at the top of the Executive Dashboard. States the workforce
 * posture in one sentence and surfaces the three numbers an OCFO executive needs
 * before anything else: mission coverage, cost vs. topline, and overall risk.
 */
export default function DecisionBanner() {
  const { model, scenarioId, isCustom } = useModel();
  const k = model.kpis;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  const topRisks = [...model.divisions]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 2);

  const staffShort = Math.max(0, k.required - k.onboard);
  const understaffed = k.coverage < 95;
  const overTopline = k.variance < 0;

  const staffingVerdict = understaffed
    ? `${k.coverage.toFixed(0)}% staffed to mission — short ${fmtNum(staffShort)} FTE`
    : `fully staffed to mission at ${k.coverage.toFixed(0)}%`;
  const budgetVerdict = overTopline
    ? `${fmtUSDCompact(Math.abs(k.variance))} over the personnel topline`
    : `${fmtUSDCompact(Math.abs(k.variance))} under the topline`;
  const riskVerdict =
    topRisks.length >= 2
      ? `risk concentrates in ${topRisks[0].shortName} and ${topRisks[1].shortName}`
      : topRisks.length === 1
      ? `risk concentrates in ${topRisks[0].shortName}`
      : `no division is at elevated risk`;

  const coverageTone =
    k.coverage >= 92 ? "emerald" : k.coverage >= 82 ? "amber" : "red";
  const varianceTone = k.variance >= 0 ? "emerald" : "red";

  return (
    <section className="overflow-hidden rounded-2xl border border-navy-800 bg-navy-900 text-white shadow-panel">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-stretch lg:justify-between">
        {/* Verdict */}
        <div className="flex max-w-2xl items-start gap-3">
          <div className="mt-0.5 shrink-0 rounded-lg bg-white/10 p-2 ring-1 ring-white/15">
            <ShieldHalf className="h-5 w-5 text-agency-accent" />
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-navy-200">
              Workforce posture · {scenario.name}
              {isCustom && <span className="ml-1 text-navy-300">(adjusted)</span>}
            </div>
            <p className="mt-1.5 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              OCFO is {staffingVerdict}, {budgetVerdict}, and {riskVerdict}.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-navy-100">
              {understaffed
                ? "The shortfall is concentrated in our highest-criticality divisions — sequencing fills there protects mission delivery first."
                : "Posture is at requirement; the priority shifts to holding strength against attrition."}{" "}
              {k.timeToTargetMonths >= 99
                ? "At the current pace, attrition outpaces hiring and authorized vacancies will not close without intervention."
                : `At the current pace, authorized vacancies close in about ${k.timeToTargetMonths} months.`}
            </p>
          </div>
        </div>

        {/* Hero metrics */}
        <div className="grid grid-cols-3 gap-3 lg:w-[440px] lg:shrink-0">
          <HeroStat
            icon={<Gauge className="h-4 w-4" />}
            label="Mission coverage"
            value={`${k.coverage.toFixed(0)}%`}
            word={understaffed ? "Understaffed" : "At target"}
            tone={coverageTone}
          />
          <HeroStat
            icon={<Scale className="h-4 w-4" />}
            label="Cost vs topline"
            value={fmtUSDCompact(k.variance)}
            word={overTopline ? "Over topline" : "Within budget"}
            tone={varianceTone}
          />
          <HeroStat
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Risk posture"
            value={`${k.riskCount}`}
            valueSuffix=" div."
            word={k.risk}
            tone={k.risk === "Severe" ? "red" : k.risk === "Elevated" ? "amber" : "emerald"}
            badge={<RiskBadge level={k.risk} />}
          />
        </div>
      </div>
    </section>
  );
}

const WORD_TONES: Record<string, string> = {
  emerald: "bg-emerald-500/20 text-emerald-200 ring-emerald-300/30",
  amber: "bg-amber-500/20 text-amber-100 ring-amber-300/30",
  red: "bg-red-500/25 text-red-100 ring-red-300/30",
};

function HeroStat({
  icon,
  label,
  value,
  valueSuffix,
  word,
  tone,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueSuffix?: string;
  word: string;
  tone: "emerald" | "amber" | "red";
  badge?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-navy-200">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-semibold tabular tracking-tight text-white">
        {value}
        {valueSuffix && <span className="text-sm font-normal text-navy-200">{valueSuffix}</span>}
      </div>
      <div className="mt-1.5">
        {badge ?? (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${WORD_TONES[tone]}`}
          >
            {word}
          </span>
        )}
      </div>
    </div>
  );
}
