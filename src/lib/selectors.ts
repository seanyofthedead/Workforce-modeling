// ---------------------------------------------------------------------------
// Derived selectors shared across views so the dashboard and the briefing tell
// an identical story (same risks, same hiring priorities, same numbers).
// ---------------------------------------------------------------------------

import { ComputedModel, DivisionResult, Criticality } from "./types";

const CRIT_PRIORITY: Record<Criticality, number> = {
  Critical: 1.5,
  High: 1.15,
  Moderate: 0.85,
};

/** Divisions carrying the most workforce risk, highest first. */
export function topStaffingRisks(model: ComputedModel, n = 5): DivisionResult[] {
  return [...model.divisions].sort((a, b) => b.riskScore - a.riskScore).slice(0, n);
}

export interface HiringAction extends DivisionResult {
  priority: number;
}

/** Divisions needing hires, prioritized by criticality × shortfall against requirement. */
export function topHiringActions(model: ComputedModel, n = 5): HiringAction[] {
  return model.divisions
    .filter((d) => d.gap > 0)
    .map((d) => ({ ...d, priority: d.gap * CRIT_PRIORITY[d.criticality] }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, n);
}
