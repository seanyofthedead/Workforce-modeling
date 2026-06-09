"use client";

import {
  BookOpen,
  Database,
  Calculator,
  ShieldAlert,
  Plug,
  ScrollText,
} from "lucide-react";
import { Card, CardHeader, SectionTitle, InsightPanel, Pill } from "../ui";
import { GRADE_COST } from "@/lib/calc";
import { GRADES } from "@/lib/types";
import { PLANNED_PERSONNEL_BUDGET } from "@/lib/data";
import { fmtUSD, fmtUSDCompact } from "@/lib/format";

export default function Methodology() {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Modeling Notes & Methodology"
        subtitle="How the Command Center produces its estimates — and how it would work in production"
        icon={<BookOpen className="h-4 w-4" />}
      />

      <InsightPanel title="Read this first" tone="amber" icon={<ShieldAlert className="h-4 w-4" />}>
        This is a <strong>demonstration environment built on synthetic data</strong>. All figures
        are illustrative and do not represent real DHS, OCFO, or any federal personnel, position, or
        budget information. Forecasts are modeled estimates intended to show the shape of the
        decision, not authoritative numbers. <strong>Outputs support, and do not replace,
        leadership judgment.</strong>
      </InsightPanel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="What the model combines" icon={<Calculator className="h-4 w-4" />} />
          <ul className="space-y-3 p-5 text-sm text-slate-700">
            <Item label="Workforce supply">
              Current onboard strength by division, distributed across grade levels using a
              division-specific staffing profile.
            </Item>
            <Item label="Authorized positions">
              Funded position ceilings, against which vacancies and fill rates are measured.
            </Item>
            <Item label="Attrition">
              An annual separation rate (blended from a scenario lever and a division-specific
              tendency) that erodes onboard strength before hiring is applied.
            </Item>
            <Item label="Grade-level cost assumptions">
              Fully burdened annual cost per grade — salary, benefits, and overhead — used to roll
              up division and enterprise cost.
            </Item>
            <Item label="Hiring pace">
              The share of the vacancy gap filled each fiscal year, net of attrition.
            </Item>
            <Item label="Contractor conversion">
              The share of contractor capacity converted to federal FTE, shifting cost and capability.
            </Item>
            <Item label="Mission demand">
              Annual growth in mission-required staffing, which moves the requirement the workforce
              is measured against.
            </Item>
          </ul>
        </Card>

        <Card>
          <CardHeader title="How the projection works" icon={<ScrollText className="h-4 w-4" />} />
          <ol className="space-y-3 p-5 text-sm text-slate-700">
            <Step n={1}>
              For each division and fiscal year (FY2026–FY2030), the model applies attrition, then
              fills a share of the remaining gap to authorized strength at the scenario&rsquo;s
              hiring pace.
            </Step>
            <Step n={2}>
              Onboard strength is distributed across grades, contractor conversion is applied, and
              cost is computed with a compounding pay-raise factor.
            </Step>
            <Step n={3}>
              Mission coverage is the criticality-weighted ratio of onboard to mission-required
              staffing; risk blends coverage shortfall, vacancy pressure, criticality, and projected
              erosion.
            </Step>
            <Step n={4}>
              Budget variance compares projected cost to the planned personnel topline
              (adjusted by the scenario&rsquo;s budget lever). Negative variance is a projected
              shortfall; positive variance signals under-execution.
            </Step>
            <Step n={5}>
              Time-to-target reads the month authorized vacancies effectively close
              (95% of authorized strength) directly off the year-by-year vacancy
              projection, interpolating between fiscal years. If the curve plateaus
              above target, attrition outpaces hiring and the target is off track.
            </Step>
          </ol>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Key cost assumptions"
          subtitle={`Fully burdened annual cost per grade · Planned personnel topline: ${fmtUSDCompact(
            PLANNED_PERSONNEL_BUDGET
          )}`}
          icon={<Database className="h-4 w-4" />}
        />
        <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
          {GRADES.map((g) => (
            <div key={g} className="bg-white p-4">
              <div className="text-xs font-medium text-slate-500">{g}</div>
              <div className="mt-1 text-lg font-semibold tabular text-navy-900">
                {fmtUSD(GRADE_COST[g])}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="In a production deployment" icon={<Plug className="h-4 w-4" />} />
        <div className="p-5">
          <p className="text-sm leading-relaxed text-slate-700">
            In production, the model would draw from authoritative systems of record rather than
            synthetic data, with appropriate authority to operate, access controls, and data
            governance:
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill tone="navy">HR / personnel systems (onboard &amp; grade)</Pill>
            <Pill tone="navy">Position management (authorized ceilings)</Pill>
            <Pill tone="navy">Payroll (actual loaded cost)</Pill>
            <Pill tone="navy">Budget formulation &amp; execution</Pill>
            <Pill tone="navy">Time &amp; attendance / attrition history</Pill>
            <Pill tone="navy">Workforce &amp; mission planning</Pill>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-700">
            Cost factors would be calibrated to enacted pay tables and locality rates, attrition
            would be fit to historical separation data, and mission demand would be sourced from
            programming and planning guidance. The modeling approach — supply, authorized positions,
            attrition, grade-level cost, hiring pace, and mission demand — remains the same.
          </p>
        </div>
      </Card>
    </div>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-500" />
      <span>
        <strong className="text-navy-900">{label}.</strong> {children}
      </span>
    </li>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-700 text-xs font-semibold text-white">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}
