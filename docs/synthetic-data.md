# Synthetic Demo Data — Where It Lives & How to Calibrate It

> All figures in this app are **synthetic and illustrative**. They do not represent real
> DHS, OCFO, or any federal personnel, position, or budget information, and contain no real
> names or PII. This note explains where the demo data lives, what stories it supports, the
> realism assumptions behind it, and how to change it safely.

## Where the data lives

Everything that seeds the demo is in **`src/lib/data.ts`**:

| Export | What it is |
|--------|-----------|
| `GRADE_COST` | Fully-burdened (loaded) annual cost per grade — GS‑9 → SES + Contractor. |
| `GRADE_MISSION_NOTE` | Plain-language note per grade (used in the Grade Mix planner). |
| `DIVISIONS` | The eight OCFO divisions: onboard / authorized / required FTE, criticality, attrition tendency, grade `profile`, and mission tags. **The primary realism surface.** |
| `PLANNED_PERSONNEL_BUDGET` | Enterprise personnel topline the projected cost is measured against. |
| `HISTORICAL_COST` | FY2024–FY2025 actuals that anchor the cost-trend chart. |
| `BASE_FISCAL_YEAR` | First projected year (2026). |
| `SCENARIOS` | Five prebuilt planning scenarios (lever presets). |
| `MISSIONS` | Eight cross-cutting mission areas with roles, required/current FTE, and confidence. |

`src/lib/types.ts` holds the data contracts. **`src/lib/calc.ts`** is the deterministic
engine that turns the seeds above into everything the UI shows (per-division results,
KPIs, the multi-year timeline, grade rollup, alerts, missions). The views in
`src/components/views/` are pure consumers — no view hardcodes numbers, so changing
`data.ts` updates the entire app consistently.

```
data.ts  ──►  calc.ts (computeModel)  ──►  model-context  ──►  every view/chart/table
```

## Realism calibration rubric

Data is tuned against seven tests, in priority order:

1. **Plausibility** — values fall in believable federal ranges (grades, loaded costs,
   attrition, vacancy rates).
2. **Internal consistency** — `onboard ≤ authorized`; `required` reflects mission need and
   may exceed authorized; grade `profile` weights sum to ~1.0; division costs roll up to a
   topline near `PLANNED_PERSONNEL_BUDGET`.
3. **Domain specificity** — grade mixes match the mission (senior-heavy front office,
   journey-heavy budget shop, contractor/tech-heavy systems, GS‑14-reviewer-heavy controls).
4. **Scenario usefulness** — the five scenarios produce clearly different, sensible outcomes.
5. **Visual/demo impact** — charts show real contrast (a red distress bar, a healthy green
   division, varied avg-cost columns) rather than a flat field.
6. **Edge-case coverage** — the set spans a healthy office through a division in genuine
   distress, plus over- and under-budget scenarios.
7. **Maintainability** — seeds stay declarative and small; the engine does the math.

## What the calibrated data is engineered to show

- **A clear "where is the problem" story.** *Financial Systems* is the distress case:
  Critical mission, heaviest contractor reliance (~31% of mix), highest attrition (16%,
  reflecting tech-talent flight), the widest gap, ~19% vacancy (the lone **red** bar on the
  vacancy chart), and ~71% coverage.
- **A healthy contrast.** *Front Office* is small, senior-heavy, sticky (5% attrition),
  ~9% vacancy, ~97% coverage — a low-risk anchor so "good" looks visibly different from "bad."
- **A spread, not a cluster.** Vacancy rates now range ~9%→19% (previously several landed on
  the same ~13.6%); coverage spans 71%→97%; avg loaded cost spans ~$159K→$204K because grade
  mixes differ by mission (senior-heavy offices genuinely cost more per head).
- **A believable budget tension.** Baseline runs ~2–3% **over** the personnel topline (pay +
  fills modestly outrunning funding). Scenarios spread cleanly: Hiring Freeze under-executes
  (~+6%, funds left unused), Accelerated Hiring blows the topline (~‑8%), Mission Expansion
  lands near balance, Budget Reduction strains (~‑5%).
- **Coherent cross-cutting missions.** The lowest-confidence, lowest-coverage missions (Data
  Analytics, Systems Modernization, Surge) align with the Financial Systems distress, so the
  Mission Estimator and Division Model tell the same story.

## Realism assumptions used

- Loaded cost = salary + benefits + overhead; contractor unit cost carries a premium over an
  equivalent GS‑13 (conversion-to-FTE saves money over time).
- The topline is set **below** full authorized cost on a vacancy-lapse assumption — budgets
  are built expecting some positions to stay open.
- "Onboard / Current FTE" shown in the UI is the **planning-year (FY2026) projection** — i.e.
  after one modeled year of attrition and hiring — not a raw point-in-time headcount.
- Attrition varies by talent market: leadership/front-office low (~5%), audit/reporting low
  (~7%), journey analyst shops moderate (~9–11%), technical/systems high (~16%).

## How to update it safely

1. **Edit only `src/lib/data.ts`.** Keep each grade `profile(...)` summing to ~1.0 and keep
   `onboard < authorized`. Use the `profile(g9, g11, g12, g13, g14, g15, ses, ctr)` helper —
   arguments are in that fixed order.
2. **Re-measure before trusting the UI.** The `lib` files use only relative imports, so you
   can compile and compute the resulting KPIs without booting Next.js:
   ```bash
   npx tsc src/lib/calc.ts src/lib/data.ts src/lib/types.ts src/lib/format.ts \
     --outDir /tmp/libout --module commonjs --target es2019 \
     --moduleResolution node --esModuleInterop --skipLibCheck
   node -e 'const {computeModel}=require("/tmp/libout/calc.js");
            const {SCENARIOS}=require("/tmp/libout/data.js");
            const k=computeModel("baseline",SCENARIOS[0].params).kpis;
            console.log(k.coverage.toFixed(0), (k.variancePct*100).toFixed(1)+"%", k.risk);'
   ```
   Tune `PLANNED_PERSONNEL_BUDGET` so the baseline variance stays within roughly ±3%.
3. **Mind the chart thresholds** (so contrast survives edits): vacancy chart colors red at
   ≥18%, amber at ≥12% (`src/components/charts.tsx`); coverage tones green ≥92, amber ≥82,
   red below (`toneForCoverage` in `src/components/ui.tsx`).
4. **Validate:** `npm run typecheck && npm run lint && npm run build`.
5. **Do not** add real names/PII, external APIs, or live data dependencies — the demo is
   intentionally self-contained.

## Known limitation (data-independent)

`timeToTargetMonths` reads "Off track" across scenarios because the engine compares annual
gross hires (gap × pace) against annual losses on the full onboard base (onboard × attrition);
once a workforce is mostly filled, base attrition can exceed fills on the small remaining gap.
This is an **engine behavior, not a data artifact**, and is unchanged by this calibration. A
future pass could derive time-to-target from the existing year-by-year projection
(`projectDivision` already computes `vacanciesByYear`) so accelerated-hiring scenarios show a
real, closing timeline.
