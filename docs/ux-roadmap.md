# Workforce Modeling Command Center
## UX Improvement Roadmap

> Living document. Claude Code reads this first, updates it in place, and preserves
> completed-work history. Source analysis: `docs/UX_AUDIT.md`.
> Decision rule: prioritize **executive comprehension → demo clarity → storytelling →
> decision support → visual hierarchy** over technical elegance or new features.

**Success bar:** a DHS HQ OCFO executive can answer, in 30 seconds, without the presenter:
*Are we understaffed? Where? What will it cost? What should we do next? What happens under
different hiring scenarios?*

**Status legend:** `NOT STARTED` · `IN PROGRESS` · `COMPLETE`

_Last updated: 2026-06-09 (P0 complete; P1 complete)_

---

### P0 — Demo Critical
Must be complete before the next demo. These six items alone move the product from
analyst-framed to executive-ready (projected 71 → ~84/100).

#### P0-1 · Answer-first Decision Banner on the dashboard
- **Status:** COMPLETE
- **User Problem:** The dashboard opens on a 9-tile metric grid; the actual verdict (how
  staffed, over/under budget, which divisions at risk) is buried in an insight panel below
  the fold. Executives read top-down and never reach it unaided.
- **Proposed Enhancement:** A full-width banner at the very top stating staffing %, budget
  posture, and the two highest-risk divisions in one sentence, plus 3 hero stat blocks and
  the overall risk badge.
- **Expected Demo Impact:** The presenter's opening sentence is already on screen; the
  banner opens and closes every demo. Answers 4 of the 6 success questions instantly.
- **Estimated Effort:** Medium (M).

#### P0-2 · Global scenario switcher on every screen
- **Status:** COMPLETE
- **User Problem:** Changing the scenario — the most persuasive interaction in the product
  — requires navigating to a separate tab, so the hero dashboard never moves during the
  part of the demo where movement matters most.
- **Proposed Enhancement:** A segmented control of the five scenarios in the masthead
  sub-header, visible on all tabs, wired to the existing `selectScenario`.
- **Expected Demo Impact:** Flip a scenario and the entire app reacts live — the core "wow"
  moment. Directly serves "what happens under different hiring scenarios?"
- **Estimated Effort:** Medium (M).

#### P0-3 · Tier the dashboard KPIs (3 hero + secondary strip)
- **Status:** COMPLETE
- **User Problem:** Nine identically-sized KPI tiles give the eye no priority order;
  everything shouts, so nothing leads.
- **Proposed Enhancement:** Render Coverage, Cost-vs-Topline, and Risk as large hero tiles;
  demote the rest to a compact secondary strip.
- **Expected Demo Impact:** Eye lands on the three numbers that matter; reduces cognitive
  load on first impression.
- **Estimated Effort:** Small (S).

#### P0-4 · Reference lines on charts (topline, readiness threshold, gap)
- **Status:** COMPLETE
- **User Problem:** "Are we over budget?" and "is this division OK?" require mental
  arithmetic with no visual anchor.
- **Proposed Enhancement:** Planned-topline reference line on the cost-trend chart; target
  threshold line on the vacancy chart; shaded gap between demand and supply lines.
- **Expected Demo Impact:** "Over the line, in red" reads instantly across a boardroom.
- **Estimated Effort:** Small (S).

#### P0-5 · Status words on KPI tiles
- **Status:** COMPLETE
- **User Problem:** Tiles show raw values ("85%", "-$3.1M") that require interpretation.
- **Proposed Enhancement:** Optional plain-English status chip on each tile
  ("Understaffed", "Over topline", "Off track"), colored by tone.
- **Expected Demo Impact:** Self-explaining tiles; far less presenter narration needed.
- **Estimated Effort:** Small (S).

#### P0-6 · On-screen risk / criticality / staffing-noun legend
- **Status:** COMPLETE
- **User Problem:** Two badge taxonomies (Risk, Criticality) and five staffing nouns
  appear with no key; first-time viewers can't decode the color or vocabulary unaided.
- **Proposed Enhancement:** A compact, dismissible "How to read this" strip defining the
  risk levels, criticality levels, and the Authorized/Required/Onboard distinction.
- **Expected Demo Impact:** The screen teaches itself; eliminates "what does red mean?".
- **Estimated Effort:** Small (S).

---

### P1 — High Impact
Significantly improve executive understanding; carry the product from ~84 to ~91/100.
**All P1 items complete (2026-06-09).**

#### P1-1 · Staffing waterfall (reconcile onboard / authorized / required)
- **Status:** COMPLETE
- **User Problem:** Onboard, authorized, required, vacancies, and gap are scattered across
  separate tiles with no single reconciling picture.
- **Proposed Enhancement:** One stacked horizontal bar — Onboard → +Vacancies-to-Authorized
  → +Gap-to-Required — atop the Division Model and referenced on the dashboard.
- **Expected Demo Impact:** "Here's what we have, what's funded, what we need" in one glance.
- **Estimated Effort:** Medium (M).

#### P1-2 · Scenario impact ribbon (animated before→after)
- **Status:** COMPLETE
- **User Problem:** Scenario changes are read as static numbers, not seen as movement.
- **Proposed Enhancement:** A ribbon of before→after chips with directional arrows and
  red/green tone, animated on change, above the Scenario Outcomes grid.
- **Expected Demo Impact:** Cause-and-effect becomes a gesture; the slider demo lands harder.
- **Estimated Effort:** Medium (M).

#### P1-3 · Surface hiring actions & watchlist on the dashboard
- **Status:** COMPLETE
- **User Problem:** "What hiring actions are needed?" only exists on the Briefing tab.
- **Proposed Enhancement:** A condensed "Top hiring actions" + "Divisions to watch" panel
  on the dashboard, reusing Briefing logic.
- **Expected Demo Impact:** The dashboard answers all six executive questions without a tab
  change — directly serves "what should we do next?".
- **Estimated Effort:** Medium (M).

#### P1-4 · Demand-vs-supply gap shading
- **Status:** COMPLETE
- **User Problem:** The gap between required and filled lines — the actual story — is
  invisible between two lines.
- **Proposed Enhancement:** Tinted area between the lines where demand exceeds supply.
- **Expected Demo Impact:** The widening gap under a freeze reads instantly.
- **Estimated Effort:** Medium (M). *(May be delivered together with P0-4.)*

#### P1-5 · Export / Print Briefing one-pager
- **Status:** COMPLETE
- **User Problem:** No leave-behind artifact for leadership.
- **Proposed Enhancement:** "Print brief" button + print stylesheet hiding nav/banner.
- **Expected Demo Impact:** Confident closer; the meeting walks out with the brief.
- **Estimated Effort:** Medium (M).

#### P1-6 · Housekeeping — calmer demo banner, contrast, "as-of" stamp
- **Status:** COMPLETE
- **User Problem:** Amber banner dominates first attention; micro-labels are low-contrast;
  no time anchor on the data.
- **Proposed Enhancement:** Slim slate banner + "Demo data" pill; `slate-400`→`slate-600`
  labels; "Planning FY2026 · as of <date>" stamp in the masthead.
- **Expected Demo Impact:** Cleaner, calmer, more readable first impression.
- **Estimated Effort:** Small (S).

---

### P2 — Future Enhancements
Polish; not required for demo success.

#### P2-1 · KPI count-up transition on scenario change
- **Status:** NOT STARTED
- **User Problem:** Metric changes are abrupt; the eye doesn't track the swing.
- **Proposed Enhancement:** Animate KPI values over ≤400ms on change, respecting
  `prefers-reduced-motion`.
- **Expected Demo Impact:** Scenario swings feel alive and intentional.
- **Estimated Effort:** Small (S).

#### P2-2 · Guided demo / "Start here" mode
- **Status:** NOT STARTED
- **User Problem:** First-time and unattended viewers face a metric wall with no entry point.
- **Proposed Enhancement:** A 5-step coachmark tour following the demo narrative flow.
- **Expected Demo Impact:** Confident self-service; strong kiosk/booth mode.
- **Estimated Effort:** Large (L).

#### P2-3 · Scenario A/B compare view
- **Status:** NOT STARTED
- **User Problem:** Tradeoffs are a dense table; no visual side-by-side.
- **Proposed Enhancement:** Two-scenario picker rendering KPIs/charts side by side + deltas.
- **Expected Demo Impact:** Frames the central leadership choice explicitly.
- **Estimated Effort:** Large (L).

#### P2-4 · Division drill-down detail
- **Status:** NOT STARTED
- **User Problem:** Division cards are a roster, not an investigation.
- **Proposed Enhancement:** Clickable cards opening a focused panel (grade mix, vacancy
  trajectory, risk drivers, hiring sequence).
- **Expected Demo Impact:** Turns "where" into a deep, credible answer on demand.
- **Estimated Effort:** Large (L).

---

### Completed Enhancements
_Move items here as work finishes; preserve history._

- **P0-1 · Decision Banner** — _2026-06-09._ Added `DecisionBanner.tsx` rendered first on the
  Executive Dashboard: one-sentence verdict (staffing %, budget posture, top-2 risk
  divisions) + three hero stat blocks + overall risk badge. Answers 4 of 6 success
  questions above the fold.
- **P0-2 · Global scenario switcher** — _2026-06-09._ Added a segmented scenario control in
  the masthead sub-header (`CommandCenter.tsx`), visible on every tab and wired to
  `selectScenario`. The whole app now reacts live to scenario changes; "(adjusted)" shown
  when sliders diverge from a preset.
- **P0-3 · Tiered dashboard KPIs** — _2026-06-09._ `StatTile` gained a `size="hero"` variant;
  the dashboard now leads with three hero tiles (Coverage, Cost vs Topline, Risk Posture)
  above a compact secondary strip.
- **P0-4 · Chart reference lines** — _2026-06-09._ Planned-topline reference line on the cost
  trend, target threshold on the vacancy-by-division chart, and a shaded demand-supply gap
  (also satisfies P1-4).
- **P0-5 · Status words on tiles** — _2026-06-09._ `StatTile` gained an optional `statusWord`
  chip; hero and key tiles now carry plain-English verdicts ("Understaffed", "Over topline").
- **P0-6 · How-to-read legend** — _2026-06-09._ Added a dismissible `HowToRead` strip defining
  risk levels, criticality, and the Authorized/Required/Onboard distinction.
- **P1-1 · Staffing waterfall** — _2026-06-09._ New `StaffingWaterfall.tsx` (Onboard → funded
  vacancies → unfunded gap to requirement) leads the Division Model, reconciling the five
  staffing nouns in one bar.
- **P1-2 · Scenario impact ribbon** — _2026-06-09._ Added an "Impact vs. Baseline" ribbon to
  Scenario Modeling — four before→after chips (cost, coverage, variance, time-to-target) with
  directional arrows and red/green tone, animated on change.
- **P1-3 · Hiring actions & watchlist on dashboard** — _2026-06-09._ Added "Recommended Next
  Actions" + "Divisions to Watch" cards to the Executive Dashboard, backed by a shared
  `lib/selectors.ts` so the dashboard and Briefing tell an identical story. Closes the "what
  should we do next?" gap on the hero screen.
- **P1-4 · Demand-vs-supply gap shading** — _2026-06-09._ Delivered with P0-4; red coverage-gap
  band now fills the space between the demand and supply lines.
- **P1-5 · Print briefing one-pager** — _2026-06-09._ "Print brief" button on the Briefing View,
  print-only brief masthead, `print:hidden` on app chrome, and an `@media print` block for a
  clean leave-behind.
- **P1-6 · Housekeeping** — _2026-06-09._ Calmer slate demo banner with a "Demo data" pill,
  "Planning FY2026 · as of June 2026" stamp in the masthead, and `slate-400`→`slate-500`
  contrast bump on metric micro-labels.
