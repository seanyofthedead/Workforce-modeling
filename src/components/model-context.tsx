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
import { ComputedModel, ScenarioParams } from "@/lib/types";

interface ModelContextValue {
  scenarioId: string;
  params: ScenarioParams;
  baselineModel: ComputedModel;
  model: ComputedModel;
  isCustom: boolean;
  selectScenario: (id: string) => void;
  setParam: (key: keyof ScenarioParams, value: number) => void;
  resetScenario: () => void;
}

const ModelContext = createContext<ModelContextValue | null>(null);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [params, setParams] = useState<ScenarioParams>({ ...SCENARIOS[0].params });
  const [isCustom, setIsCustom] = useState(false);

  const selectScenario = useCallback((id: string) => {
    const s = SCENARIOS.find((x) => x.id === id) ?? SCENARIOS[0];
    setScenarioId(s.id);
    setParams({ ...s.params });
    setIsCustom(false);
  }, []);

  const setParam = useCallback((key: keyof ScenarioParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    setIsCustom(true);
  }, []);

  const resetScenario = useCallback(() => {
    const s = SCENARIOS.find((x) => x.id === scenarioId) ?? SCENARIOS[0];
    setParams({ ...s.params });
    setIsCustom(false);
  }, [scenarioId]);

  const model = useMemo(() => computeModel(scenarioId, params), [scenarioId, params]);
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
      selectScenario,
      setParam,
      resetScenario,
    }),
    [scenarioId, params, baselineModel, model, isCustom, selectScenario, setParam, resetScenario]
  );

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}

export function useModel(): ModelContextValue {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error("useModel must be used within ModelProvider");
  return ctx;
}
