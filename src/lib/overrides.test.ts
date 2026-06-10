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
