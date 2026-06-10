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
