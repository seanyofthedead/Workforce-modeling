"use client";

import { fmtNum } from "@/lib/format";

/**
 * One bar that reconciles the three staffing nouns executives keep conflating:
 * Onboard (have) → +Vacancies to Authorized (funded) → +Gap to Required (mission need).
 * Replaces five scattered tiles with a single "have vs funded vs need" picture.
 */
export default function StaffingWaterfall({
  onboard,
  authorized,
  required,
}: {
  onboard: number;
  authorized: number;
  required: number;
}) {
  const vacToAuth = Math.max(0, authorized - onboard);
  const gapBeyondAuth = Math.max(0, required - authorized);
  const scale = Math.max(onboard + vacToAuth + gapBeyondAuth, required, authorized, 1);
  const pct = (v: number) => `${(v / scale) * 100}%`;

  const shortToRequired = Math.max(0, required - onboard);

  return (
    <div>
      <div className="flex h-9 w-full overflow-hidden rounded-lg ring-1 ring-slate-200">
        <Segment width={pct(onboard)} className="bg-navy-700" title={`Onboard ${fmtNum(onboard)}`}>
          {fmtNum(onboard)}
        </Segment>
        {vacToAuth > 0 && (
          <Segment
            width={pct(vacToAuth)}
            className="bg-amber-400 text-amber-950"
            title={`Funded vacancies ${fmtNum(vacToAuth)}`}
          >
            {fmtNum(vacToAuth)}
          </Segment>
        )}
        {gapBeyondAuth > 0 && (
          <Segment
            width={pct(gapBeyondAuth)}
            className="bg-red-500"
            title={`Unfunded gap to requirement ${fmtNum(gapBeyondAuth)}`}
          >
            {fmtNum(gapBeyondAuth)}
          </Segment>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
        <LegendItem className="bg-navy-700" label="Onboard (have)" value={fmtNum(onboard)} />
        <LegendItem
          className="bg-amber-400"
          label="Funded vacancies (to authorized)"
          value={fmtNum(vacToAuth)}
        />
        <LegendItem
          className="bg-red-500"
          label="Unfunded gap (to required)"
          value={fmtNum(gapBeyondAuth)}
        />
        <span className="ml-auto text-slate-500">
          Authorized <strong className="text-navy-900">{fmtNum(authorized)}</strong> · Required{" "}
          <strong className="text-navy-900">{fmtNum(required)}</strong> · Short{" "}
          <strong className="text-red-600">{fmtNum(shortToRequired)}</strong> of mission
        </span>
      </div>
    </div>
  );
}

function Segment({
  width,
  className,
  title,
  children,
}: {
  width: string;
  className: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ width }}
      title={title}
      className={`flex items-center justify-center text-[11px] font-semibold tabular text-white transition-all duration-500 ${className}`}
    >
      <span className="truncate px-1">{children}</span>
    </div>
  );
}

function LegendItem({
  className,
  label,
  value,
}: {
  className: string;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-600">
      <span className={`inline-block h-2.5 w-2.5 rounded-sm ${className}`} />
      {label}: <strong className="text-navy-900">{value}</strong>
    </span>
  );
}
