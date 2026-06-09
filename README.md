# Workforce Modeling Command Center

A polished, self-contained demonstration application for the **DHS HQ Office of the
Chief Financial Officer (OCFO), Resource Management Division.**

It helps leadership estimate **how many people and what grade levels** divisions need
to execute their mission, **what that workforce will cost** across fiscal years, and
**how hiring scenarios** affect budget, vacancies, mission capacity, and variance.

> **Demonstration only.** All data is synthetic and illustrative. It does **not**
> represent real DHS, OCFO, or any federal personnel, position, or budget
> information. Outputs support — and do not replace — leadership judgment.

---

## Running the app

```bash
npm install      # install dependencies (first run only)
npm run dev      # start the dev server -> http://localhost:3000
```

Other useful commands:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint (next/core-web-vitals)
npm run typecheck  # TypeScript, no emit
```

Then open **http://localhost:3000**.

---

## Major demo features

1. **Executive Dashboard** — CFO-ready KPI tiles (onboard FTE, authorized positions,
   current & projected vacancies, annual personnel cost, budget variance, mission
   coverage, hiring status, risk alerts) plus four charts: cost trend by fiscal year,
   FTE demand vs. supply, vacancy rate by division, and budget variance by organization.
2. **Division Workforce Model** — card and table views of eight OCFO divisions with
   current/required FTE, gap, grade mix, average loaded cost, annual cost, vacancies,
   mission criticality, and risk level.
3. **Grade / Level Mix Planner** — current vs. recommended staffing by grade
   (GS‑9 → SES + contractor support), with cost impact, mission impact, and risk if
   not staffed.
4. **Scenario Modeling** — five prebuilt scenarios (Baseline, Hiring Freeze,
   Accelerated Hiring, Mission Expansion, Budget Reduction) plus six live sliders
   (attrition, pay raise, hiring pace, contractor conversion, budget delta, mission
   demand) that update every metric across the app in real time.
5. **Budget Variance Analysis** — planned vs. projected cost, variance by division and
   by grade, variance drivers, and a plain‑English **variance explanation** panel.
6. **Mission Staffing Estimator** — pick a mission area (budget formulation/execution,
   financial reporting, internal controls, data analytics, component coordination,
   systems modernization, surge support) to see required roles, recommended grades,
   estimated cost, staffing gap, a confidence score, and rationale.
7. **Leadership Briefing View** — workforce posture, top 5 staffing risks, top 5 budget
   risks, prioritized hiring actions, a scenario tradeoff comparison, and suggested
   talking points for OCFO leadership.
8. **Methodology / Modeling Notes** — what the model combines, how the projection works,
   key cost assumptions, and how it would connect to authoritative systems in production.

---

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for an institutional, federal‑executive look
- **Recharts** for charts
- **lucide-react** for icons
- No backend, database, authentication, uploads, or external API calls — all data and
  modeling logic are embedded in `src/lib/`.

## Project structure

```
src/
  app/                 # Next.js app router shell (layout, page, globals)
  lib/
    types.ts           # domain types
    data.ts            # synthetic divisions, scenarios, missions, cost table
    calc.ts            # the workforce modeling engine
    format.ts          # number/currency formatting helpers
  components/
    CommandCenter.tsx  # masthead, navigation, layout
    model-context.tsx  # shared scenario state (drives every view)
    ui.tsx, kpi.tsx, charts.tsx
    views/             # one component per product area
```

## Assumptions & limitations

- Figures are **synthetic** and tuned for internal consistency and demo credibility,
  not accuracy.
- The projection is deterministic and transparent (see the **Methodology** tab); it is
  not a statistically fitted forecast.
- "Onboard," "authorized," and "required" are treated as total workforce FTE‑equivalent
  (federal + contractor), with the contractor category broken out in the grade mix.
- Built for a laptop demo; responsive down to tablet widths.
