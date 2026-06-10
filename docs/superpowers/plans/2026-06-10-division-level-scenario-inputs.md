# Division-level Scenario Inputs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users override four operational levers (hiring pace, attrition, contractor conversion, mission demand growth) per division in the Scenario Modeling page, on top of the enterprise-wide defaults.

**Architecture:** A new pure override layer carries per-division partial parameter sets. The calc engine resolves each division's effective params (enterprise defaults + that division's overrides) before projecting it; all enterprise rollups already aggregate from those projections, so they reflect overrides automatically. React state for overrides lives in `model-context`, with immutable mutations delegated to pure helpers. The Scenario Modeling view gains a scope toggle and a division picker that re-binds the existing slider panel.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript 5.6, Tailwind. Tests via Vitest (added in Task 1).

---

## File Structure

- `package.json` — add Vitest dev dependency + `test` scripts (modify).
- `vitest.config.ts` — Vitest config with `@` path alias (create).
- `src/lib/types.ts` — `DivisionLever`, `DivisionOverride`, `DivisionOverrides`, `DIVISION_LEVERS` (modify).
- `src/lib/overrides.ts` — pure immutable helpers for the overrides map (create).
- `src/lib/overrides.test.ts` — unit tests for the helpers (create).
- `src/lib/calc.ts` — `resolveParams` helper + `computeModel` 3rd `overrides` arg (modify).
- `src/lib/calc.test.ts` — unit tests for `resolveParams` + `computeModel` override behavior (create).
- `src/components/model-context.tsx` — override state + actions, clear-on-scenario-switch (modify).
- `src/components/views/ScenarioModeling.tsx` — scope toggle, division picker, per-division levers (modify).

Each task below is bite-sized. Run all commands from the repo root `C:\Users\peder\documents\workforce-modeling`.

---

## Task 1: Add Vitest test infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Add Vitest dev dependency and test scripts to `package.json`**

In the `"scripts"` block, add two scripts after `"typecheck"`:

```json
    "typecheck": "tsc --noEmit",
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest"
```

In `"devDependencies"`, add (JSON key order does not matter):

```json
    "vitest": "2.1.8",
```

- [ ] **Step 2: Install the dependency**

Run: `npm install`
Expected: completes with exit code 0; `vitest` appears under `node_modules/.bin`.

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

- [ ] **Step 4: Verify the runner works with no tests yet**

Run: `npm test`
Expected: PASS — output similar to `No test files found, exiting with code 0` (the `--passWithNoTests` flag makes the empty run succeed).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add Vitest test infrastructure"
```

---

## Task 2: Add division-override types

**Files:**
- Modify: `src/lib/types.ts` (append after the `ScenarioParams` interface, which ends around line 69)

- [ ] **Step 1: Add the types and the lever constant**

Add immediately after the closing `}` of `interface ScenarioParams` (before `interface Scenario`):

```ts
// --- Per-division overrides ----------------------------------------------

/** The four operational levers that may be overridden per division.
 *  payRaisePct and budgetDeltaPct are deliberately excluded (enterprise-wide). */
export type DivisionLever =
  | "hiringPace"
  | "attritionRate"
  | "contractorConversionPct"
  | "missionDemandGrowthPct";

export const DIVISION_LEVERS: DivisionLever[] = [
  "hiringPace",
  "attritionRate",
  "contractorConversionPct",
  "missionDemandGrowthPct",
];

/** A division's lever overrides; an absent lever means "inherit enterprise". */
export type DivisionOverride = Partial<Pick<ScenarioParams, DivisionLever>>;

/** Keyed by division id; an absent id (or empty override) means "inherit all". */
export type DivisionOverrides = Record<string, DivisionOverride>;
```

- [ ] **Step 2: Verify it type-checks**

Run: `npm run typecheck`
Expected: PASS (exit 0, no output).

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add per-division override types"
```

---

## Task 3: Pure override helpers (TDD)

**Files:**
- Create: `src/lib/overrides.ts`
- Test: `src/lib/overrides.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/overrides.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  setDivisionOverride,
  clearDivisionOverrideKey,
  clearDivisionOverrides,
  customizedDivisionIds,
} from "./overrides";
import { DivisionOverrides } from "./types";

describe("setDivisionOverride", () => {
  it("adds a lever override for a new division without mutating input", () => {
    const base: DivisionOverrides = {};
    const next = setDivisionOverride(base, "budget-division", "hiringPace", 0.9);
    expect(next).toEqual({ "budget-division": { hiringPace: 0.9 } });
    expect(base).toEqual({}); // input untouched
  });

  it("merges a second lever into an existing division", () => {
    const base: DivisionOverrides = { "budget-division": { hiringPace: 0.9 } };
    const next = setDivisionOverride(base, "budget-division", "attritionRate", 0.12);
    expect(next).toEqual({
      "budget-division": { hiringPace: 0.9, attritionRate: 0.12 },
    });
  });
});

describe("clearDivisionOverrideKey", () => {
  it("removes one lever but keeps the others", () => {
    const base: DivisionOverrides = {
      "budget-division": { hiringPace: 0.9, attritionRate: 0.12 },
    };
    const next = clearDivisionOverrideKey(base, "budget-division", "hiringPace");
    expect(next).toEqual({ "budget-division": { attritionRate: 0.12 } });
  });

  it("drops the division entirely when its last lever is cleared", () => {
    const base: DivisionOverrides = { "budget-division": { hiringPace: 0.9 } };
    const next = clearDivisionOverrideKey(base, "budget-division", "hiringPace");
    expect(next).toEqual({});
  });
});

describe("clearDivisionOverrides", () => {
  it("removes all overrides for one division, leaving others", () => {
    const base: DivisionOverrides = {
      "budget-division": { hiringPace: 0.9 },
      "financial-systems": { attritionRate: 0.1 },
    };
    const next = clearDivisionOverrides(base, "budget-division");
    expect(next).toEqual({ "financial-systems": { attritionRate: 0.1 } });
  });
});

describe("customizedDivisionIds", () => {
  it("lists ids that have at least one override", () => {
    const base: DivisionOverrides = {
      "budget-division": { hiringPace: 0.9 },
      "financial-systems": { attritionRate: 0.1 },
    };
    expect(customizedDivisionIds(base).sort()).toEqual([
      "budget-division",
      "financial-systems",
    ]);
  });

  it("returns an empty array for no overrides", () => {
    expect(customizedDivisionIds({})).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/overrides.test.ts`
Expected: FAIL — `Failed to resolve import "./overrides"` (the module does not exist yet).

- [ ] **Step 3: Implement `src/lib/overrides.ts`**

```ts
import { DivisionLever, DivisionOverrides } from "./types";

/** Set one lever override for a division. Returns a new map; input untouched. */
export function setDivisionOverride(
  overrides: DivisionOverrides,
  divId: string,
  key: DivisionLever,
  value: number
): DivisionOverrides {
  return {
    ...overrides,
    [divId]: { ...overrides[divId], [key]: value },
  };
}

/** Clear one lever override for a division. Drops the division if it becomes empty. */
export function clearDivisionOverrideKey(
  overrides: DivisionOverrides,
  divId: string,
  key: DivisionLever
): DivisionOverrides {
  const current = overrides[divId];
  if (!current || !(key in current)) return overrides;

  const nextDiv = { ...current };
  delete nextDiv[key];

  const next = { ...overrides };
  if (Object.keys(nextDiv).length === 0) {
    delete next[divId];
  } else {
    next[divId] = nextDiv;
  }
  return next;
}

/** Remove all overrides for a single division. */
export function clearDivisionOverrides(
  overrides: DivisionOverrides,
  divId: string
): DivisionOverrides {
  if (!(divId in overrides)) return overrides;
  const next = { ...overrides };
  delete next[divId];
  return next;
}

/** Ids of divisions that carry at least one override. */
export function customizedDivisionIds(overrides: DivisionOverrides): string[] {
  return Object.keys(overrides).filter(
    (id) => Object.keys(overrides[id]).length > 0
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/overrides.test.ts`
Expected: PASS — all 7 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/overrides.ts src/lib/overrides.test.ts
git commit -m "feat: add pure division-override helpers"
```

---

## Task 4: Calc engine — resolveParams + computeModel overrides (TDD)

**Files:**
- Modify: `src/lib/calc.ts`
- Test: `src/lib/calc.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/calc.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeModel, resolveParams } from "./calc";
import { SCENARIOS } from "./data";
import { ScenarioParams, DivisionOverrides } from "./types";

const BASE = SCENARIOS[0]; // baseline preset
const params: ScenarioParams = { ...BASE.params };

describe("resolveParams", () => {
  it("returns the global params unchanged when there is no override", () => {
    expect(resolveParams(params, undefined)).toEqual(params);
  });

  it("replaces only the overridden levers", () => {
    const merged = resolveParams(params, { hiringPace: 0.95 });
    expect(merged.hiringPace).toBe(0.95);
    expect(merged.attritionRate).toBe(params.attritionRate);
    expect(merged.payRaisePct).toBe(params.payRaisePct);
  });
});

describe("computeModel overrides", () => {
  it("is backward-compatible: omitted vs empty overrides are identical", () => {
    const a = computeModel(BASE.id, params);
    const b = computeModel(BASE.id, params, {});
    expect(b).toEqual(a);
  });

  it("raising one division's hiring pace lifts its onboard and the enterprise onboard", () => {
    const baseModel = computeModel(BASE.id, params);
    const overrides: DivisionOverrides = { "budget-division": { hiringPace: 1 } };
    const next = computeModel(BASE.id, params, overrides);

    const baseDiv = baseModel.divisions.find((d) => d.id === "budget-division")!;
    const nextDiv = next.divisions.find((d) => d.id === "budget-division")!;
    expect(nextDiv.onboard).toBeGreaterThan(baseDiv.onboard);
    expect(next.kpis.onboard).toBeGreaterThan(baseModel.kpis.onboard);
  });

  it("only the targeted division changes", () => {
    const baseModel = computeModel(BASE.id, params);
    const next = computeModel(BASE.id, params, {
      "budget-division": { hiringPace: 1 },
    });
    const baseOther = baseModel.divisions.find((d) => d.id === "front-office")!;
    const nextOther = next.divisions.find((d) => d.id === "front-office")!;
    expect(nextOther.onboard).toBe(baseOther.onboard);
  });

  it("scope boundary: gradeRollup.recommended and missions stay enterprise", () => {
    const baseModel = computeModel(BASE.id, params);
    const next = computeModel(BASE.id, params, {
      "budget-division": { missionDemandGrowthPct: 0.2 },
    });
    expect(next.gradeRollup.map((g) => g.recommended)).toEqual(
      baseModel.gradeRollup.map((g) => g.recommended)
    );
    expect(next.missions).toEqual(baseModel.missions);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/calc.test.ts`
Expected: FAIL — `resolveParams` is not exported / `computeModel` does not accept a 3rd argument.

- [ ] **Step 3: Add the `resolveParams` helper and import the override type**

In `src/lib/calc.ts`, add `DivisionOverrides` to the existing type import block (the `import { ... } from "./types";` near the top):

```ts
  ScenarioParams,
  DivisionOverrides,
```

Add this helper just above the `// --- public entry point ---` comment near the bottom of the file:

```ts
/** Merge a division's overrides on top of the enterprise params. */
export function resolveParams(
  global: ScenarioParams,
  override?: DivisionOverrides[string]
): ScenarioParams {
  return override ? { ...global, ...override } : global;
}
```

- [ ] **Step 4: Thread overrides through `computeModel`**

Replace the existing `computeModel` function body with the version below (adds the optional `overrides` arg and resolves per-division effective params for both the projection and the division result):

```ts
export function computeModel(
  scenarioId: string,
  p: ScenarioParams,
  overrides: DivisionOverrides = {}
): ComputedModel {
  const effective = DIVISIONS.map((d) => resolveParams(p, overrides[d.id]));
  const projections = DIVISIONS.map((d, i) => projectDivision(d, effective[i]));
  const divisions = DIVISIONS.map((d, i) =>
    buildDivisionResult(d, projections[i], effective[i])
  );
  const timeline = buildTimeline(projections);
  const timeToTargetMonths = deriveTimeToTargetMonths(projections);
  const kpis = buildKpis(divisions, timeline, p, timeToTargetMonths);
  const gradeRollup = buildGradeRollup(divisions, p);
  const alerts = buildAlerts(divisions, kpis);
  const missions = buildMissions(p);

  return { scenarioId, divisions, kpis, timeline, gradeRollup, alerts, missions };
}
```

Note: `buildKpis`, `buildGradeRollup`, and `buildMissions` keep receiving the enterprise `p` — this is the intended scope boundary. `buildDivisionResult` now receives the division's effective params so its planning-year grade counts use the right `contractorConversionPct`.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/lib/calc.test.ts`
Expected: PASS — all 6 tests green.

- [ ] **Step 6: Verify the whole suite and types**

Run: `npm test`
Expected: PASS — overrides + calc suites all green.
Run: `npm run typecheck`
Expected: PASS (exit 0).

- [ ] **Step 7: Commit**

```bash
git add src/lib/calc.ts src/lib/calc.test.ts
git commit -m "feat: resolve per-division effective params in computeModel"
```

---

## Task 5: Wire override state into model-context

**Files:**
- Modify: `src/components/model-context.tsx`

- [ ] **Step 1: Update imports**

Replace the three existing import statements at the top of the file (`@/lib/calc`, `@/lib/data`, `@/lib/types` — lines ~11-13) with exactly these four:

```ts
import { computeModel } from "@/lib/calc";
import { SCENARIOS } from "@/lib/data";
import {
  ComputedModel,
  DivisionLever,
  DivisionOverrides,
  ScenarioParams,
} from "@/lib/types";
import {
  setDivisionOverride,
  clearDivisionOverrideKey,
  clearDivisionOverrides,
  customizedDivisionIds,
} from "@/lib/overrides";
```

- [ ] **Step 2: Extend the context value interface**

In `interface ModelContextValue`, add these members after `isCustom: boolean;`:

```ts
  overrides: DivisionOverrides;
  customizedDivisionIds: string[];
  setDivisionParam: (divId: string, key: DivisionLever, value: number) => void;
  resetDivisionParam: (divId: string, key: DivisionLever) => void;
  resetDivision: (divId: string) => void;
  resetAllDivisions: () => void;
```

- [ ] **Step 3: Add override state and actions in `ModelProvider`**

After the existing `const [isCustom, setIsCustom] = useState(false);` line, add:

```ts
  const [overrides, setOverrides] = useState<DivisionOverrides>({});
```

In `selectScenario`, add `setOverrides({});` after `setIsCustom(false);` so switching scenarios clears overrides:

```ts
  const selectScenario = useCallback((id: string) => {
    const s = SCENARIOS.find((x) => x.id === id) ?? SCENARIOS[0];
    setScenarioId(s.id);
    setParams({ ...s.params });
    setIsCustom(false);
    setOverrides({});
  }, []);
```

In `resetScenario`, add `setOverrides({});` after `setIsCustom(false);`:

```ts
  const resetScenario = useCallback(() => {
    const s = SCENARIOS.find((x) => x.id === scenarioId) ?? SCENARIOS[0];
    setParams({ ...s.params });
    setIsCustom(false);
    setOverrides({});
  }, [scenarioId]);
```

Add the four new action callbacks just after `resetScenario`:

```ts
  const setDivisionParam = useCallback(
    (divId: string, key: DivisionLever, value: number) => {
      setOverrides((prev) => setDivisionOverride(prev, divId, key, value));
    },
    []
  );

  const resetDivisionParam = useCallback(
    (divId: string, key: DivisionLever) => {
      setOverrides((prev) => clearDivisionOverrideKey(prev, divId, key));
    },
    []
  );

  const resetDivision = useCallback((divId: string) => {
    setOverrides((prev) => clearDivisionOverrides(prev, divId));
  }, []);

  const resetAllDivisions = useCallback(() => {
    setOverrides({});
  }, []);
```

- [ ] **Step 4: Pass overrides into `computeModel` and the context value**

Replace the `model` memo so it includes overrides:

```ts
  const model = useMemo(
    () => computeModel(scenarioId, params, overrides),
    [scenarioId, params, overrides]
  );
```

Replace the `value` memo to expose the new members:

```ts
  const value = useMemo<ModelContextValue>(
    () => ({
      scenarioId,
      params,
      baselineModel,
      model,
      isCustom,
      overrides,
      customizedDivisionIds: customizedDivisionIds(overrides),
      selectScenario,
      setParam,
      resetScenario,
      setDivisionParam,
      resetDivisionParam,
      resetDivision,
      resetAllDivisions,
    }),
    [
      scenarioId,
      params,
      baselineModel,
      model,
      isCustom,
      overrides,
      selectScenario,
      setParam,
      resetScenario,
      setDivisionParam,
      resetDivisionParam,
      resetDivision,
      resetAllDivisions,
    ]
  );
```

- [ ] **Step 5: Verify types and tests**

Run: `npm run typecheck`
Expected: PASS (exit 0).
Run: `npm test`
Expected: PASS (no regressions; existing suites still green).

- [ ] **Step 6: Commit**

```bash
git add src/components/model-context.tsx
git commit -m "feat: hold per-division overrides in model context"
```

---

## Task 6: Division-level inputs UI in Scenario Modeling

**Files:**
- Modify: `src/components/views/ScenarioModeling.tsx`

This task replaces the file. The new version keeps the Impact ribbon, Scenario Outcomes, and Insight panel verbatim, and rewrites only the controls area to add the scope toggle, division picker, and per-division levers. A `LeverSlider` subcomponent keeps the markup DRY.

- [ ] **Step 1: Replace the full contents of `src/components/views/ScenarioModeling.tsx`**

```tsx
"use client";

import { useState } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { useModel } from "../model-context";
import { Card, CardHeader, SectionTitle, RiskBadge, InsightPanel } from "../ui";
import { SCENARIOS } from "@/lib/data";
import { ScenarioParams, DivisionLever } from "@/lib/types";
import {
  fmtNum,
  fmtUSDCompact,
  fmtPct,
  fmtSignedPct,
} from "@/lib/format";

interface ImpactItem {
  label: string;
  now: string;
  base: string;
  diff: number;
  goodWhen: "up" | "down";
}

function ImpactChip({ item }: { item: ImpactItem }) {
  const flat = Math.abs(item.diff) < 1e-9;
  const dir: "up" | "down" | "flat" = flat ? "flat" : item.diff > 0 ? "up" : "down";
  const good = dir === item.goodWhen;
  const Icon = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;
  const tone = flat ? "text-slate-400" : good ? "text-emerald-600" : "text-red-600";
  return (
    <div className="bg-white p-4 transition-colors">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {item.label}
      </div>
      <div className="mt-1 text-xl font-semibold tabular tracking-tight text-navy-900 transition-all duration-300">
        {item.now}
      </div>
      <div className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
        {flat ? "no change" : "vs"}
        {!flat && <span className="text-slate-400">baseline {item.base}</span>}
        {flat && <span className="text-slate-400">vs baseline</span>}
      </div>
    </div>
  );
}

interface SliderDef {
  key: keyof ScenarioParams;
  label: string;
  min: number;
  max: number;
  step: number;
  hint: string;
  format: (v: number) => string;
  /** Whether this lever can be overridden per division. */
  perDivision: boolean;
}

const SLIDERS: SliderDef[] = [
  {
    key: "attritionRate",
    label: "Attrition Rate",
    min: 0,
    max: 0.25,
    step: 0.005,
    hint: "Annual separations as a share of onboard strength",
    format: (v) => fmtPct(v),
    perDivision: true,
  },
  {
    key: "payRaisePct",
    label: "Pay Raise %",
    min: 0,
    max: 0.08,
    step: 0.0025,
    hint: "Annual pay and locality adjustment",
    format: (v) => fmtPct(v),
    perDivision: false,
  },
  {
    key: "hiringPace",
    label: "Hiring Pace",
    min: 0,
    max: 1,
    step: 0.05,
    hint: "Share of the vacancy gap filled per year",
    format: (v) => fmtPct(v, 0),
    perDivision: true,
  },
  {
    key: "contractorConversionPct",
    label: "Contractor Conversion %",
    min: 0,
    max: 0.4,
    step: 0.01,
    hint: "Contractor capacity converted to federal FTE",
    format: (v) => fmtPct(v, 0),
    perDivision: true,
  },
  {
    key: "budgetDeltaPct",
    label: "Budget Increase / Decrease",
    min: -0.2,
    max: 0.2,
    step: 0.01,
    hint: "Change to the planned personnel topline",
    format: (v) => fmtSignedPct(v, 0),
    perDivision: false,
  },
  {
    key: "missionDemandGrowthPct",
    label: "Mission Demand Growth",
    min: -0.1,
    max: 0.2,
    step: 0.01,
    hint: "Annual growth in mission-required staffing",
    format: (v) => fmtSignedPct(v, 0),
    perDivision: true,
  },
];

/** One lever row. In division mode, non-per-division levers render read-only. */
function LeverSlider({
  def,
  value,
  onChange,
  disabled = false,
  overridden = false,
  onRevert,
  enterpriseTag = false,
}: {
  def: SliderDef;
  value: number;
  onChange?: (v: number) => void;
  disabled?: boolean;
  overridden?: boolean;
  onRevert?: () => void;
  enterpriseTag?: boolean;
}) {
  return (
    <div className={disabled ? "opacity-60" : undefined}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm font-medium text-navy-900">
          {def.label}
          {enterpriseTag && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              enterprise
            </span>
          )}
          {overridden && (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              overridden
            </span>
          )}
        </label>
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-navy-50 px-2 py-0.5 text-xs font-semibold tabular text-navy-700">
            {def.format(value)}
          </span>
          {overridden && onRevert && (
            <button
              type="button"
              onClick={onRevert}
              aria-label={`Revert ${def.label} to enterprise`}
              title="Revert to enterprise"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-navy-700"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-navy-700 disabled:cursor-not-allowed"
      />
      <p className="mt-1 text-[11px] text-slate-400">
        {disabled ? "Set at the enterprise level" : def.hint}
      </p>
    </div>
  );
}

export default function ScenarioModeling() {
  const {
    scenarioId,
    params,
    model,
    baselineModel,
    isCustom,
    overrides,
    customizedDivisionIds,
    selectScenario,
    setParam,
    resetScenario,
    setDivisionParam,
    resetDivisionParam,
    resetDivision,
    resetAllDivisions,
  } = useModel();

  const [scope, setScope] = useState<"enterprise" | "division">("enterprise");
  const [divId, setDivId] = useState<string>(model.divisions[0]?.id ?? "");

  const k = model.kpis;
  const b = baselineModel.kpis;
  const divOverride = overrides[divId] ?? {};
  const divHasOverrides = Object.keys(divOverride).length > 0;

  const ttt = (m: number) => (m >= 99 ? "Off track" : `${m} mo`);
  const impact: ImpactItem[] = [
    {
      label: "Personnel cost",
      now: fmtUSDCompact(k.annualCost),
      base: fmtUSDCompact(b.annualCost),
      diff: k.annualCost - b.annualCost,
      goodWhen: "down",
    },
    {
      label: "Mission coverage",
      now: `${k.coverage.toFixed(0)}%`,
      base: `${b.coverage.toFixed(0)}%`,
      diff: k.coverage - b.coverage,
      goodWhen: "up",
    },
    {
      label: "Budget variance",
      now: fmtUSDCompact(k.variance),
      base: fmtUSDCompact(b.variance),
      diff: k.variance - b.variance,
      goodWhen: "up",
    },
    {
      label: "Time to target",
      now: ttt(k.timeToTargetMonths),
      base: ttt(b.timeToTargetMonths),
      diff: k.timeToTargetMonths - b.timeToTargetMonths,
      goodWhen: "down",
    },
  ];

  const metrics: {
    label: string;
    value: string;
    base: string;
    better?: boolean;
  }[] = [
    {
      label: "Total Personnel Cost",
      value: fmtUSDCompact(k.annualCost),
      base: fmtUSDCompact(b.annualCost),
      better: k.annualCost <= b.annualCost,
    },
    {
      label: "Required FTE",
      value: fmtNum(k.required),
      base: fmtNum(b.required),
    },
    {
      label: "Filled FTE",
      value: fmtNum(k.onboard),
      base: fmtNum(b.onboard),
      better: k.onboard >= b.onboard,
    },
    {
      label: "Vacancy Gap",
      value: fmtNum(k.required - k.onboard),
      base: fmtNum(b.required - b.onboard),
      better: k.required - k.onboard <= b.required - b.onboard,
    },
    {
      label: "Budget Variance",
      value: fmtUSDCompact(k.variance),
      base: fmtUSDCompact(b.variance),
      better: k.variance >= b.variance,
    },
    {
      label: "Mission Coverage",
      value: `${k.coverage.toFixed(0)}%`,
      base: `${b.coverage.toFixed(0)}%`,
      better: k.coverage >= b.coverage,
    },
    {
      label: "Time to Target Staffing",
      value: k.timeToTargetMonths >= 99 ? "Off track" : `${k.timeToTargetMonths} mo`,
      base: b.timeToTargetMonths >= 99 ? "Off track" : `${b.timeToTargetMonths} mo`,
      better: k.timeToTargetMonths <= b.timeToTargetMonths,
    },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Scenario Modeling"
        subtitle="Select a prebuilt planning scenario or adjust the levers to model your own"
        icon={<SlidersHorizontal className="h-4 w-4" />}
      />

      {/* Prebuilt scenarios */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {SCENARIOS.map((s) => {
          const active = s.id === scenarioId && !isCustom;
          const selected = s.id === scenarioId;
          return (
            <button
              key={s.id}
              onClick={() => selectScenario(s.id)}
              className={`rounded-xl border p-4 text-left transition-all ${
                active
                  ? "border-navy-600 bg-navy-700 text-white shadow-panel"
                  : selected
                  ? "border-navy-300 bg-white shadow-card"
                  : "border-slate-200 bg-white hover:border-navy-300 hover:shadow-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${active ? "text-white" : "text-navy-900"}`}
                >
                  {s.name}
                </span>
                {active && <Check className="h-4 w-4 text-agency-accent" />}
              </div>
              <p className={`mt-1 text-xs ${active ? "text-navy-100" : "text-slate-500"}`}>
                {s.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* Impact ribbon — what this scenario changes vs the baseline */}
      <Card>
        <CardHeader
          title="Impact vs. Baseline"
          subtitle={
            isCustom || customizedDivisionIds.length > 0
              ? "Live effect of your adjustments against the Baseline / Current Plan"
              : "Effect of this scenario against the Baseline / Current Plan"
          }
        />
        <div className="grid grid-cols-2 gap-px bg-slate-100 lg:grid-cols-4">
          {impact.map((m) => (
            <ImpactChip key={m.label} item={m} />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Controls */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Modeling Levers"
            subtitle={
              scope === "enterprise"
                ? isCustom
                  ? "Custom-adjusted scenario"
                  : "Scenario defaults"
                : "Per-division overrides on the enterprise defaults"
            }
            icon={<SlidersHorizontal className="h-4 w-4" />}
            right={
              scope === "enterprise" ? (
                isCustom ? (
                  <button
                    onClick={resetScenario}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset
                  </button>
                ) : undefined
              ) : divHasOverrides ? (
                <button
                  onClick={() => resetDivision(divId)}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <RotateCcw className="h-3 w-3" /> Reset division
                </button>
              ) : undefined
            }
          />

          {/* Scope toggle */}
          <div className="border-b border-slate-100 px-5 py-3">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                onClick={() => setScope("enterprise")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  scope === "enterprise" ? "bg-navy-700 text-white" : "text-slate-600"
                }`}
              >
                Enterprise
              </button>
              <button
                onClick={() => setScope("division")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  scope === "division" ? "bg-navy-700 text-white" : "text-slate-600"
                }`}
              >
                By division
              </button>
            </div>
            {scope === "division" && (
              <select
                value={divId}
                onChange={(e) => setDivId(e.target.value)}
                className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-navy-900 outline-none focus:ring-2 focus:ring-navy-500"
              >
                {model.divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Levers */}
          <div className="space-y-5 p-5">
            {scope === "enterprise"
              ? SLIDERS.map((s) => (
                  <LeverSlider
                    key={s.key}
                    def={s}
                    value={params[s.key]}
                    onChange={(v) => setParam(s.key, v)}
                  />
                ))
              : SLIDERS.map((s) => {
                  if (!s.perDivision) {
                    return (
                      <LeverSlider
                        key={s.key}
                        def={s}
                        value={params[s.key]}
                        disabled
                        enterpriseTag
                      />
                    );
                  }
                  const leverKey = s.key as DivisionLever;
                  const overridden = leverKey in divOverride;
                  const value = overridden
                    ? (divOverride[leverKey] as number)
                    : params[s.key];
                  return (
                    <LeverSlider
                      key={s.key}
                      def={s}
                      value={value}
                      overridden={overridden}
                      onChange={(v) => setDivisionParam(divId, leverKey, v)}
                      onRevert={() => resetDivisionParam(divId, leverKey)}
                    />
                  );
                })}
          </div>

          {/* Customized summary */}
          {scope === "division" && customizedDivisionIds.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs">
              <span className="text-slate-500">
                {customizedDivisionIds.length} of {model.divisions.length} divisions
                customized
              </span>
              <button
                onClick={resetAllDivisions}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-medium text-slate-600 hover:bg-slate-50"
              >
                <RotateCcw className="h-3 w-3" /> Reset all divisions
              </button>
            </div>
          )}
        </Card>

        {/* Live metrics */}
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <CardHeader
              title="Scenario Outcomes"
              subtitle="Live results vs. the Baseline / Current Plan"
              right={<RiskBadge level={k.risk} />}
            />
            <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-3">
              {metrics.map((m) => (
                <div key={m.label} className="bg-white p-4">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    {m.label}
                  </div>
                  <div className="mt-1 text-xl font-semibold tabular text-navy-900">
                    {m.value}
                  </div>
                  <div
                    className={`mt-0.5 text-[11px] ${
                      m.better === undefined
                        ? "text-slate-400"
                        : m.better
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    baseline {m.base}
                  </div>
                </div>
              ))}
              <div className="bg-white p-4">
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Overall Risk
                </div>
                <div className="mt-2">
                  <RiskBadge level={k.risk} />
                </div>
              </div>
            </div>
          </Card>

          <InsightPanel
            title="Scenario read-out"
            tone={k.variance < 0 ? "amber" : "navy"}
          >
            This configuration projects{" "}
            <strong>{fmtUSDCompact(k.annualCost)}</strong> in annual personnel cost against a{" "}
            <strong>{fmtUSDCompact(k.plannedBudget)}</strong> topline — a{" "}
            <strong>
              {k.variance >= 0 ? "surplus" : "shortfall"} of {fmtUSDCompact(Math.abs(k.variance))}
            </strong>{" "}
            ({fmtSignedPct(k.variancePct)}). Mission coverage lands at{" "}
            <strong>{k.coverage.toFixed(0)}%</strong>
            {k.coverage >= b.coverage
              ? " — at or above the baseline."
              : ` — ${(b.coverage - k.coverage).toFixed(0)} points below the baseline.`}{" "}
            {k.timeToTargetMonths >= 99
              ? "Authorized vacancies do not close at this pace; a hiring or attrition intervention is required."
              : `Authorized vacancies close in about ${k.timeToTargetMonths} months.`}
          </InsightPanel>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify types, lint, and tests**

Run: `npm run typecheck`
Expected: PASS (exit 0).
Run: `npm run lint`
Expected: PASS (no errors). Note: `DivisionLever` is used in the `leverKey` cast and `ScenarioParams` in `SliderDef`; both imports are referenced.
Run: `npm test`
Expected: PASS (calc + overrides suites green; no UI tests).

- [ ] **Step 3: Browser verification of the new UI**

Start the dev server if not running: `npm run dev` (serves http://localhost:3000).

Then drive the browser (agent-browser is installed):

```bash
agent-browser --session wfm set viewport 1440 900
agent-browser --session wfm open http://localhost:3000
agent-browser --session wfm wait --load networkidle
# Navigate to Scenario Modeling via the nav button, then:
agent-browser --session wfm screenshot enterprise.png   # Enterprise mode unchanged (6 sliders)
# Click "By division", pick a division, drag Hiring Pace to max, then:
agent-browser --session wfm screenshot division.png     # 4 editable + 2 muted levers; Outcomes move
```

Confirm by eye:
- Enterprise mode shows all 6 sliders and behaves exactly as before.
- By-division mode shows the division dropdown, 4 editable levers, and Pay Raise % / Budget Δ muted with an "enterprise" tag.
- Overriding a lever shows the "overridden" tag + revert (↺); the Scenario Outcomes and Impact numbers change live.
- Reverting a lever, "Reset division", and switching prebuilt scenarios all clear overrides.

Close the session: `agent-browser --session wfm close`

- [ ] **Step 4: Commit**

```bash
git add src/components/views/ScenarioModeling.tsx
git commit -m "feat: division-level inputs in Scenario Modeling"
```

---

## Self-Review notes (for the implementer)

- **Spec coverage:** Task 2 = types; Task 3 = inherit/override/reset helper semantics; Task 4 = engine resolveParams + scope boundary (gradeRollup/missions stay enterprise) + backward compat; Task 5 = state, clear-on-scenario-switch, derived customized list; Task 6 = scope toggle, division picker, 4 operational levers + 2 muted enterprise levers, per-lever revert, summary + reset-all, unchanged Outcomes/Impact.
- **Type consistency:** action names (`setDivisionParam`, `resetDivisionParam`, `resetDivision`, `resetAllDivisions`), `DivisionLever`, `DivisionOverrides`, and `customizedDivisionIds` are used identically across Tasks 3, 5, and 6. `resolveParams(global, override?)` takes `DivisionOverrides[string]` and is consumed only inside `computeModel`.
- **Out of scope (unchanged):** A/B Compare, Division Model detail modal, charts, persistence, per-division pay/budget.
```
