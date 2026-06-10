# Division-level inputs for Scenario Modeling — Design

**Date:** 2026-06-10
**Status:** Approved (pending spec review)

## Problem

Scenario Modeling currently exposes six **enterprise-wide** levers that apply
uniformly to every division. A planner cannot model a scenario where, say, the
Budget Division hires aggressively while Internal Controls stays under a freeze.
The underlying engine already projects each division independently, so the
limitation is purely in the input surface and the single global parameter set.

## Goal

Let users override a subset of levers **per division** in the Scenario Modeling
page, while keeping the enterprise levers as the default that every
non-overridden division inherits. The change must be additive and leave the
current Enterprise experience byte-for-byte identical.

## Decisions (from brainstorming)

- **Per-division levers:** the four *operational* levers — `hiringPace`,
  `attritionRate`, `contractorConversionPct`, `missionDemandGrowthPct`.
  `payRaisePct` and `budgetDeltaPct` remain enterprise-wide (set centrally; the
  budget variance math is computed at the enterprise topline and has no
  per-division meaning).
- **UI:** a scope toggle (`Enterprise` / `By division`); in By-division mode a
  division dropdown picks the target and the existing lever panel re-binds to
  that division.
- **Override model:** *inherit unless overridden.* A division uses the
  enterprise value for each lever until explicitly overridden; a per-lever
  revert returns it to inheriting. Moving an enterprise slider still moves every
  non-overridden division.
- **Scenario switch / global reset clears all overrides** — selecting a prebuilt
  scenario is a clean slate.

## Architecture

### Data model — `src/lib/types.ts`

```ts
export type DivisionLever =
  | "hiringPace"
  | "attritionRate"
  | "contractorConversionPct"
  | "missionDemandGrowthPct";

export type DivisionOverride = Partial<Pick<ScenarioParams, DivisionLever>>;

/** Keyed by division id. Absent key or absent lever => inherit enterprise. */
export type DivisionOverrides = Record<string, DivisionOverride>;

export const DIVISION_LEVERS: DivisionLever[] = [
  "hiringPace",
  "attritionRate",
  "contractorConversionPct",
  "missionDemandGrowthPct",
];
```

### Calc engine — `src/lib/calc.ts`

- `computeModel(scenarioId, params, overrides: DivisionOverrides = {})` — new
  optional 3rd argument, default `{}`. All existing call sites continue to work
  unchanged.
- New helper:

  ```ts
  function resolveParams(global: ScenarioParams, override?: DivisionOverride): ScenarioParams {
    return override ? { ...global, ...override } : global;
  }
  ```

- In `computeModel`, project each division with its effective params:

  ```ts
  const projections = DIVISIONS.map((d) =>
    projectDivision(d, resolveParams(params, overrides[d.id]))
  );
  ```

  `buildDivisionResult` is likewise called with the same effective params for
  that division (it uses `p.contractorConversionPct` for the planning-year grade
  counts).

- **Scope boundary — what honors overrides vs. what stays enterprise:**
  - *Honors overrides (via projections):* per-division results, the fiscal
    timeline, time-to-target, and every KPI rolled up from divisions (onboard,
    required, vacancies, annual cost, coverage, division/enterprise risk). These
    require no extra code — they already aggregate from `projectDivision` output.
  - *Stays enterprise (uses `params` directly):* `buildGradeRollup`'s
    *recommended* mix and `buildMissions`. These are enterprise/mission views,
    not per-division projections, and are explicitly left on the global params.
  - The attrition blend in `projectDivision`
    (`p.attritionRate * 0.7 + d.attritionBias * 0.3`) is preserved; an override
    simply replaces the `p.attritionRate` term for that division.

### State — `src/components/model-context.tsx`

Extend `ModelContextValue`:

```ts
overrides: DivisionOverrides;
customizedDivisionIds: string[];           // derived, for display
setDivisionParam: (divId: string, key: DivisionLever, value: number) => void;
resetDivisionParam: (divId: string, key: DivisionLever) => void;  // revert one lever
resetDivision: (divId: string) => void;                            // clear a division
resetAllDivisions: () => void;                                     // clear every override
```

Behavior:

- `overrides` is `useState<DivisionOverrides>({})`.
- `setDivisionParam` immutably sets `overrides[divId][key]`.
- `resetDivisionParam` deletes that key; if the division's override object
  becomes empty, the division key is removed too.
- `selectScenario` and `resetScenario` both set `overrides` back to `{}` (clean
  slate), in addition to their current param behavior.
- `model` is memoized on `(scenarioId, params, overrides)`.
- `baselineModel` is unchanged (always the unmodified baseline preset, no
  overrides) so the Impact-vs-Baseline comparison stays meaningful.

### UI — `src/components/views/ScenarioModeling.tsx`

- A **scope toggle** (segmented control: `Enterprise` | `By division`) sits above
  the Modeling Levers card. Local `useState` for scope and the selected division
  id (defaults to the first division).
- **Enterprise mode (default):** unchanged — the six global sliders bound to
  `params` / `setParam`. This is the existing component path.
- **By-division mode:**
  - A division `<select>` (reuse the styling pattern from `ScenarioPicker` in
    `ScenarioCompare.tsx`) chooses the target division.
  - The lever card shows the **four** operational sliders for that division. Each
    slider's value is the *effective* value: `overrides[divId]?.[key] ??
    params[key]`. Changing it calls `setDivisionParam`.
  - A per-slider **revert ↺** control appears only when that lever is overridden
    for the division and calls `resetDivisionParam`. An "inherited" /
    "overridden" micro-label communicates state.
  - `payRaisePct` and `budgetDeltaPct` render muted/read-only with an
    "enterprise" tag so the user understands why they aren't editable here.
  - A summary line ("N of 8 divisions customized") with a **Reset all divisions**
    action (`resetAllDivisions`), shown only when `customizedDivisionIds.length > 0`.
- The Impact ribbon and Scenario Outcomes cards are **unchanged** — they read
  `model` from context, which now reflects per-division overrides automatically.

## Components / boundaries

- `resolveParams` (calc): pure merge, trivially testable.
- `computeModel`: same signature shape, one new optional arg; output contract
  unchanged.
- model-context: owns override state + actions; the single source of truth.
- ScenarioModeling view: presentation only; reads effective values and dispatches
  context actions. Extract a small `LeverSlider` subcomponent if the
  enterprise/division branches share enough markup (decided during planning).

## Testing

- **`resolveParams`:** no override returns global unchanged; a partial override
  replaces only the given keys.
- **`computeModel` backward-compat:** `computeModel(id, params)` and
  `computeModel(id, params, {})` produce identical output to current behavior.
- **Override effect:** raising one division's `hiringPace` increases that
  division's projected onboard and the enterprise onboard KPI, without changing
  other divisions.
- **Scope boundary:** an override leaves `gradeRollup.recommended` and `missions`
  identical to the no-override run (those stay enterprise).
- **Manual/browser check:** Enterprise mode visually unchanged; By-division edits
  move the Outcomes/Impact numbers live; revert and scenario-switch clear
  overrides.

## Out of scope (YAGNI)

- Per-division Pay Raise % / Budget Δ.
- Persistence of overrides across reloads.
- New charts or changes to the fiscal-year visuals.
- A/B Compare changes (it compares presets only).
- The Division Model detail modal stays read-only.
