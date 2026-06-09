"use client";

import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

type Tone = "navy" | "emerald" | "amber" | "red" | "slate";

export interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
  icon?: ReactNode;
  /** Delta vs baseline, already formatted. */
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  /** Whether an "up" delta is good (green) or bad (red). */
  deltaGoodWhen?: "up" | "down";
  accent?: "navy" | "emerald" | "amber" | "red";
  /** Plain-English verdict chip, e.g. "Understaffed" / "Within budget". */
  statusWord?: string;
  /** Color of the status chip; defaults to `accent`. */
  statusTone?: Tone;
  /** "hero" renders a larger, lead tile for the executive dashboard. */
  size?: "default" | "hero";
}

const STATUS_TONES: Record<Tone, string> = {
  navy: "bg-navy-50 text-navy-700 ring-navy-600/15",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/15",
};

export function StatTile({
  label,
  value,
  sublabel,
  icon,
  delta,
  deltaDirection = "flat",
  deltaGoodWhen = "up",
  accent = "navy",
  statusWord,
  statusTone,
  size = "default",
}: StatTileProps) {
  const accents: Record<string, string> = {
    navy: "text-navy-700 bg-navy-50",
    emerald: "text-emerald-700 bg-emerald-50",
    amber: "text-amber-700 bg-amber-50",
    red: "text-red-700 bg-red-50",
  };

  let deltaColor = "text-slate-500";
  if (deltaDirection !== "flat") {
    const isGood = deltaDirection === deltaGoodWhen;
    deltaColor = isGood ? "text-emerald-600" : "text-red-600";
  }
  const DeltaIcon =
    deltaDirection === "up" ? ArrowUpRight : deltaDirection === "down" ? ArrowDownRight : Minus;

  const hero = size === "hero";
  const chip = statusWord ? (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${
        STATUS_TONES[statusTone ?? accent]
      }`}
    >
      {statusWord}
    </span>
  ) : null;

  return (
    <div
      className={`rounded-xl border bg-white shadow-card ${
        hero ? "border-slate-200 p-5" : "border-slate-200 p-4"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`font-medium uppercase tracking-wide text-slate-600 ${
            hero ? "text-xs" : "text-xs"
          }`}
        >
          {label}
        </span>
        {icon && <span className={`rounded-lg p-1.5 ${accents[accent]}`}>{icon}</span>}
      </div>
      <div
        className={`mt-2 font-semibold tabular tracking-tight text-navy-900 ${
          hero ? "text-3xl sm:text-4xl" : "text-2xl"
        }`}
      >
        {value}
      </div>
      {hero && chip && <div className="mt-2">{chip}</div>}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        {sublabel && <span className="text-xs text-slate-500">{sublabel}</span>}
        {!hero && chip}
        {delta && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${deltaColor}`}>
            <DeltaIcon className="h-3.5 w-3.5" />
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
