// ---------------------------------------------------------------------------
// Workforce modeling engine.
//
// Deterministic, transparent projection that combines workforce supply,
// authorized positions, attrition, grade-level cost assumptions, hiring pace,
// contractor conversion, and mission demand into a planning-year posture and a
// multi-year fiscal projection. Illustrative only.
// ---------------------------------------------------------------------------

import {
  BASE_FISCAL_YEAR,
  DIVISIONS,
  GRADE_COST,
  GRADE_MISSION_NOTE,
  HISTORICAL_COST,
  MISSIONS,
  PLANNED_PERSONNEL_BUDGET,
} from "./data";
import {
  ComputedModel,
  Criticality,
  DivisionResult,
  DivisionSeed,
  FiscalYearPoint,
  Grade,
  GRADES,
  GradeRollup,
  KpiSummary,
  MissionEstimate,
  RiskAlert,
  RiskLevel,
  ScenarioParams,
} from "./types";

const PROJECTION_YEARS = 5; // FY2026 -> FY2030

const CRITICALITY_WEIGHT: Record<Criticality, number> = {
  Critical: 1.5,
  High: 1.15,
  Moderate: 0.85,
};

/** Largest-remainder allocation of `total` across grade weights -> integer counts. */
function allocateGrades(total: number, profile: Record<Grade, number>): Record<Grade, number> {
  const weightSum = GRADES.reduce((s, g) => s + profile[g], 0) || 1;
  const raw = GRADES.map((g) => (profile[g] / weightSum) * total);
  const floors = raw.map((r) => Math.floor(r));
  let remainder = Math.round(total) - floors.reduce((s, v) => s + v, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  const counts = [...floors];
  let k = 0;
  while (remainder > 0 && order.length > 0) {
    counts[order[k % order.length].i] += 1;
    remainder -= 1;
    k += 1;
  }
  const out = {} as Record<Grade, number>;
  GRADES.forEach((g, i) => (out[g] = counts[i]));
  return out;
}

function costOfGradeCounts(counts: Record<Grade, number>, payFactor: number): number {
  return GRADES.reduce((s, g) => s + counts[g] * GRADE_COST[g] * payFactor, 0);
}

/** Move a share of contractor headcount into journey/senior federal grades. */
function applyConversion(
  counts: Record<Grade, number>,
  conversionPct: number
): Record<Grade, number> {
  const converted = Math.round(counts.Contractor * conversionPct);
  if (converted <= 0) return counts;
  const next = { ...counts };
  next.Contractor -= converted;
  // 50% GS-12, 35% GS-13, 15% GS-14
  const g12 = Math.round(converted * 0.5);
  const g13 = Math.round(converted * 0.35);
  const g14 = converted - g12 - g13;
  next["GS-12"] += g12;
  next["GS-13"] += g13;
  next["GS-14"] += g14;
  return next;
}

interface DivProjection {
  onboardByYear: number[];
  requiredByYear: number[];
  costByYear: number[];
  vacanciesByYear: number[];
}

/** Project a single division across the planning horizon. */
function projectDivision(d: DivisionSeed, p: ScenarioParams): DivProjection {
  const onboardByYear: number[] = [];
  const requiredByYear: number[] = [];
  const costByYear: number[] = [];
  const vacanciesByYear: number[] = [];

  let onboard = d.onboard;
  // Blend org-specific attrition tendency with the scenario lever.
  const attrition = p.attritionRate * 0.7 + d.attritionBias * 0.3;

  for (let y = 0; y < PROJECTION_YEARS; y++) {
    const required = d.required * Math.pow(1 + p.missionDemandGrowthPct, y);
    // Attrition then hiring within the year.
    const losses = onboard * attrition;
    onboard -= losses;
    const gapToAuth = Math.max(0, d.authorized - onboard);
    onboard += gapToAuth * p.hiringPace;
    onboard = Math.min(onboard, d.authorized);
    onboard = Math.max(onboard, 0);

    const payFactor = Math.pow(1 + p.payRaisePct, y);
    let counts = allocateGrades(onboard, d.profile);
    counts = applyConversion(counts, p.contractorConversionPct);
    const cost = costOfGradeCounts(counts, payFactor);

    onboardByYear.push(onboard);
    requiredByYear.push(required);
    costByYear.push(cost);
    vacanciesByYear.push(Math.max(0, d.authorized - onboard));
  }

  return { onboardByYear, requiredByYear, costByYear, vacanciesByYear };
}

function riskFromScore(score: number): RiskLevel {
  if (score >= 75) return "Severe";
  if (score >= 55) return "Elevated";
  if (score >= 35) return "Moderate";
  return "Low";
}

function buildDivisionResult(
  d: DivisionSeed,
  proj: DivProjection,
  p: ScenarioParams
): DivisionResult {
  // Planning year = first projected fiscal year (FY of record).
  const onboard = proj.onboardByYear[0];
  const required = proj.requiredByYear[0];
  const annualCost = proj.costByYear[0];
  const projectedVacancies = proj.vacanciesByYear[PROJECTION_YEARS - 1];

  let counts = allocateGrades(onboard, d.profile);
  counts = applyConversion(counts, p.contractorConversionPct);

  const vacancies = Math.max(0, d.authorized - onboard);
  const gap = required - onboard;
  const coverage = Math.min(100, (onboard / required) * 100);
  const vacancyRate = d.authorized > 0 ? vacancies / d.authorized : 0;

  // Risk: coverage shortfall + vacancy pressure + criticality + future erosion.
  const coverageGap = Math.max(0, 100 - coverage);
  const futureErosion = Math.max(0, projectedVacancies - vacancies);
  const critFactor = CRITICALITY_WEIGHT[d.criticality];
  const riskScore = Math.min(
    100,
    (coverageGap * 1.1 + vacancyRate * 100 * 0.8 + futureErosion * 1.5) * (critFactor / 1.2)
  );
  const risk = riskFromScore(riskScore);

  let riskDriver: string;
  if (gap > 8 && d.criticality === "Critical") {
    riskDriver = `Critical mission with a ${Math.round(gap)}-FTE shortfall against requirement.`;
  } else if (vacancyRate > 0.15) {
    riskDriver = `Vacancy rate of ${Math.round(vacancyRate * 100)}% strains journey-level capacity.`;
  } else if (futureErosion > 2) {
    riskDriver = `Attrition outpaces hiring; vacancies projected to grow by ${Math.round(
      futureErosion
    )} by FY${BASE_FISCAL_YEAR + PROJECTION_YEARS - 1}.`;
  } else if (gap > 0) {
    riskDriver = `Modest shortfall against mission requirement; manageable at current pace.`;
  } else {
    riskDriver = `Staffing at or above mission requirement; posture is stable.`;
  }

  return {
    id: d.id,
    name: d.name,
    shortName: d.shortName,
    criticality: d.criticality,
    onboard: Math.round(onboard),
    authorized: d.authorized,
    required: Math.round(required),
    gap: Math.round(gap),
    vacancies: Math.round(vacancies),
    gradeCounts: counts,
    avgLoadedCost: onboard > 0 ? annualCost / onboard : 0,
    annualCost,
    coverage,
    riskScore,
    risk,
    projectedVacancies: Math.round(projectedVacancies),
    riskDriver,
  };
}

function buildTimeline(projections: DivProjection[]): FiscalYearPoint[] {
  const points: FiscalYearPoint[] = HISTORICAL_COST.map((h) => ({
    fy: h.fy,
    fyShort: h.fyShort,
    cost: h.cost,
    required: 0,
    filled: 0,
    vacancies: 0,
    historical: true,
  }));

  for (let y = 0; y < PROJECTION_YEARS; y++) {
    const fyNum = BASE_FISCAL_YEAR + y;
    let cost = 0;
    let required = 0;
    let filled = 0;
    let vacancies = 0;
    for (const proj of projections) {
      cost += proj.costByYear[y];
      required += proj.requiredByYear[y];
      filled += proj.onboardByYear[y];
      vacancies += proj.vacanciesByYear[y];
    }
    points.push({
      fy: `FY${fyNum}`,
      fyShort: `FY${String(fyNum).slice(2)}`,
      cost,
      required: Math.round(required),
      filled: Math.round(filled),
      vacancies: Math.round(vacancies),
      historical: false,
    });
  }
  return points;
}

function buildGradeRollup(divisions: DivisionResult[], p: ScenarioParams): GradeRollup[] {
  const current = {} as Record<Grade, number>;
  const recommended = {} as Record<Grade, number>;
  GRADES.forEach((g) => {
    current[g] = 0;
    recommended[g] = 0;
  });

  // Current enterprise mix = scenario-adjusted onboard distribution.
  for (const d of divisions) {
    GRADES.forEach((g) => (current[g] += d.gradeCounts[g]));
  }

  // Recommended mix = distribution scaled to mission requirement, with a
  // deliberate shift away from contractor reliance toward journey/senior FTE.
  for (const seed of DIVISIONS) {
    const recProfile = { ...seed.profile };
    const shift = recProfile.Contractor * 0.35;
    recProfile.Contractor -= shift;
    recProfile["GS-12"] += shift * 0.4;
    recProfile["GS-13"] += shift * 0.4;
    recProfile["GS-14"] += shift * 0.2;
    const counts = allocateGrades(seed.required * (1 + p.missionDemandGrowthPct), recProfile);
    GRADES.forEach((g) => (recommended[g] += counts[g]));
  }

  const missionImpact: Record<Grade, string> = {
    "GS-9": "Frees senior staff from routine execution tasks.",
    "GS-11": "Stabilizes recurring reporting throughput.",
    "GS-12": "Directly increases core analytic production capacity.",
    "GS-13": "Adds review depth and reduces single-point-of-failure risk.",
    "GS-14": "Restores branch oversight and cross-cutting coordination.",
    "GS-15": "Protects portfolio accountability and decision velocity.",
    SES: "Sustains executive governance and enterprise risk ownership.",
    Contractor: "Lowers conversion exposure and recurring contract cost.",
  };
  const riskIfUnstaffed: Record<Grade, string> = {
    "GS-9": "Senior staff absorb low-value work; throughput slows.",
    "GS-11": "Reporting backlogs accumulate during peak cycles.",
    "GS-12": "Mission output falls below requirement at journey level.",
    "GS-13": "Review bottlenecks and error/rework risk increase.",
    "GS-14": "Oversight gaps raise audit and control findings risk.",
    "GS-15": "Leadership spans of control exceed sustainable limits.",
    SES: "Governance and accountability gaps at the executive tier.",
    Contractor: "Continued cost premium and conversion/transition risk.",
  };

  return GRADES.map((g) => {
    const delta = recommended[g] - current[g];
    return {
      grade: g,
      current: current[g],
      recommended: recommended[g],
      delta,
      unitCost: GRADE_COST[g],
      costImpact: delta * GRADE_COST[g],
      missionImpact: missionImpact[g],
      riskIfUnstaffed: riskIfUnstaffed[g],
    };
  });
}

function buildKpis(
  divisions: DivisionResult[],
  timeline: FiscalYearPoint[],
  p: ScenarioParams
): KpiSummary {
  const onboard = sum(divisions.map((d) => d.onboard));
  const authorized = sum(DIVISIONS.map((d) => d.authorized));
  const required = sum(divisions.map((d) => d.required));
  const vacancies = sum(divisions.map((d) => d.vacancies));
  const projectedVacancies = sum(divisions.map((d) => d.projectedVacancies));
  const annualCost = sum(divisions.map((d) => d.annualCost));
  const plannedBudget = PLANNED_PERSONNEL_BUDGET * (1 + p.budgetDeltaPct);
  const variance = plannedBudget - annualCost;
  const variancePct = plannedBudget > 0 ? variance / plannedBudget : 0;

  // Criticality-weighted mission coverage.
  let covNum = 0;
  let covDen = 0;
  for (const d of divisions) {
    const w = CRITICALITY_WEIGHT[d.criticality];
    covNum += d.coverage * w;
    covDen += w;
  }
  const coverage = covDen > 0 ? covNum / covDen : 0;

  // Time to fill all authorized vacancies at the scenario's net fill rate.
  const totalGapToAuth = Math.max(0, authorized - onboard);
  const annualHires = totalGapToAuth * p.hiringPace;
  const annualLosses = onboard * p.attritionRate;
  const netAnnual = annualHires - annualLosses;
  let timeToTargetMonths: number;
  if (totalGapToAuth <= 1) timeToTargetMonths = 0;
  else if (netAnnual <= 0) timeToTargetMonths = 99; // not achievable at this pace
  else timeToTargetMonths = Math.min(99, Math.round((totalGapToAuth / netAnnual) * 12));

  const severe = divisions.filter((d) => d.risk === "Severe").length;
  const elevated = divisions.filter((d) => d.risk === "Elevated").length;
  const riskCount = severe + elevated;
  let risk: RiskLevel = "Low";
  if (severe >= 2 || variancePct < -0.06) risk = "Severe";
  else if (severe >= 1 || elevated >= 2 || variancePct < -0.02) risk = "Elevated";
  else if (elevated >= 1 || coverage < 90) risk = "Moderate";

  return {
    onboard,
    authorized,
    required,
    vacancies,
    projectedVacancies,
    annualCost,
    plannedBudget,
    variance,
    variancePct,
    coverage,
    timeToTargetMonths,
    filledTarget: authorized,
    risk,
    riskCount,
  };
}

function buildAlerts(divisions: DivisionResult[], kpis: KpiSummary): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  // Budget posture alert.
  if (kpis.variance < 0) {
    alerts.push({
      id: "budget-shortfall",
      title: "Projected personnel cost exceeds planned budget",
      detail: `Plan is over the personnel topline by ${fmtShort(
        Math.abs(kpis.variance)
      )} (${(kpis.variancePct * 100).toFixed(1)}%). Hiring pace and pay assumptions outrun available funding.`,
      severity: kpis.variancePct < -0.06 ? "Severe" : "Elevated",
      category: "Budget",
    });
  } else if (kpis.variancePct > 0.05) {
    alerts.push({
      id: "budget-underexecution",
      title: "Personnel funds projected to under-execute",
      detail: `Plan is under the topline by ${fmtShort(
        kpis.variance
      )} (${(kpis.variancePct * 100).toFixed(1)}%). Slow fills leave capacity — and appropriated funds — unused.`,
      severity: "Moderate",
      category: "Budget",
    });
  }

  // Coverage alert.
  if (kpis.coverage < 88) {
    alerts.push({
      id: "coverage-low",
      title: "Mission coverage below readiness threshold",
      detail: `Weighted mission coverage is ${kpis.coverage.toFixed(
        0
      )}%. Critical divisions are carrying the largest gaps against requirement.`,
      severity: kpis.coverage < 82 ? "Severe" : "Elevated",
      category: "Workforce",
    });
  }

  // Per-division workforce alerts (top risks).
  divisions
    .filter((d) => d.risk === "Severe" || d.risk === "Elevated")
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 4)
    .forEach((d) =>
      alerts.push({
        id: `div-${d.id}`,
        title: `${d.name}: ${d.risk.toLowerCase()} staffing risk`,
        detail: d.riskDriver,
        severity: d.risk,
        category: "Workforce",
      })
    );

  return alerts;
}

function buildMissions(p: ScenarioParams): MissionEstimate[] {
  return MISSIONS.map((m) => {
    const recommendedFte = Math.round(m.baseRequired * (1 + p.missionDemandGrowthPct));
    // Current applied capacity erodes with attrition, recovers with hiring.
    const fillFactor = 1 - p.attritionRate * 0.5 + p.hiringPace * 0.12;
    const currentFte = Math.round(m.baseCurrent * fillFactor);
    const gap = recommendedFte - currentFte;
    // Cost from role-grade composition scaled to recommended size.
    const roleTotal = m.roles.reduce((s, r) => s + r.count, 0) || 1;
    let annualCost = 0;
    for (const r of m.roles) {
      const share = (r.count / roleTotal) * recommendedFte;
      const avgGradeCost =
        r.grades.reduce((s, g) => s + GRADE_COST[g], 0) / r.grades.length;
      annualCost += share * avgGradeCost * Math.pow(1 + p.payRaisePct, 1);
    }
    return {
      id: m.id,
      name: m.name,
      summary: m.summary,
      roles: m.roles,
      recommendedFte,
      currentFte,
      gap,
      annualCost,
      confidence: m.confidence,
      rationale: m.rationale,
    };
  });
}

// --- helpers --------------------------------------------------------------

function sum(xs: number[]): number {
  return xs.reduce((s, v) => s + v, 0);
}

function fmtShort(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

// --- public entry point ---------------------------------------------------

export function computeModel(scenarioId: string, p: ScenarioParams): ComputedModel {
  const projections = DIVISIONS.map((d) => projectDivision(d, p));
  const divisions = DIVISIONS.map((d, i) => buildDivisionResult(d, projections[i], p));
  const timeline = buildTimeline(projections);
  const kpis = buildKpis(divisions, timeline, p);
  const gradeRollup = buildGradeRollup(divisions, p);
  const alerts = buildAlerts(divisions, kpis);
  const missions = buildMissions(p);

  return { scenarioId, divisions, kpis, timeline, gradeRollup, alerts, missions };
}

// Re-export for convenience in components.
export { GRADE_COST, GRADE_MISSION_NOTE };
