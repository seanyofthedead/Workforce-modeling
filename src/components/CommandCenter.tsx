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
  RotateCcw,
  GitCompareArrows,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { ModelProvider, useModel } from "./model-context";
import { SCENARIOS } from "@/lib/data";
import { RiskBadge } from "./ui";
import ExecutiveDashboard from "./views/ExecutiveDashboard";
import DivisionModel from "./views/DivisionModel";
import GradeMixPlanner from "./views/GradeMixPlanner";
import ScenarioModeling from "./views/ScenarioModeling";
import ScenarioCompare from "./views/ScenarioCompare";
import BudgetVariance from "./views/BudgetVariance";
import MissionEstimator from "./views/MissionEstimator";
import BriefingView from "./views/BriefingView";
import Methodology from "./views/Methodology";

type TabId =
  | "dashboard"
  | "divisions"
  | "grademix"
  | "scenarios"
  | "compare"
  | "variance"
  | "missions"
  | "briefing"
  | "methodology";

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
  { id: "divisions", label: "Division Model", icon: Building2 },
  { id: "grademix", label: "Grade / Level Mix", icon: Layers },
  { id: "scenarios", label: "Scenario Modeling", icon: SlidersHorizontal },
  { id: "compare", label: "A / B Compare", icon: GitCompareArrows },
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

interface DemoStep {
  title: string;
  body: string;
  tab: TabId;
  scenario: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    title: "The verdict",
    tab: "dashboard",
    scenario: "baseline",
    body: "Start on the Decision Banner. It states staffing, budget posture, and the divisions driving risk — the whole story in one sentence, before any chart.",
  },
  {
    title: "The cost of inaction",
    tab: "dashboard",
    scenario: "hiring-freeze",
    body: "We switched to Hiring Freeze and stayed on this screen. Watch coverage fall, the demand-supply gap widen, and the verdict update — live.",
  },
  {
    title: "Model it live",
    tab: "scenarios",
    scenario: "accelerated-hiring",
    body: "On Scenario Modeling, the Impact vs. Baseline ribbon shows the swing. Drag any lever and every metric across the app re-computes instantly.",
  },
  {
    title: "Where to act",
    tab: "divisions",
    scenario: "baseline",
    body: "The staffing waterfall reconciles have vs. funded vs. need. Risk concentrates in the flagged divisions — click any card to drill into its grade mix and trajectory.",
  },
  {
    title: "What to do — and the leave-behind",
    tab: "briefing",
    scenario: "baseline",
    body: "The Briefing View prioritizes hiring actions and supplies talking points. 'Print brief' produces a clean one-pager for leadership.",
  },
];

function GuidedDemo({
  step,
  onPrev,
  onNext,
  onExit,
}: {
  step: number;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
}) {
  const s = DEMO_STEPS[step];
  const last = step === DEMO_STEPS.length - 1;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 print:hidden">
      <div className="w-full max-w-xl rounded-2xl border border-navy-700 bg-navy-900 p-4 text-white shadow-panel">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-agency-accent text-xs font-bold text-navy-950">
              {step + 1}
            </span>
            <span className="text-sm font-semibold">
              Guided demo · {s.title}
            </span>
          </div>
          <button
            onClick={onExit}
            aria-label="Exit guided demo"
            className="rounded-md p-1 text-navy-200 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-navy-100">{s.body}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            {DEMO_STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-5 bg-agency-accent" : "w-1.5 bg-white/25"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={step === 0}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-navy-100 hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={last ? onExit : onNext}
              className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-navy-50"
            >
              {last ? "Finish" : "Next"}
              {!last && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioSwitcher() {
  const { scenarioId, isCustom, selectScenario, resetScenario } = useModel();
  return (
    <div className="border-b border-slate-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 px-4 py-2 sm:px-6">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Scenario
        </span>
        <div className="flex flex-wrap gap-1">
          {SCENARIOS.map((s) => {
            const active = s.id === scenarioId;
            return (
              <button
                key={s.id}
                onClick={() => selectScenario(s.id)}
                title={s.tagline}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-navy-700 text-white shadow-card"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
        {isCustom && (
          <button
            onClick={resetScenario}
            className="ml-auto inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-3 w-3" /> Reset adjustments
          </button>
        )}
      </div>
    </div>
  );
}

function Shell() {
  const [tab, setTab] = useState<TabId>("dashboard");
  const { selectScenario } = useModel();
  const [demoStep, setDemoStep] = useState<number | null>(null);

  const applyStep = (i: number) => {
    const s = DEMO_STEPS[i];
    setTab(s.tab);
    selectScenario(s.scenario);
    setDemoStep(i);
  };
  const exitDemo = () => {
    setDemoStep(null);
    setTab("dashboard");
    selectScenario("baseline");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Masthead */}
      <header className="border-b border-navy-800 bg-navy-900 text-white print:hidden">
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
              <p className="mt-0.5 text-[10px] text-navy-300">
                Planning year FY2026 · as of June 2026 · synthetic demonstration data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => applyStep(0)}
              className="hidden items-center gap-1.5 rounded-lg bg-agency-accent px-3 py-1.5 text-xs font-semibold text-navy-950 hover:brightness-105 sm:inline-flex"
            >
              <PlayCircle className="h-4 w-4" /> Start here
            </button>
            <ScenarioIndicator />
          </div>
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

      {/* Global scenario switcher — available on every screen */}
      <ScenarioSwitcher />

      {/* Demo disclosure banner — quiet, non-competing */}
      <div className="border-b border-slate-200 bg-slate-100">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-4 py-1.5 text-[11px] text-slate-500 sm:px-6">
          <span className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
            Demo data
          </span>
          <span>
            Synthetic, illustrative data only — not actual DHS, OCFO, or federal personnel or
            budget information. Outputs support, and do not replace, leadership judgment.
          </span>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        {tab === "dashboard" && <ExecutiveDashboard onNavigate={(t) => setTab(t as TabId)} />}
        {tab === "divisions" && <DivisionModel />}
        {tab === "grademix" && <GradeMixPlanner />}
        {tab === "scenarios" && <ScenarioModeling />}
        {tab === "compare" && <ScenarioCompare />}
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

      {demoStep !== null && (
        <GuidedDemo
          step={demoStep}
          onPrev={() => applyStep(Math.max(0, demoStep - 1))}
          onNext={() => applyStep(Math.min(DEMO_STEPS.length - 1, demoStep + 1))}
          onExit={exitDemo}
        />
      )}
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
