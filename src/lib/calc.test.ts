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
