# Workforce Modeling Command Center
## Executive Insights Layer

> Companion to `docs/ux-roadmap.md`. Defines the *insight voice* the product should speak —
> what to surface, how to phrase it, and where raw numbers should become narrative. The
> goal: replace "here is a number" with "here is what it means and what to do."

---

## Insights the product should surface

These are the conclusions an OCFO executive actually needs. Each maps to data the engine
already computes (`src/lib/calc.ts`).

1. **Overall posture verdict** — staffing %, budget posture, and the top risk drivers in one
   sentence. *(Decision Banner — P0-1.)*
2. **Where the shortfall concentrates** — the two or three divisions carrying
   disproportionate, criticality-weighted risk.
3. **Cost vs topline, with direction** — over or under, by how much, and *why* (hiring pace
   vs pay vs demand).
4. **The trajectory** — whether attrition is winning (vacancies growing) or hiring is
   closing the gap, and by when.
5. **The recommended next action** — prioritized fills, sequenced by mission criticality.
6. **The scenario tradeoff** — what a freeze costs in readiness; what a surge costs in
   dollars; the explicit choice for leadership.

---

## Executive-level summaries (templates)

Phrasing should be specific, quantified, and consequence-oriented. Centralize these in a
future `src/lib/narrative.ts` (roadmap HE-4) so every panel speaks one voice.

- **Posture:** "OCFO is {coverage}% staffed to mission and {over/under} the personnel
  topline by {$variance}. Risk concentrates in {division A} and {division B}."
- **Trajectory:** "At the current pace, authorized vacancies {close in N months / never
  close — attrition outpaces hiring}."
- **Cost driver:** "Cost runs {±x%} against the topline, driven primarily by {hiring pace /
  compounding pay / mission demand}."
- **Action:** "Prioritize fills in {division A} and {division B}; sequence recruitment to
  protect mission-critical delivery first."
- **Scenario tradeoff:** "Accelerated Hiring lifts coverage to {x%} but adds {$y} annually —
  a readiness-vs-cost choice for leadership."

---

## Decision-support recommendations

The product should not just describe — it should recommend, while clearly labeling
recommendations as decision support, not direction.

- **If variance < 0 (over topline):** recommend either a topline adjustment, a deliberate
  slowdown in hiring pace, or sequencing fills toward the highest-criticality divisions.
- **If variance > +5% (under-execution):** recommend accelerating recruitment in critical
  divisions — idle topline is unconverted mission capacity.
- **If coverage < readiness threshold:** name the divisions dragging the weighted average
  and the FTE needed to clear the threshold.
- **If attrition outpaces hiring:** flag that the gap is structural, not transient, and a
  pace/attrition intervention is required.
- **High contractor reliance (Financial Systems, Internal Controls):** recommend conversion
  to federal FTE to lower recurring cost and conversion risk while deepening capability.

---

## Replace raw data with narrative insight (priority list)

| Location | Raw today | Insight replacement |
|----------|-----------|---------------------|
| Dashboard hero — Coverage | "85%" | "Understaffed — ~102 FTE short of requirement (≈2 mission teams)." |
| Dashboard hero — Variance | "-$3.1M" | "Over the personnel topline — hiring + pay outrun funding." |
| Dashboard — Projected EOY Vacancies | "140" | "Vacancies grow ~44% by FY2030 if pace holds — attrition is winning." |
| Dashboard — Hiring Plan Status | "Off track" | "At this pace, authorized vacancies never close — intervention required." |
| Dashboard — Risk Alerts | "6" | "6 active alerts — 2 critical divisions drive the workforce risk." |
| Vacancy chart | bars only | bars + target line + "above target" callout for the worst division. |
| Scenario metrics | "baseline $X" | signed, colored delta pill "▲ +$4.2M vs baseline". |

**Implemented so far:** Decision Banner (posture verdict) and status-word chips on hero
tiles deliver the top rows of this table. Remaining rows are tracked under roadmap P1/HE-4.

---

## Insight-writing principles
- **Lead with the verdict, then the number.** "Understaffed — 102 FTE short," not "85%."
- **Always attach a consequence or an action.** A number without a "so what" is analyst
  output, not executive support.
- **Quantify in human units.** "≈2 mission teams" beats "102 FTE" for a non-analyst.
- **Name names.** "Budget and Financial Systems," not "certain divisions."
- **State direction and timing.** Over/under, growing/closing, by when.
- **Label recommendations as decision support**, never as direction — preserve leadership
  judgment.
