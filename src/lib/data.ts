// ---------------------------------------------------------------------------
// Synthetic demonstration data for the Workforce Modeling Command Center.
//
// All figures are illustrative and internally consistent for demo purposes.
// They do NOT represent real DHS, OCFO, or any federal personnel or budget data.
// ---------------------------------------------------------------------------

import {
  DivisionSeed,
  Grade,
  GradeCostTable,
  GradeProfile,
  Scenario,
} from "./types";

/** Fully burdened (loaded) annual cost per grade — salary + benefits + overhead. */
export const GRADE_COST: GradeCostTable = {
  "GS-9": 96_500,
  "GS-11": 116_800,
  "GS-12": 139_400,
  "GS-13": 165_900,
  "GS-14": 195_700,
  "GS-15": 228_300,
  SES: 298_000,
  Contractor: 187_500,
};

/** Short, plain-language note used in the grade-mix planner. */
export const GRADE_MISSION_NOTE: Record<Grade, string> = {
  "GS-9": "Entry analyst capacity; supports execution and data preparation.",
  "GS-11": "Developmental analysts; recurring reporting and reconciliation.",
  "GS-12": "Journey-level analysts; core formulation and execution workload.",
  "GS-13": "Senior analysts and team leads; backbone of division output.",
  "GS-14": "Branch chiefs and subject-matter experts; cross-cutting oversight.",
  "GS-15": "Division leadership and senior advisors; portfolio accountability.",
  SES: "Executive direction, governance, and enterprise risk ownership.",
  Contractor: "Surge and specialized capacity; convertible to federal FTE.",
};

function profile(
  g9: number,
  g11: number,
  g12: number,
  g13: number,
  g14: number,
  g15: number,
  ses: number,
  ctr: number
): GradeProfile {
  return {
    "GS-9": g9,
    "GS-11": g11,
    "GS-12": g12,
    "GS-13": g13,
    "GS-14": g14,
    "GS-15": g15,
    SES: ses,
    Contractor: ctr,
  };
}

// Calibrated for operational realism: vacancy rates spread from ~9% to ~24%,
// grade profiles are mission-specific (senior-heavy front office, journey-heavy
// budget, contractor/tech-heavy systems, reviewer-heavy controls), attrition
// varies by talent market (tech flight high, leadership low), and the set spans
// a healthy office through a division in genuine distress so charts show contrast.
export const DIVISIONS: DivisionSeed[] = [
  {
    id: "front-office",
    name: "OCFO Front Office",
    shortName: "Front Office",
    // Small, senior-heavy, sticky leadership office — the healthy anchor.
    onboard: 30,
    authorized: 33,
    required: 31,
    criticality: "High",
    attritionBias: 0.05,
    profile: profile(0.02, 0.04, 0.08, 0.12, 0.24, 0.3, 0.14, 0.06),
    missionAreas: ["component-coordination", "surge-support"],
  },
  {
    id: "budget-division",
    name: "Budget Division",
    shortName: "Budget",
    // Largest division; journey-analyst backbone of formulation/execution.
    onboard: 138,
    authorized: 162,
    required: 174,
    criticality: "Critical",
    attritionBias: 0.1,
    profile: profile(0.04, 0.11, 0.22, 0.29, 0.15, 0.07, 0.01, 0.11),
    missionAreas: ["budget-formulation", "budget-execution"],
  },
  {
    id: "financial-systems",
    name: "Financial Systems Division",
    shortName: "Fin. Systems",
    // Distress case: heavy contractor reliance, tech-talent flight, widest gap.
    onboard: 76,
    authorized: 104,
    required: 118,
    criticality: "Critical",
    attritionBias: 0.16,
    profile: profile(0.05, 0.08, 0.14, 0.22, 0.13, 0.05, 0.02, 0.31),
    missionAreas: ["systems-modernization", "data-analytics"],
  },
  {
    id: "resource-management",
    name: "Resource Management Division",
    shortName: "Resource Mgmt",
    onboard: 71,
    authorized: 84,
    required: 90,
    criticality: "High",
    attritionBias: 0.09,
    profile: profile(0.04, 0.09, 0.17, 0.27, 0.19, 0.09, 0.02, 0.13),
    missionAreas: ["budget-execution", "data-analytics", "surge-support"],
  },
  {
    id: "financial-reporting",
    name: "Financial Reporting Division",
    shortName: "Fin. Reporting",
    // Audit-driven accountant shop; well-staffed and stable.
    onboard: 98,
    authorized: 110,
    required: 106,
    criticality: "High",
    attritionBias: 0.07,
    profile: profile(0.06, 0.13, 0.21, 0.26, 0.15, 0.06, 0.01, 0.12),
    missionAreas: ["financial-reporting", "internal-controls"],
  },
  {
    id: "internal-controls",
    name: "Internal Controls Division",
    shortName: "Internal Controls",
    // A-123 reviewer-heavy (GS-14); scope grew faster than hiring.
    onboard: 53,
    authorized: 66,
    required: 73,
    criticality: "Critical",
    attritionBias: 0.11,
    profile: profile(0.03, 0.07, 0.14, 0.26, 0.23, 0.1, 0.02, 0.15),
    missionAreas: ["internal-controls", "financial-reporting"],
  },
  {
    id: "procurement-liaison",
    name: "Procurement Support Liaison",
    shortName: "Procurement",
    // Small support office, modest criticality, near requirement.
    onboard: 40,
    authorized: 45,
    required: 44,
    criticality: "Moderate",
    attritionBias: 0.08,
    profile: profile(0.06, 0.12, 0.22, 0.26, 0.16, 0.06, 0.01, 0.11),
    missionAreas: ["budget-execution", "component-coordination"],
  },
  {
    id: "component-coordination",
    name: "Component Coordination Office",
    shortName: "Component Coord.",
    // Relationship-dependent liaison work; senior analysts carry the load.
    onboard: 44,
    authorized: 56,
    required: 61,
    criticality: "High",
    attritionBias: 0.1,
    profile: profile(0.04, 0.09, 0.16, 0.27, 0.2, 0.1, 0.03, 0.11),
    missionAreas: ["component-coordination", "surge-support", "budget-formulation"],
  },
];

/**
 * Planned personnel topline (FY of record). Set below full authorized cost on a
 * realistic vacancy-lapse assumption, so the baseline runs modestly over (~-2.6%)
 * — a believable tension — while scenarios spread clearly over/under.
 */
export const PLANNED_PERSONNEL_BUDGET = 94_350_000;

/** Historical enterprise personnel cost, used to anchor the trend chart. */
export const HISTORICAL_COST: { fy: string; fyShort: string; cost: number }[] = [
  { fy: "FY2024", fyShort: "FY24", cost: 84_200_000 },
  { fy: "FY2025", fyShort: "FY25", cost: 90_600_000 },
];

export const BASE_FISCAL_YEAR = 2026;

// --- Scenario library -----------------------------------------------------

export const SCENARIOS: Scenario[] = [
  {
    id: "baseline",
    name: "Baseline / Current Plan",
    tagline: "Programmed hiring at current pace and enacted pay assumptions.",
    params: {
      attritionRate: 0.08,
      payRaisePct: 0.032,
      hiringPace: 0.45,
      contractorConversionPct: 0.05,
      budgetDeltaPct: 0.0,
      missionDemandGrowthPct: 0.03,
    },
  },
  {
    id: "hiring-freeze",
    name: "Hiring Freeze",
    tagline: "External hiring paused; attrition erodes onboard strength.",
    params: {
      attritionRate: 0.1,
      payRaisePct: 0.032,
      hiringPace: 0.03,
      contractorConversionPct: 0.0,
      budgetDeltaPct: -0.04,
      missionDemandGrowthPct: 0.03,
    },
  },
  {
    id: "accelerated-hiring",
    name: "Accelerated Hiring",
    tagline: "Aggressive fill of authorized vacancies with hiring surge support.",
    params: {
      attritionRate: 0.07,
      payRaisePct: 0.035,
      hiringPace: 0.85,
      contractorConversionPct: 0.1,
      budgetDeltaPct: 0.06,
      missionDemandGrowthPct: 0.04,
    },
  },
  {
    id: "mission-expansion",
    name: "Mission Expansion",
    tagline: "New mandates raise demand; staffing scaled to mission requirement.",
    params: {
      attritionRate: 0.08,
      payRaisePct: 0.035,
      hiringPace: 0.7,
      contractorConversionPct: 0.15,
      budgetDeltaPct: 0.12,
      missionDemandGrowthPct: 0.12,
    },
  },
  {
    id: "budget-reduction",
    name: "Budget Reduction",
    tagline: "Constrained funding; hiring throttled to protect the topline.",
    params: {
      attritionRate: 0.11,
      payRaisePct: 0.025,
      hiringPace: 0.15,
      contractorConversionPct: 0.0,
      budgetDeltaPct: -0.12,
      missionDemandGrowthPct: 0.02,
    },
  },
];

// --- Mission staffing reference data --------------------------------------

export interface MissionSeed {
  id: string;
  name: string;
  summary: string;
  /** Baseline staffing required to deliver the mission at target readiness. */
  baseRequired: number;
  /** Current FTE applied to the mission. */
  baseCurrent: number;
  confidence: number;
  rationale: string;
  roles: { role: string; grades: Grade[]; count: number }[];
}

export const MISSIONS: MissionSeed[] = [
  {
    id: "budget-formulation",
    name: "Budget Formulation",
    summary:
      "Build the President's Budget request, congressional justifications, and out-year projections.",
    baseRequired: 96,
    baseCurrent: 84,
    confidence: 0.88,
    rationale:
      "Demand is well understood and cyclical; staffing maps closely to the formulation calendar and component submissions.",
    roles: [
      { role: "Budget Formulation Analysts", grades: ["GS-12", "GS-13"], count: 52 },
      { role: "Program / Appropriation Leads", grades: ["GS-14"], count: 18 },
      { role: "Branch Chiefs", grades: ["GS-15"], count: 8 },
      { role: "Surge / Contract Analysts", grades: ["Contractor"], count: 18 },
    ],
  },
  {
    id: "budget-execution",
    name: "Budget Execution",
    summary:
      "Apportionment, allotment, obligation tracking, and execution reporting across components.",
    baseRequired: 108,
    baseCurrent: 92,
    confidence: 0.85,
    rationale:
      "Execution workload scales with obligation volume; current vacancies are concentrated at the journey-analyst level.",
    roles: [
      { role: "Execution Analysts", grades: ["GS-11", "GS-12", "GS-13"], count: 66 },
      { role: "Funds Control Leads", grades: ["GS-14"], count: 20 },
      { role: "Division Oversight", grades: ["GS-15", "SES"], count: 7 },
      { role: "Contract Support", grades: ["Contractor"], count: 15 },
    ],
  },
  {
    id: "financial-reporting",
    name: "Financial Reporting",
    summary:
      "Statement preparation, audit remediation, and SFFAS-compliant financial reporting.",
    baseRequired: 74,
    baseCurrent: 65,
    confidence: 0.82,
    rationale:
      "Audit remediation milestones drive surge demand; sustained GS-13/14 capacity is the binding constraint.",
    roles: [
      { role: "Reporting Accountants", grades: ["GS-12", "GS-13"], count: 40 },
      { role: "Audit Liaison / SME", grades: ["GS-14"], count: 16 },
      { role: "Reporting Leadership", grades: ["GS-15"], count: 6 },
      { role: "Contract Accountants", grades: ["Contractor"], count: 12 },
    ],
  },
  {
    id: "internal-controls",
    name: "Internal Controls",
    summary:
      "OMB Circular A-123 assessments, risk management, and control testing program.",
    baseRequired: 68,
    baseCurrent: 52,
    confidence: 0.79,
    rationale:
      "Control testing scope expanded faster than hiring; the gap concentrates at GS-13/14 reviewer roles.",
    roles: [
      { role: "Controls Analysts", grades: ["GS-12", "GS-13"], count: 36 },
      { role: "Senior Reviewers", grades: ["GS-14"], count: 18 },
      { role: "Program Leadership", grades: ["GS-15", "SES"], count: 6 },
      { role: "Contract Reviewers", grades: ["Contractor"], count: 8 },
    ],
  },
  {
    id: "data-analytics",
    name: "Data Analytics",
    summary:
      "Workforce and budget analytics, dashboards, and decision-support modeling.",
    baseRequired: 46,
    baseCurrent: 33,
    confidence: 0.71,
    rationale:
      "Demand is growing and partly emergent; confidence is lower because skill mix and tooling are still maturing.",
    roles: [
      { role: "Data / BI Analysts", grades: ["GS-12", "GS-13"], count: 22 },
      { role: "Data Scientists", grades: ["GS-13", "GS-14"], count: 12 },
      { role: "Analytics Lead", grades: ["GS-15"], count: 3 },
      { role: "Contract Engineers", grades: ["Contractor"], count: 9 },
    ],
  },
  {
    id: "component-coordination",
    name: "Component Coordination",
    summary:
      "Liaison with operating components on resource, programming, and policy integration.",
    baseRequired: 58,
    baseCurrent: 47,
    confidence: 0.8,
    rationale:
      "Coordination load is steady but relationship-dependent; senior analysts carry disproportionate workload.",
    roles: [
      { role: "Component Liaisons", grades: ["GS-13", "GS-14"], count: 34 },
      { role: "Integration Leads", grades: ["GS-14", "GS-15"], count: 14 },
      { role: "Front Office Coordination", grades: ["SES"], count: 3 },
      { role: "Contract Support", grades: ["Contractor"], count: 7 },
    ],
  },
  {
    id: "systems-modernization",
    name: "Systems Modernization",
    summary:
      "Financial systems modernization, integration, and sustainment engineering.",
    baseRequired: 64,
    baseCurrent: 49,
    confidence: 0.68,
    rationale:
      "Modernization timelines are sensitive to specialized talent; contractor reliance elevates cost and conversion risk.",
    roles: [
      { role: "Systems Analysts", grades: ["GS-12", "GS-13"], count: 22 },
      { role: "Solution / Integration Architects", grades: ["GS-14"], count: 12 },
      { role: "Program Leadership", grades: ["GS-15"], count: 4 },
      { role: "Contract Engineers", grades: ["Contractor"], count: 26 },
    ],
  },
  {
    id: "surge-support",
    name: "Surge / Emerging Priorities",
    summary:
      "Flexible capacity for continuing resolutions, supplementals, and emergent leadership taskers.",
    baseRequired: 38,
    baseCurrent: 24,
    confidence: 0.6,
    rationale:
      "Inherently variable demand; staffing is intentionally lean and leans on convertible contractor capacity.",
    roles: [
      { role: "Flex Analysts", grades: ["GS-12", "GS-13"], count: 16 },
      { role: "Task Leads", grades: ["GS-14"], count: 8 },
      { role: "Contract Surge Support", grades: ["Contractor"], count: 14 },
    ],
  },
];
