# Workforce Modeling Command Center — Executive UX Audit & Implementation Backlog

**Audience lens:** DHS HQ OCFO leadership · CFO & deputies · Resource Management
leadership · workforce planning analysts · budget officers · first-time demo viewers.

**Scope:** User experience, visual communication, information architecture, demo
effectiveness, and executive comprehension. *Not* code quality, architecture, testing,
or backend design.

**Reviewed build:** `src/components/CommandCenter.tsx` (8-tab shell) plus all eight
views in `src/components/views/`, shared primitives (`ui.tsx`, `kpi.tsx`, `charts.tsx`),
and the modeling engine (`src/lib/calc.ts`, `data.ts`). Baseline scenario figures used
throughout: **568 onboard / 665 authorized / 690 required / ~97 funded vacancies /
~$85–92M personnel cost.**

---

## 1. Executive Summary

The product is **technically impressive and visually disciplined**. The DHS-institutional
palette, tabular figures, consistent card system, live scenario engine, and plain-English
insight panels already put it well ahead of a typical government dashboard. A first-time
executive will recognize it as serious and credible within seconds.

The gap is **not polish — it is decision framing.** The application currently presents a
*workbench for analysts* rather than a *decision instrument for executives*. Today the
viewer must assemble the answer themselves by reading nine KPI tiles, four charts, and a
paragraph of prose. The single most important upgrade is to **lead with the answer** and
let the supporting data follow.

Four structural issues suppress executive impact:

1. **No answer-first headline.** The dashboard opens with a 9-tile metric grid. The
   actual conclusion ("85% staffed, $X over topline, two critical divisions at risk")
   lives in an insight panel *below the fold*. Executives read top-down; the verdict must
   be the first thing on screen.
2. **The scenario lever is hidden from the dashboard.** Changing the scenario — the most
   persuasive "wow" interaction in the whole product — requires navigating to a separate
   tab. The dashboard never moves during the part of the demo where movement matters most.
3. **Flat visual hierarchy.** Nine identically-sized KPI tiles and four equally-weighted
   charts give the eye no priority order. Everything shouts, so nothing leads.
4. **Two parallel risk taxonomies, no legend.** Risk (Severe/Elevated/Moderate/Low) and
   Criticality (Critical/High/Moderate) run in parallel with no on-screen key. A
   first-time viewer cannot decode the color language without narration.

None of these require re-architecture. They are presentation-layer changes — reordering,
resizing, consolidating, and adding three or four new "answer" components on top of an
engine that already computes everything needed.

**Current UX score: 71 / 100.** Strong foundation, analyst-grade framing.
**Projected after this backlog: 91 / 100.** Executive-grade decision instrument.

---

## 2. Top 10 Improvements (ranked by demo impact ÷ effort)

| # | Improvement | Priority | Effort |
|---|-------------|----------|--------|
| 1 | **Answer-first "Decision Banner"** at the top of the dashboard — one sentence verdict + 3 hero metrics with plain-English status words ("Understaffed", "Over topline"). | P0 | M |
| 2 | **Global scenario switcher** in the masthead/sub-header, available on every screen so the whole app reacts live during the demo. | P0 | M |
| 3 | **Tier the dashboard KPIs** into 3 hero tiles + a secondary strip; collapse from 9 equal tiles to a clear hierarchy. | P0 | S |
| 4 | **Reference lines on every chart** — budget topline on cost trend, readiness threshold on coverage/vacancy, demand-supply gap shaded. | P0 | S |
| 5 | **Color & risk legend** + a one-line glossary ("Authorized vs Required vs Onboard") so the taxonomy decodes itself. | P0 | S |
| 6 | **Staffing waterfall / single reconciling bar** (Onboard → Vacancies → Required gap) to unify the five staffing nouns into one picture. | P1 | M |
| 7 | **Scenario "impact ribbon"** on the Scenario page: animated before→after deltas with up/down arrows and red/green so cause-and-effect is *seen*, not read. | P1 | M |
| 8 | **"What changed" callouts** when a slider moves — e.g., "+$4.2M cost, +6 pts coverage, freeze closes in 0 of 5 divisions." | P1 | M |
| 9 | **Export / Print Briefing** to a clean one-pager for leave-behinds. | P1 | M |
| 10 | **Guided demo mode / "Start here" walkthrough** — 5-step highlighted tour for first-time viewers and self-running demos. | P2 | L |

---

## 3. Quick Wins (< 1 hour each)

These are high-yield, low-risk presentation edits.

- **QW-1 — Move the insight panel to the top of the dashboard.** In
  `ExecutiveDashboard.tsx`, render the "What this means for leadership" `InsightPanel`
  *above* the KPI grid, restyled as a headline banner. Zero new logic; reorders existing
  JSX (lines 192–214 move above line 55).
- **QW-2 — Add status words to KPI tiles.** Augment `StatTile` (`kpi.tsx`) with an
  optional `statusWord` chip ("Understaffed", "Within budget", "Off track"). Drives
  comprehension far faster than a raw percentage.
- **QW-3 — Budget topline reference line on the cost-trend chart.** Add a Recharts
  `<ReferenceLine y={plannedBudget} label="Planned topline" />` to `CostTrendChart`
  (`charts.tsx`). The single most-asked exec question ("are we over?") becomes visual.
- **QW-4 — Readiness threshold line on the vacancy chart.** Add a `<ReferenceLine x={12}
  label="Target" />` to `VacancyByDivisionChart`; the existing red/amber cell coloring
  then has a visible anchor.
- **QW-5 — Suppress "vs baseline" deltas when the active scenario *is* baseline.** On
  first load every delta reads "+0 / flat", which is noise. Hide the delta row when
  `scenarioId === "baseline" && !isCustom`.
- **QW-6 — Calmer demo banner.** The amber banner (`CommandCenter.tsx` lines 116–123) is
  currently the brightest element on every screen. Reduce to a slim slate bar with a small
  "Demo data" pill so it stops competing with the content for first attention.
- **QW-7 — Raise label contrast.** `slate-400` 11px uppercase micro-labels (used in
  `kpi.tsx`, `DivisionModel.tsx` `Metric`, `MissionEstimator.tsx` `Stat`) are hard to
  read on a projector. Bump to `slate-500`/`slate-600`.
- **QW-8 — "As of" / data-freshness stamp** in the masthead ("Planning year FY2026 · as
  of June 2026 · synthetic") so the numbers feel anchored in time.
- **QW-9 — Coverage tile: add the plain-English gap.** Show "85% — 102 FTE short of
  requirement" rather than "85%" alone, mirroring Section 8's insight-over-raw-data goal.

---

## 4. Medium Enhancements (1–4 hours each)

- **ME-1 — Decision Banner component (Top-10 #1).** New `DecisionBanner.tsx`: a full-width
  navy band reading e.g. *"OCFO is 85% staffed to mission and $3.1M over the personnel
  topline. Two critical divisions — Budget and Financial Systems — drive the risk."* with
  three hero stat blocks and the overall risk badge. Pure presentation over existing
  `model.kpis`.
- **ME-2 — Global scenario switcher (Top-10 #2).** Promote the five `SCENARIOS` into a
  compact segmented control in the sub-header (`CommandCenter.tsx`), wired to the existing
  `selectScenario` from `model-context.tsx`. Every view already reads from context, so the
  whole app reacts instantly. Single biggest demo upgrade for the effort.
- **ME-3 — Tiered KPI layout (Top-10 #3).** Split the 9 tiles into 3 "hero" tiles
  (Coverage, Cost vs Topline, Risk) rendered large, and a secondary strip of the rest
  rendered small. Adjust the grids in `ExecutiveDashboard.tsx` lines 56–143.
- **ME-4 — Staffing waterfall (Top-10 #6).** New chart in `charts.tsx`:
  `Onboard (568) → +Vacancies to Authorized (97) → +Gap to Required (25)`, one stacked
  horizontal bar that reconciles all five staffing nouns the product currently scatters
  across tiles. Place it at the top of the Division Model and reference it in narration.
- **ME-5 — Scenario impact ribbon (Top-10 #7).** Above the Scenario Outcomes grid, a row
  of animated before→after chips (cost, coverage, variance, time-to-target) with directional
  arrows and red/green tone, using the `baselineModel` vs `model` already in context.
- **ME-6 — Export / Print Briefing (Top-10 #9).** Add a print stylesheet and a "Print
  brief" button on `BriefingView.tsx`; hide nav/banner in `@media print`. Gives leadership
  a leave-behind one-pager with zero new data work.
- **ME-7 — Demand-vs-supply gap shading.** In `DemandSupplyChart`, add an `<Area>` between
  the required and filled lines tinted red where demand exceeds supply — the gap *is* the
  story and is currently invisible between two lines.
- **ME-8 — Risk & metric legend / glossary.** A dismissible "How to read this" strip
  (or info popover on the masthead) defining the four risk levels, three criticality
  levels, and the Authorized/Required/Onboard distinction.

---

## 5. High-Impact Enhancements (4+ hours each)

- **HE-1 — Guided demo mode (Top-10 #10).** A 5-step coachmark tour (Decision Banner →
  scenario switch → watch dashboard react → division drill-down → briefing/export). Also
  serves as an unattended kiosk loop. Largest "first-time viewer" comprehension lift.
- **HE-2 — Scenario A/B compare view.** Pick any two scenarios and render their KPIs and
  charts side by side with delta columns. The engine already computes every scenario in
  `BriefingView`'s `scenarioCompare`; this surfaces it as a first-class comparison screen.
- **HE-3 — Division drill-down detail.** Make division cards/rows clickable into a focused
  panel: that division's grade mix, multi-year vacancy trajectory, risk drivers, and
  recommended hiring sequence. Turns the Division Model from a roster into an investigation.
- **HE-4 — Narrative "insight engine" upgrade (Section 8).** Replace remaining raw-number
  displays with generated decision language ("Vacancies are projected to create a shortfall
  equivalent to ~2 mission teams by FY2030"). Centralize phrasing in a `lib/narrative.ts`
  so every panel speaks the same executive voice.

---

## SECTION 1 — First Impression Review

### First 30 seconds
**Immediately obvious:** This is a serious federal financial product. The shield, OCFO
masthead, navy palette, and clean cards read as institutional and trustworthy. The viewer
knows *what organization* and *what domain* instantly.

**Confusing / requires explanation:**
- The screen opens on a **wall of nine KPI tiles**. Nothing tells the eye where to start.
- Two color-coded badge systems (Risk, Criticality) appear with **no legend**.
- The brightest element is the **amber demo banner**, which pulls first attention to a
  disclaimer rather than to the decision.
- "Authorized," "Required," "Onboard," "Vacancies," "Coverage," "Projected EOY Vacancies"
  — six staffing nouns compete before the viewer has a mental model to file them under.

**Draws attention first (today):** amber banner → top-left KPI tile → masthead. **Should
be:** the headline verdict → the one chart that proves it → the scenario lever.

### First 2 minutes
A motivated viewer *can* reconstruct the story from the insight panel at the bottom and
the charts, but it takes effort and ideally narration. Without a presenter, a first-timer
would not reliably answer "are we OK?" in two minutes. The data is all present; the
**priority order is missing.**

### Executive Attention Map (current → target)

| Zone | Today | Target |
|------|-------|--------|
| Top band | Demo disclaimer (amber) | **Decision verdict** (ME-1) |
| Upper content | 9 equal KPI tiles | 3 hero metrics + secondary strip (ME-3) |
| Mid content | 4 equal charts | 1 lead chart (cost vs topline) + supporting trio |
| Lower content | Insight panel (the actual answer) | Drill-downs & alerts |
| Persistent | Scenario shown as tiny text | **Live scenario switcher** (ME-2) |

---

## SECTION 2 — Demo Flow Analysis (10-minute slot)

**Show first:** the **Executive Dashboard with the new Decision Banner** on the Baseline
scenario. Open on the verdict, not the metric grid.

**Hide initially / progressively disclose:** Methodology, Grade-Mix detail tables, and the
full division table. Reveal these only when a question demands proof.

### Recommended screen order & click path
1. **Dashboard (Baseline)** — read the Decision Banner aloud. *"Here's where OCFO stands
   today."* (0:00–1:30)
2. **Flip the global scenario to "Hiring Freeze"** from the switcher — **stay on the
   dashboard** and let the hero tiles, charts, and verdict visibly move. This is the wow
   moment. *"Watch what a freeze does to readiness."* (1:30–3:30)
3. **Scenario Modeling** — drag the Hiring Pace slider; show the impact ribbon reacting in
   real time. *"Leadership can dial the levers live."* (3:30–5:30)
4. **Division Model** — point at the staffing waterfall and the two red divisions. *"The
   risk isn't evenly spread; it's concentrated here."* (5:30–7:00)
5. **Briefing View** — top risks, hiring actions, talking points; hit **Print brief**.
   *"This is the leave-behind."* (7:00–9:00)
6. **Close back on the Dashboard, Baseline** — restate the verdict and the ask. (9:00–10:00)

**Reveal sequence principle:** verdict → consequence (scenario swing) → controls →
where → what to do → leave-behind. Each step answers the question the previous one raises.

---

## SECTION 3 — Executive Dashboard Review (15-second test)

Can an executive answer each question in 15 seconds *today*?

| Question | Today | Why | Fix |
|----------|-------|-----|-----|
| Are we understaffed? | ⚠️ Partial | Coverage % and vacancy count exist but aren't labeled with a verdict word | QW-2, ME-1: "85% — Understaffed by 102 FTE" |
| How much will staffing cost? | ✅ Yes | "Annual Personnel Cost" tile is clear | Keep; promote to hero (ME-3) |
| Where are the largest workforce risks? | ⚠️ Partial | Vacancy chart + alert list require scanning and sorting by eye | Name the top 2 in the banner (ME-1) |
| What divisions need attention? | ⚠️ Partial | Risk alerts list it, but it's bottom-right and truncated | Hero "watchlist" + drill-down (HE-3) |
| What hiring actions are needed? | ❌ No | Only exists on the **Briefing** tab, not the dashboard | Surface top-2 hiring actions on dashboard |
| Are we within budget? | ⚠️ Partial | Variance tile requires reading sign + color to interpret | Topline reference line (QW-3) + status word |

**Executive comprehension score (current): 58/100** — the data answers all six, but four of
six require interpretation, scanning, or a tab change. **Target after fixes: 90/100.**

**Recommended redesigns:** (1) Decision Banner answering all six in one band; (2) status
words on tiles; (3) promote "hiring actions" and "divisions to watch" onto the dashboard;
(4) reference lines so "within budget?" and "understaffed?" are visual, not arithmetic.

---

## SECTION 4 — Visual Hierarchy Review

**Competing elements:** amber banner vs content; 9 equal KPI tiles; 4 equal charts; two
badge taxonomies. **Weak hierarchy:** no size/weight difference between a hero metric
(Coverage) and a supporting one (Authorized Positions). **Cognitive load:** five staffing
nouns introduced simultaneously. **Unclear emphasis:** the page's most important sentence
(the insight panel) has the least prominent position.

### Before / After

| Element | Before | After |
|---------|--------|-------|
| Page opener | 9-tile metric grid | Decision Banner verdict (ME-1) |
| KPI tiles | 9 identical | 3 hero (2xl+status word) + 6 compact (ME-3) |
| Charts | 2×2 equal | 1 lead (cost vs topline, full-width) + 3 supporting |
| Demo banner | Bright amber, top, full-bleed | Slim slate strip + "Demo data" pill (QW-6) |
| Micro-labels | `slate-400` 11px | `slate-600` 11px (QW-7) |
| Risk colors | Unlabeled | Legend strip (ME-8) |
| Insight panel | Bottom of page | Promoted to headline (QW-1 / ME-1) |

**Typography:** keep tabular-nums (good); enlarge hero KPI values; add a status-word type
ramp. **Color strategy:** reserve red strictly for "needs action / over topline / severe",
amber for "watch", emerald for "healthy", navy for neutral structure — and *publish that
key on screen.*

---

## SECTION 5 — Storytelling Review

The product must answer: *"How many people do we need, where, what will they cost, and what
happens if conditions change?"*

| Story beat | Covered? | Where | Gap |
|------------|----------|-------|-----|
| How many do we need | ✅ | Required FTE, Mission Estimator | Not reconciled against onboard in one visual |
| Where do we need them | ✅ | Division Model, vacancy chart | No drill-down; risk concentration not headlined |
| What will they cost | ✅ | Cost trend, variance | No topline reference line on the trend |
| What if conditions change | ⚠️ | Scenario Modeling tab | **Disconnected from the dashboard**; cause→effect is read, not seen |

**Narrative gap analysis:** the four beats *exist* but are told as four separate exhibits
across eight tabs. The connective tissue — *"this is the situation → here's the lever →
here's the consequence → here's the action"* — is missing from the main screen. Closing
it: Decision Banner (beat framing) + global scenario switcher (the "what if" lives where
the consequence is visible) + staffing waterfall (reconciles need vs have) + impact ribbon
(makes change legible). **New visualizations proposed:** staffing waterfall (ME-4),
demand-supply gap shading (ME-7), scenario impact ribbon (ME-5), A/B compare (HE-2).

---

## SECTION 6 — Scenario Modeling Review

**Strengths:** five well-named prebuilt scenarios with plain-language taglines; six labeled
sliders with hints and live units; metrics show "baseline X" with better/worse coloring; a
prose read-out. This is already the best part of the product.

**Weaknesses for executives:**
- **Cause and effect is read, not seen.** Numbers change but there's no motion, arrow, or
  bar that *shows* the swing. An executive feels change through visual movement.
- **No chart on the scenario page.** The viewer can't see the trajectory shift, only the
  endpoint numbers.
- **"Better/worse" coloring is subtle** (small 11px caption) and easy to miss.
- **No side-by-side compare** of two scenarios on this screen.
- **Sliders lack outcome anchoring** — e.g., no "this pace closes vacancies in N months"
  tooltip on the Hiring Pace track itself.

### Scenario Modeling Enhancement Plan
1. **Impact ribbon (ME-5):** before→after chips with arrows + red/green, animated on change.
2. **Inline mini-trend:** a small cost-or-coverage sparkline that re-draws as levers move.
3. **Stronger delta encoding:** replace the "baseline X" caption with a signed,
   colored delta pill (e.g., `▲ +$4.2M`).
4. **A/B compare (HE-2):** two-scenario side-by-side with delta column.
5. **Outcome-anchored sliders:** live tooltip translating each lever into a mission
   consequence ("85% pace → vacancies close in 14 months").
6. **"Reset to scenario" is good — add "Save as named what-if"** so a presenter can stage
   a custom scenario before the meeting.

---

## SECTION 7 — Cognitive Load Review

**Unnecessary / noisy on first load:**
- "vs baseline" deltas that read "+0 / flat" when the active scenario *is* baseline (QW-5).
- Nine KPI tiles presented with equal weight (ME-3).
- The bright amber banner consuming first attention every screen (QW-6).

**Duplicate / overlapping information:**
- Budget variance appears on the **Dashboard**, **Budget Variance** tab, **and** Briefing —
  consistent, but ensure each instance adds a different altitude (summary → analysis →
  brief) rather than repeating the same chart.
- The per-division "planned share from authorized" variance calculation is repeated in
  three files (`ExecutiveDashboard`, `BudgetVariance`, `BriefingView`) — for the user this
  is fine, but keep the *story* identical so numbers never appear to disagree.

**Distracting:** two badge taxonomies without a key; low-contrast micro-labels.

### Cognitive Load Reduction Plan
- **Remove:** baseline-vs-baseline zero deltas on first load.
- **Collapse:** 9 tiles → 3 hero + secondary strip; Methodology and full tables behind a
  click.
- **Summarize:** lead each view with one verdict sentence (Decision Banner pattern).
- **Defer:** Grade-mix detail table, division detail table, and methodology until requested.
- **Unify:** publish one risk/criticality/color legend so the taxonomy stops costing
  working memory.

---

## SECTION 8 — Executive Insights Review

The product *already* does this well in its `InsightPanel` prose — the opportunity is to
push insight language **up** into the tiles and headlines, where raw numbers currently sit.

| Raw today | Insight replacement |
|-----------|--------------------|
| "Mission Coverage Score: 85%" | "Understaffed — ~102 FTE short of mission requirement (≈2 mission teams)." |
| "Projected EOY Vacancies: 140" | "Vacancies grow ~44% by FY2030 if pace holds — attrition is winning." |
| "Projected Budget Variance: -$3.1M" | "$3.1M over the personnel topline — hiring + pay outrun funding." |
| "Hiring Plan Status: Off track" | "At this pace, authorized vacancies never close — a deliberate intervention is required." |
| "Risk Alerts: 6" | "6 active alerts — 2 critical divisions drive the workforce risk." |

### Insight Layer Enhancement Plan
- **Insight cards:** add an optional `statusWord` + one-line "so-what" to every `StatTile`.
- **Narrative callouts:** the Decision Banner (ME-1) as the top-level executive summary.
- **Executive summaries per view:** each tab opens with one generated verdict sentence.
- **Centralized briefing language:** a `lib/narrative.ts` so phrasing is consistent and
  reusable (HE-4) — the briefing talking points already prove the engine can generate this.

---

## SECTION 9 — Demo Impact Review

**Wow moments (today):** the live scenario sliders updating every metric; the polished
institutional look; the auto-generated talking points on the Briefing tab.

**Weak moments:** the dashboard never *moves* during the dashboard portion of the demo
(scenario lives elsewhere); static metric wall on open; no transitions when scenarios
change, so the swing doesn't register emotionally.

**Confusing moments:** unlabeled risk colors; six staffing nouns up front; the amber banner
grabbing first attention.

**Missed opportunities:** no headline verdict; no print/leave-behind; no guided tour for
unattended viewing; no side-by-side scenario compare.

### Demo Impact Improvement Plan (understanding-first, no gimmicks)
- **Global scenario switcher on the dashboard (ME-2)** so the hero screen reacts live — the
  core "wow."
- **Number roll / count-up transition** on KPI values when the scenario changes (≤400ms) so
  the eye tracks the movement. Restrained, not flashy.
- **Impact ribbon with directional arrows (ME-5)** — change becomes a *gesture*, not a diff.
- **Decision Banner (ME-1)** as the opening and closing beat of every demo.
- **Print brief (ME-6)** as the closer.
- **Guided demo mode (HE-1)** for self-running and first-time confidence.
- *Avoid:* gratuitous animation, parallax, decorative motion, or any transition slower than
  ~500ms — executives read these as unserious.

---

## SECTION 10 — Prioritized GitHub Issue Backlog

> Format per request: Title · Problem · Why It Matters · Recommended Solution ·
> Implementation Details · Expected Demo Impact · Complexity · Priority.

### ISSUE 1 — Add answer-first Decision Banner to the dashboard
- **Problem:** The dashboard opens on a 9-tile metric grid; the actual verdict is in an
  insight panel below the fold.
- **Why it matters:** Executives read top-down and decide in seconds. The conclusion must
  lead, not trail.
- **Recommended solution:** A full-width banner stating the staffing %, budget posture, and
  the two highest-risk divisions in one sentence, with three hero stat blocks + risk badge.
- **Implementation:** New `src/components/views/DecisionBanner.tsx` consuming `model.kpis`,
  `model.divisions` (top-2 by `riskScore`), `model.alerts`. Render first in
  `ExecutiveDashboard.tsx`. Reuse `InsightPanel`/badge styles. No engine changes.
- **Expected demo impact:** The first sentence out of the presenter's mouth is already on
  screen; opens and closes the demo.
- **Complexity:** Medium. **Priority:** P0.

### ISSUE 2 — Global scenario switcher on every screen
- **Problem:** Switching scenarios requires navigating to the Scenario Modeling tab; the
  dashboard never reacts during the dashboard portion of the demo.
- **Why it matters:** Live "what-if" on the hero screen is the most persuasive interaction
  in the product.
- **Recommended solution:** A segmented control of the five `SCENARIOS` in the sub-header,
  visible on all tabs, wired to `selectScenario`.
- **Implementation:** In `CommandCenter.tsx`, add a scenario segmented control next to
  `ScenarioIndicator`, calling `useModel().selectScenario`. All views already read context —
  no per-view changes.
- **Expected demo impact:** Flip a scenario and the entire app moves; the core wow moment.
- **Complexity:** Medium. **Priority:** P0.

### ISSUE 3 — Tier the dashboard KPIs (3 hero + secondary strip)
- **Problem:** Nine equal-weight tiles give the eye no priority.
- **Why it matters:** Hierarchy is comprehension; equal weight = no weight.
- **Recommended solution:** Render Coverage, Cost-vs-Topline, and Risk as large hero tiles;
  the rest as a compact secondary strip.
- **Implementation:** Restructure grids in `ExecutiveDashboard.tsx` (lines 56–143); add a
  `size="hero"` variant to `StatTile` (`kpi.tsx`).
- **Expected demo impact:** Eye lands on the three numbers that matter.
- **Complexity:** Small. **Priority:** P0.

### ISSUE 4 — Reference lines on charts (topline, readiness threshold, gap)
- **Problem:** "Are we over budget?" and "is this division OK?" require mental arithmetic.
- **Why it matters:** Executives judge against a line, not a number.
- **Recommended solution:** Topline `ReferenceLine` on cost trend; target line on vacancy
  chart; shaded gap on demand-vs-supply.
- **Implementation:** In `charts.tsx`, add `<ReferenceLine>`/`<Area>` to `CostTrendChart`,
  `VacancyByDivisionChart`, `DemandSupplyChart`. Pass `plannedBudget` through from the view.
- **Expected demo impact:** "Over the line in red" reads instantly across a boardroom.
- **Complexity:** Small. **Priority:** P0.

### ISSUE 5 — Status words on KPI tiles
- **Problem:** Tiles show raw values ("85%", "-$3.1M") that require interpretation.
- **Why it matters:** A word ("Understaffed", "Over topline") is faster than a figure.
- **Recommended solution:** Optional `statusWord` chip on `StatTile`, colored by tone.
- **Implementation:** Extend `StatTileProps` in `kpi.tsx`; set words in `ExecutiveDashboard`.
- **Expected demo impact:** Self-explaining tiles; less narration needed.
- **Complexity:** Small. **Priority:** P0.

### ISSUE 6 — On-screen risk / criticality / staffing-noun legend
- **Problem:** Two badge taxonomies and five staffing nouns appear with no key.
- **Why it matters:** First-time viewers can't decode the color or vocabulary unaided.
- **Recommended solution:** A dismissible "How to read this" strip / info popover.
- **Implementation:** New `Legend`/`HowToRead` component; trigger in the masthead or below
  the Decision Banner. Static content; no engine changes.
- **Expected demo impact:** The screen teaches itself; fewer "what does red mean?" questions.
- **Complexity:** Small. **Priority:** P0.

### ISSUE 7 — Staffing waterfall (reconcile onboard / authorized / required)
- **Problem:** Onboard, authorized, required, vacancies, and gap are scattered across tiles.
- **Why it matters:** One picture that reconciles "have vs funded vs need" eliminates the
  product's biggest conceptual load.
- **Recommended solution:** A single stacked horizontal bar:
  Onboard → +Vacancies-to-Authorized → +Gap-to-Required.
- **Implementation:** New `StaffingWaterfall` in `charts.tsx` from `model.kpis`; place atop
  Division Model and reference on the dashboard.
- **Expected demo impact:** "Here's what we have, what's funded, what we need" in one glance.
- **Complexity:** Medium. **Priority:** P1.

### ISSUE 8 — Scenario impact ribbon (animated before→after)
- **Problem:** Scenario changes are read as static numbers, not seen as movement.
- **Why it matters:** Executives feel change through motion and direction.
- **Recommended solution:** A ribbon of before→after chips with arrows + red/green, animated
  on change.
- **Implementation:** New component in `ScenarioModeling.tsx` using `baselineModel` vs
  `model`; CSS transition ≤400ms.
- **Expected demo impact:** Cause-and-effect becomes a gesture; the slider demo lands harder.
- **Complexity:** Medium. **Priority:** P1.

### ISSUE 9 — Export / Print Briefing one-pager
- **Problem:** No leave-behind artifact for leadership.
- **Why it matters:** Executives ask "can I get this on paper?" — and the answer should be
  yes.
- **Recommended solution:** "Print brief" button + print stylesheet hiding nav/banner.
- **Implementation:** `@media print` rules in `globals.css`; print button in `BriefingView`.
- **Expected demo impact:** Confident closer; the meeting walks out with the brief.
- **Complexity:** Medium. **Priority:** P1.

### ISSUE 10 — Surface hiring actions & watchlist on the dashboard
- **Problem:** "What hiring actions are needed?" only exists on the Briefing tab.
- **Why it matters:** It's one of the six core executive questions; it belongs on the
  hero screen.
- **Recommended solution:** A compact "Top hiring actions" + "Divisions to watch" panel on
  the dashboard.
- **Implementation:** Reuse the `hiringActions`/`staffingRisks` logic from `BriefingView.tsx`
  (lift into a shared selector) and render a condensed version in `ExecutiveDashboard`.
- **Expected demo impact:** The dashboard answers all six exec questions without a tab change.
- **Complexity:** Medium. **Priority:** P1.

### ISSUE 11 — Demand-vs-supply gap shading
- **Problem:** The gap between required and filled lines — the actual story — is invisible.
- **Why it matters:** The shortfall, not the two lines, is the point.
- **Recommended solution:** Tinted area between the lines where demand exceeds supply.
- **Implementation:** Add `<Area>`/clipped fill in `DemandSupplyChart` (`charts.tsx`).
- **Expected demo impact:** The widening gap under a freeze reads instantly.
- **Complexity:** Medium. **Priority:** P1.

### ISSUE 12 — KPI count-up transition on scenario change
- **Problem:** Metric changes are abrupt; the eye doesn't track the swing.
- **Why it matters:** A brief roll signals "this moved" without being gimmicky.
- **Recommended solution:** Animate `StatTile` values over ≤400ms on change.
- **Implementation:** Small count-up hook in `kpi.tsx`; respect `prefers-reduced-motion`.
- **Expected demo impact:** Scenario swings feel alive and intentional.
- **Complexity:** Small. **Priority:** P2.

### ISSUE 13 — Guided demo / "Start here" mode
- **Problem:** First-time and unattended viewers face nine tiles with no entry point.
- **Why it matters:** Self-running demos and exec self-service both need a path.
- **Recommended solution:** A 5-step coachmark tour following the Section 2 flow.
- **Implementation:** Lightweight step/overlay component; no engine changes.
- **Expected demo impact:** Confident self-service; strong kiosk/booth mode.
- **Complexity:** Large. **Priority:** P2.

### ISSUE 14 — Scenario A/B compare view
- **Problem:** Tradeoffs are a dense table; no visual side-by-side.
- **Why it matters:** "Freeze vs Accelerate" is the central leadership choice.
- **Recommended solution:** Two-scenario picker rendering KPIs/charts side by side + deltas.
- **Implementation:** Reuse `BriefingView`'s `scenarioCompare`; new compare view/sub-tab.
- **Expected demo impact:** Frames the decision as an explicit choice.
- **Complexity:** Large. **Priority:** P2.

### ISSUE 15 — Calmer demo banner, contrast & "as-of" stamp (housekeeping)
- **Problem:** Amber banner dominates; micro-labels are low-contrast; no time anchor.
- **Why it matters:** Compliance disclosure shouldn't outrank the decision; legibility on a
  projector matters for an older audience.
- **Recommended solution:** Slim slate banner + "Demo data" pill; `slate-400`→`slate-600`
  labels; "Planning FY2026 · as of <date>" stamp in the masthead.
- **Implementation:** `CommandCenter.tsx` banner/masthead; label color sweep across
  `kpi.tsx`, `DivisionModel.tsx`, `MissionEstimator.tsx`.
- **Expected demo impact:** Cleaner, calmer, more readable first impression.
- **Complexity:** Small. **Priority:** P1.

---

## Recommended Demo Walkthrough (presenter script, 10 min)

1. **Open — Dashboard, Baseline (0:00).** *"This is OCFO's workforce posture today."* Read
   the Decision Banner verbatim — staffing %, budget posture, the two divisions at risk.
2. **Swing — flip to Hiring Freeze (1:30), stay on the dashboard.** *"Here's the cost of
   inaction."* Let the hero tiles and charts move; point at coverage dropping and the
   widening demand-supply gap.
3. **Control — Scenario Modeling (3:30).** Drag Hiring Pace up; narrate the impact ribbon.
   *"Leadership can model this live — every lever, every number, instantly."*
4. **Where — Division Model (5:30).** Staffing waterfall first, then the two red divisions.
   *"The risk is concentrated, not spread."*
5. **What to do — Briefing View (7:00).** Top risks, prioritized hiring actions, talking
   points. Hit **Print brief.** *"You walk out with this."*
6. **Close — back to Dashboard, Baseline (9:00).** Restate the verdict and the ask.

---

## Screenshot-by-Screenshot Review of Existing UI

> Based on direct review of the implemented components (layout is authoritative from code).

**Masthead & nav (`CommandCenter.tsx`)** — *Strong.* Shield, OCFO identification, live
scenario indicator + risk badge. *Fixes:* host the global scenario switcher here (ISSUE 2);
add an "as-of" stamp; 8 horizontally-scrolling tabs is the upper limit — consider grouping
Methodology/Briefing as "Brief & Notes" later. Demo banner is too loud (ISSUE 15).

**Executive Dashboard (`ExecutiveDashboard.tsx`)** — *Functional but analyst-framed.* 9
equal tiles + 4 equal charts + insight panel at the bottom. *Fixes:* Decision Banner on top
(ISSUE 1), tier the tiles (ISSUE 3), reference lines (ISSUE 4), status words (ISSUE 5),
hiring/watchlist panel (ISSUE 10), suppress zero deltas on baseline (QW-5).

**Division Model (`DivisionModel.tsx`)** — *Good.* Clean card/table toggle, coverage meters,
grade-mix pills, enterprise totals. *Fixes:* lead with the staffing waterfall (ISSUE 7);
make cards clickable to a drill-down (HE-3); the table is dense — fine for analysts.

**Grade / Level Mix (`GradeMixPlanner.tsx`)** — *Strong.* Current→recommended chart, "mix at
a glance," and a rich table with mission impact and risk-if-unstaffed. Genuinely
decision-useful. *Fix:* the 8-column table is heavy for executives — consider a "summary /
detail" toggle, defer detail by default.

**Scenario Modeling (`ScenarioModeling.tsx`)** — *Best feature; under-visualized.* Five
prebuilt scenarios, six labeled sliders with hints, live metric grid with baseline compare.
*Fixes:* impact ribbon (ISSUE 8), a live mini-trend, stronger delta pills, A/B compare
(ISSUE 14), outcome-anchored slider tooltips.

**Budget Variance (`BudgetVariance.tsx`)** — *Strong.* Four KPI tiles, variance-by-division
and by-grade charts, a plain-English explanation panel, and a drivers list. Among the most
executive-ready screens. *Fix:* add the topline reference line to the org chart's mental
model; keep the prose panel — it's a model for the rest of the app.

**Mission Staffing Estimator (`MissionEstimator.tsx`)** — *Good.* Mission selector with
per-mission gap/cost, role-grade table, confidence pill, rationale. *Fixes:* visualize the
confidence driver; consider a small per-mission coverage bar in the selector (already has
%); otherwise solid.

**Briefing View (`BriefingView.tsx`)** — *Excellent and the demo's natural closer.* Posture
banner, top-5 staffing and budget risks, prioritized hiring actions, scenario tradeoff
table, generated talking points. *Fix:* add Print/Export (ISSUE 9); this view's prose voice
should be propagated app-wide (HE-4).

**Methodology (`Methodology.tsx`)** — *Strong for credibility.* Clear "what the model
combines," step-by-step projection, cost-assumption grid, production-deployment note.
*Fix:* keep deferred — reveal only when an analyst asks "how does this work?"

---

## Final Scores

| | Score |
|---|---|
| **Current UX (executive-comprehension weighted)** | **71 / 100** |
| Visual design & institutional credibility | 88 |
| Information architecture (nav, grouping) | 74 |
| Executive comprehension / answer-first framing | 58 |
| Demo effectiveness (live, narrative) | 66 |
| Insight & storytelling | 72 |
| **Projected UX after this backlog** | **91 / 100** |

**Path from 71 → 91:** the P0 set alone (Decision Banner, global scenario switcher, tiered
KPIs, reference lines, status words, legend) is projected to reach **~84**; the P1 set
(waterfall, impact ribbon, print brief, dashboard hiring/watchlist, gap shading,
housekeeping) carries it to **~91**. P2 items (count-up, guided mode, A/B compare) are
refinements beyond the core executive uplift.

---

*This audit evaluates user experience, visual communication, information architecture,
demo effectiveness, and executive comprehension only. All figures referenced are from the
application's synthetic demonstration data.*
