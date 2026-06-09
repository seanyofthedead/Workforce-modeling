"use client";

import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

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
}

export function StatTile({
  label,
  value,
  sublabel,
  icon,
  delta,
  deltaDirection = "flat",
  deltaGoodWhen = "up",
  accent = "navy",
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </span>
        {icon && <span className={`rounded-lg p-1.5 ${accents[accent]}`}>{icon}</span>}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular tracking-tight text-navy-900">
        {value}
      </div>
      <div className="mt-1 flex items-center justify-between">
        {sublabel && <span className="text-xs text-slate-500">{sublabel}</span>}
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
