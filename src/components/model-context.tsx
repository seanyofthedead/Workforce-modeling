"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from "react";
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

interface ModelContextValue {
  scenarioId: string;
  params: ScenarioParams;
  baselineModel: ComputedModel;
  model: ComputedModel;
  isCustom: boolean;
  overrides: DivisionOverrides;
  customizedDivisionIds: string[];
  setDivisionParam: (divId: string, key: DivisionLever, value: number) => void;
  resetDivisionParam: (divId: string, key: DivisionLever) => void;
  resetDivision: (divId: string) => void;
  resetAllDivisions: () => void;
  selectScenario: (id: string) => void;
  setParam: (key: keyof ScenarioParams, value: number) => void;
  resetScenario: () => void;
}

const ModelContext = createContext<ModelContextValue | null>(null);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [params, setParams] = useState<ScenarioParams>({ ...SCENARIOS[0].params });
  const [isCustom, setIsCustom] = useState(false);
  const [overrides, setOverrides] = useState<DivisionOverrides>({});

  const selectScenario = useCallback((id: string) => {
    const s = SCENARIOS.find((x) => x.id === id) ?? SCENARIOS[0];
    setScenarioId(s.id);
    setParams({ ...s.params });
    setIsCustom(false);
    setOverrides({});
  }, []);

  const setParam = useCallback((key: keyof ScenarioParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    setIsCustom(true);
  }, []);

  const resetScenario = useCallback(() => {
    const s = SCENARIOS.find((x) => x.id === scenarioId) ?? SCENARIOS[0];
    setParams({ ...s.params });
    setIsCustom(false);
    setOverrides({});
  }, [scenarioId]);

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

  const model = useMemo(
    () => computeModel(scenarioId, params, overrides),
    [scenarioId, params, overrides]
  );
  const baselineModel = useMemo(
    () => computeModel(SCENARIOS[0].id, SCENARIOS[0].params),
    []
  );

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

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}

export function useModel(): ModelContextValue {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error("useModel must be used within ModelProvider");
  return ctx;
}
