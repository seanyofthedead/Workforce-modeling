"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Layers,
  SlidersHorizontal,
  Scale,
  Target,
  ClipboardList,
  BookOpen,
  ShieldHalf,
} from "lucide-react";
import { ModelProvider, useModel } from "./model-context";
import { SCENARIOS } from "@/lib/data";
import { RiskBadge } from "./ui";
import ExecutiveDashboard from "./views/ExecutiveDashboard";
import DivisionModel from "./views/DivisionModel";
import GradeMixPlanner from "./views/GradeMixPlanner";
import ScenarioModeling from "./views/ScenarioModeling";
import BudgetVariance from "./views/BudgetVariance";
import MissionEstimator from "./views/MissionEstimator";
import BriefingView from "./views/BriefingView";
import Methodology from "./views/Methodology";

type TabId =
  | "dashboard"
  | "divisions"
  | "grademix"
  | "scenarios"
  | "variance"
  | "missions"
  | "briefing"
  | "methodology";

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
  { id: "divisions", label: "Division Model", icon: Building2 },
  { id: "grademix", label: "Grade / Level Mix", icon: Layers },
  { id: "scenarios", label: "Scenario Modeling", icon: SlidersHorizontal },
  { id: "variance", label: "Budget Variance", icon: Scale },
  { id: "missions", label: "Mission Staffing", icon: Target },
  { id: "briefing", label: "Briefing View", icon: ClipboardList },
  { id: "methodology", label: "Methodology", icon: BookOpen },
];

function ScenarioIndicator() {
  const { scenarioId, isCustom, model } = useModel();
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <div className="text-[11px] uppercase tracking-wide text-navy-200">
          Active Scenario
        </div>
        <div className="text-sm font-semibold text-white">
          {scenario.name}
          {isCustom && <span className="ml-1 text-navy-200">(adjusted)</span>}
        </div>
      </div>
      <RiskBadge level={model.kpis.risk} />
    </div>
  );
}

function Shell() {
  const [tab, setTab] = useState<TabId>("dashboard");

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Masthead */}
      <header className="border-b border-navy-800 bg-navy-900 text-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 p-2 ring-1 ring-white/15">
              <ShieldHalf className="h-6 w-6 text-agency-accent" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight tracking-tight sm:text-lg">
                Workforce Modeling Command Center
              </h1>
              <p className="text-[11px] text-navy-200 sm:text-xs">
                DHS HQ · Office of the Chief Financial Officer · Resource Management Division
              </p>
            </div>
          </div>
          <ScenarioIndicator />
        </div>

        {/* Primary navigation */}
        <nav className="mx-auto max-w-[1400px] px-2 sm:px-4">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-t-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-100 text-navy-900"
                      : "text-navy-100 hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Demo disclosure banner */}
      <div className="border-b border-amber-200 bg-amber-50">
        <div className="mx-auto max-w-[1400px] px-4 py-1.5 text-center text-[11px] font-medium text-amber-800 sm:px-6">
          DEMONSTRATION ENVIRONMENT — Synthetic, illustrative data only. Not actual DHS, OCFO,
          or federal personnel or budget information. Outputs support, and do not replace,
          leadership judgment.
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        {tab === "dashboard" && <ExecutiveDashboard onNavigate={(t) => setTab(t as TabId)} />}
        {tab === "divisions" && <DivisionModel />}
        {tab === "grademix" && <GradeMixPlanner />}
        {tab === "scenarios" && <ScenarioModeling />}
        {tab === "variance" && <BudgetVariance />}
        {tab === "missions" && <MissionEstimator />}
        {tab === "briefing" && <BriefingView />}
        {tab === "methodology" && <Methodology />}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-4 text-xs text-slate-500 sm:px-6">
          Workforce Modeling Command Center · Decision-support demonstration · Figures are
          modeled estimates derived from synthetic workforce, position, attrition, grade-cost,
          hiring-pace, and mission-demand assumptions.
        </div>
      </footer>
    </div>
  );
}

export default function CommandCenter() {
  return (
    <ModelProvider>
      <Shell />
    </ModelProvider>
  );
}
