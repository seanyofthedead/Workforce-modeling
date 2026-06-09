"use client";

import { ReactNode, useState } from "react";
import { Info, X } from "lucide-react";
import { RiskLevel, Criticality } from "@/lib/types";

// --- layout primitives ----------------------------------------------------

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
  icon,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 rounded-lg bg-navy-50 p-2 text-navy-700">{icon}</div>
        )}
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-navy-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {icon && <div className="rounded-lg bg-navy-700 p-2 text-white">{icon}</div>}
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-navy-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

// --- badges ---------------------------------------------------------------

const RISK_STYLES: Record<RiskLevel, string> = {
  Severe: "bg-red-100 text-red-800 ring-red-600/20",
  Elevated: "bg-amber-100 text-amber-800 ring-amber-600/20",
  Moderate: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
  Low: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${RISK_STYLES[level]}`}
    >
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {level}
    </span>
  );
}

const CRIT_STYLES: Record<Criticality, string> = {
  Critical: "bg-navy-700 text-white",
  High: "bg-navy-100 text-navy-800",
  Moderate: "bg-slate-100 text-slate-700",
};

export function CriticalityBadge({ level }: { level: Criticality }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${CRIT_STYLES[level]}`}
    >
      {level}
    </span>
  );
}

export function Pill({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "navy" | "emerald" | "amber" | "red";
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    navy: "bg-navy-50 text-navy-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// --- progress / meters ----------------------------------------------------

export function Meter({
  value,
  tone = "navy",
}: {
  value: number; // 0-100
  tone?: "navy" | "emerald" | "amber" | "red";
}) {
  const tones: Record<string, string> = {
    navy: "bg-navy-600",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${tones[tone]} transition-all duration-500`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function toneForCoverage(c: number): "emerald" | "amber" | "red" {
  if (c >= 92) return "emerald";
  if (c >= 82) return "amber";
  return "red";
}

// --- how to read this (legend) --------------------------------------------

/**
 * Dismissible legend that decodes the two badge taxonomies (Risk, Criticality)
 * and the three staffing nouns (Authorized / Required / Onboard) so a first-time
 * viewer can read the screen without narration.
 */
export function HowToRead() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-start lg:gap-6">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-700">
            <Info className="h-4 w-4" /> How to read this
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Risk:</span>
            <LegendDot className="bg-red-500" label="Severe" />
            <LegendDot className="bg-amber-500" label="Elevated" />
            <LegendDot className="bg-yellow-400" label="Moderate" />
            <LegendDot className="bg-emerald-500" label="Low" />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Mission criticality:</span>
            <span className="font-medium text-navy-800">Critical</span>
            <span>›</span>
            <span className="text-navy-700">High</span>
            <span>›</span>
            <span className="text-slate-500">Moderate</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
            <span>
              <strong className="text-navy-800">Onboard</strong> = staff today
            </span>
            <span className="text-slate-300">·</span>
            <span>
              <strong className="text-navy-800">Authorized</strong> = funded ceiling
            </span>
            <span className="text-slate-300">·</span>
            <span>
              <strong className="text-navy-800">Required</strong> = mission need
            </span>
          </div>
        </div>

        <button
          onClick={() => setOpen(false)}
          aria-label="Dismiss legend"
          className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full ${className}`} />
      {label}
    </span>
  );
}

// --- insight panel --------------------------------------------------------

export function InsightPanel({
  title,
  children,
  tone = "navy",
  icon,
}: {
  title: string;
  children: ReactNode;
  tone?: "navy" | "amber" | "red" | "emerald";
  icon?: ReactNode;
}) {
  const tones: Record<string, string> = {
    navy: "border-navy-200 bg-navy-50/60",
    amber: "border-amber-200 bg-amber-50/70",
    red: "border-red-200 bg-red-50/70",
    emerald: "border-emerald-200 bg-emerald-50/70",
  };
  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-navy-900">
        {icon}
        {title}
      </div>
      <div className="text-sm leading-relaxed text-slate-700">{children}</div>
    </div>
  );
}
