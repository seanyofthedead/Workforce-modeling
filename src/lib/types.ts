// ---------------------------------------------------------------------------
// Workforce Modeling Command Center — domain types
// Synthetic / illustrative model for demonstration only.
// ---------------------------------------------------------------------------

export type Grade =
  | "GS-9"
  | "GS-11"
  | "GS-12"
  | "GS-13"
  | "GS-14"
  | "GS-15"
  | "SES"
  | "Contractor";

export const GRADES: Grade[] = [
  "GS-9",
  "GS-11",
  "GS-12",
  "GS-13",
  "GS-14",
  "GS-15",
  "SES",
  "Contractor",
];

export type Criticality = "Critical" | "High" | "Moderate";
export type RiskLevel = "Severe" | "Elevated" | "Moderate" | "Low";

/** A staffing profile expressed as fractional weights across grades. */
export type GradeProfile = Record<Grade, number>;

/** Static, authoritative-style division record (synthetic). */
export interface DivisionSeed {
  id: string;
  name: string;
  shortName: string;
  /** Onboard FTE today. */
  onboard: number;
  /** Authorized (funded) positions. */
  authorized: number;
  /** Mission-required staffing per the staffing estimator. */
  required: number;
  criticality: Criticality;
  /** Annual attrition tendency for this org (fraction). */
  attritionBias: number;
  profile: GradeProfile;
  missionAreas: string[];
}

/** Loaded annual cost assumption per grade (fully burdened, USD). */
export type GradeCostTable = Record<Grade, number>;

// --- Scenario inputs ------------------------------------------------------

export interface ScenarioParams {
  /** Annual attrition rate, fraction (0–0.30). */
  attritionRate: number;
  /** Annual pay raise / locality adjustment, fraction (0–0.10). */
  payRaisePct: number;
  /** Share of the staffing gap filled per year, fraction (0–1). */
  hiringPace: number;
  /** Share of contractor support converted to federal FTE, fraction (0–1). */
  contractorConversionPct: number;
  /** Personnel budget change vs. baseline, fraction (-0.20–0.20). */
  budgetDeltaPct: number;
  /** Annual mission demand growth, fraction (-0.10–0.20). */
  missionDemandGrowthPct: number;
}

export interface Scenario {
  id: string;
  name: string;
  tagline: string;
  params: ScenarioParams;
}

// --- Computed model outputs ----------------------------------------------

export interface DivisionResult {
  id: string;
  name: string;
  shortName: string;
  criticality: Criticality;
  onboard: number;
  authorized: number;
  required: number;
  /** required - onboard (positive = shortfall, negative = surplus). */
  gap: number;
  vacancies: number;
  gradeCounts: Record<Grade, number>;
  avgLoadedCost: number;
  annualCost: number;
  /** 0–100 coverage of mission-required staffing. */
  coverage: number;
  riskScore: number;
  risk: RiskLevel;
  /** End-of-year projected vacancies under the active scenario. */
  projectedVacancies: number;
  /** Plain-language driver of this division's risk. */
  riskDriver: string;
}

export interface GradeRollup {
  grade: Grade;
  current: number;
  recommended: number;
  delta: number;
  unitCost: number;
  costImpact: number;
  missionImpact: string;
  riskIfUnstaffed: string;
}

export interface FiscalYearPoint {
  fy: string;
  fyShort: string;
  cost: number;
  required: number;
  filled: number;
  vacancies: number;
  historical: boolean;
}

export interface KpiSummary {
  onboard: number;
  authorized: number;
  required: number;
  vacancies: number;
  projectedVacancies: number;
  annualCost: number;
  plannedBudget: number;
  variance: number;
  variancePct: number;
  coverage: number;
  timeToTargetMonths: number;
  filledTarget: number;
  risk: RiskLevel;
  riskCount: number;
}

export interface RiskAlert {
  id: string;
  title: string;
  detail: string;
  severity: RiskLevel;
  category: "Workforce" | "Budget";
}

export interface MissionEstimate {
  id: string;
  name: string;
  summary: string;
  roles: { role: string; grades: Grade[]; count: number }[];
  recommendedFte: number;
  currentFte: number;
  gap: number;
  annualCost: number;
  confidence: number;
  rationale: string;
}

export interface ComputedModel {
  scenarioId: string;
  divisions: DivisionResult[];
  kpis: KpiSummary;
  timeline: FiscalYearPoint[];
  gradeRollup: GradeRollup[];
  alerts: RiskAlert[];
  missions: MissionEstimate[];
}
