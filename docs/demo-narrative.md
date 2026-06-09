# Workforce Modeling Command Center
## Demo Narrative & Presenter Guide

> Companion to `docs/ux-roadmap.md`. The flow assumes the P0 enhancements (Decision
> Banner, global scenario switcher, tiered KPIs, reference lines, status words, legend).
> Target: a 10-minute leadership demo that lets the screen carry the story.

---

## Key messages (say these, in this order)
1. **"We can see our workforce posture at a glance."** OCFO's staffing, cost, and risk in
   one verdict — no spreadsheet archaeology.
2. **"We can model decisions live."** Any hiring, attrition, pay, or budget assumption,
   re-computed across every division and fiscal year instantly.
3. **"We can see the consequences before we commit."** A hiring freeze, a surge, a budget
   cut — each shows its cost in readiness and dollars before a decision is made.
4. **"We know exactly what to do next."** Prioritized hiring actions, concentrated where
   mission risk is highest.
5. **"This supports judgment; it doesn't replace it."** Transparent, explainable model;
   synthetic data in the demo, authoritative systems in production.

---

## Recommended demo flow (10 minutes)

### Screen order
1. Executive Dashboard — Baseline
2. Executive Dashboard — Hiring Freeze (switch scenario, stay on screen)
3. Scenario Modeling — live sliders
4. Division Model — staffing waterfall + risk concentration
5. Briefing View — actions, talking points, print brief
6. Executive Dashboard — Baseline (close on the verdict)

### Click path & talking points

**1 · Dashboard, Baseline (0:00–1:30)**
- *Open with the Decision Banner, read it verbatim.* "OCFO is operating at ~85% of mission
  requirement, running just over the personnel topline, with risk concentrated in two
  critical divisions — Budget and Financial Systems."
- Point at the three hero tiles: Coverage, Cost vs Topline, Risk Posture.
- **Key message:** posture at a glance.

**2 · Switch to Hiring Freeze — stay on the dashboard (1:30–3:30)**
- Use the global scenario switcher in the header. *Do not change tabs.*
- "Here's the cost of inaction. Watch coverage fall and the demand-supply gap widen."
- Point at the shaded gap on the FTE chart and the cost line relative to the topline.
- **Key message:** consequences are visible before we commit.

**3 · Scenario Modeling (3:30–5:30)**
- Drag **Hiring Pace** up; narrate the impact ribbon and the live metric grid.
- Drag **Attrition** up to show the inverse. "Leadership can dial any lever and the whole
  model re-computes."
- **Key message:** decisions modeled live.

**4 · Division Model (5:30–7:00)**
- Lead with the staffing waterfall: onboard → funded vacancies → gap to requirement.
- Point at the two red (Severe/Elevated) divisions. "The risk isn't spread evenly; it's
  concentrated — which is exactly where we should act first."
- **Key message:** where we are understaffed.

**5 · Briefing View (7:00–9:00)**
- Top-5 staffing risks, prioritized hiring actions, generated talking points.
- Click **Print brief.** "This is the leave-behind for the principal."
- **Key message:** what to do next.

**6 · Close — Dashboard, Baseline (9:00–10:00)**
- Return to the opening verdict. Restate the ask (topline adjustment, hiring sequencing,
  or contractor conversion — whichever the meeting is about).
- **Key message:** supports judgment; production-ready approach.

---

## Potential audience questions & suggested responses

**"Is this real data?"**
> No — this demo runs on synthetic, internally-consistent data. In production it draws from
> authoritative systems of record (HR/personnel, position management, payroll, budget
> formulation and execution) under proper ATO and data governance. The methodology is
> identical; only the data source changes. (See the Methodology tab.)

**"How is mission coverage calculated?"**
> It's the criticality-weighted ratio of onboard strength to mission-required staffing —
> so a gap in a Critical division counts more than the same gap in a Moderate one. The full
> formula is transparent on the Methodology tab; nothing is a black box.

**"Where do the cost numbers come from?"**
> Fully-burdened (loaded) annual cost per grade — salary, benefits, and overhead — rolled
> up by grade mix per division, compounded by the pay-raise assumption. In production these
> are calibrated to enacted pay tables and locality rates.

**"What's the difference between authorized, required, and onboard?"**
> *Onboard* is who we have today. *Authorized* is funded position ceilings. *Required* is
> what the mission needs — which can exceed authorized. The staffing waterfall on the
> Division Model shows all three reconciled in one bar.

**"Why is this division flagged when its vacancy rate looks moderate?"**
> Risk blends four things: coverage shortfall, vacancy pressure, mission criticality, and
> projected erosion from attrition outpacing hiring. A Critical division with rising
> attrition can outrank a higher-vacancy but stable Moderate one.

**"Can we model a specific congressional or budget scenario?"**
> Yes — the six levers (attrition, pay, hiring pace, contractor conversion, budget delta,
> mission demand) compose any scenario. We can also pre-stage a named what-if before a
> meeting.

**"What would it take to deploy this?"**
> Connect the authoritative data sources, calibrate cost and attrition to actuals, and
> source mission demand from programming guidance. The modeling approach is unchanged. It's
> a decision-support layer, not a system of record.

**"How current is this?"**
> The masthead carries the planning year and an as-of stamp. In production it refreshes on
> the cadence of its source systems.

---

## Presenter do / don't
- **Do** open and close on the Decision Banner verdict.
- **Do** switch scenarios *without leaving the dashboard* at least once.
- **Do** let the screen answer — pause after the banner before narrating.
- **Don't** open on the Methodology or full data tables; reveal those only on question.
- **Don't** dwell on individual tiles before the verdict has landed.
- **Don't** apologize for synthetic data — frame it as the demonstration design.
