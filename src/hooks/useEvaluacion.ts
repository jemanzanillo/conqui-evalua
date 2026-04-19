import { useCallback, useEffect, useState } from "react";
import { storage, type EvaluacionAspirante, type EvaluacionRequisito } from "@/lib/storage";

export function useEvaluacion(aspiranteId: string) {
  const [evaluacion, setEvaluacion] = useState<EvaluacionAspirante>({});

  useEffect(() => {
    setEvaluacion(storage.getEvaluacion(aspiranteId));
  }, [aspiranteId]);

  const updateRequisito = useCallback(
    (reqId: string, patch: Partial<EvaluacionRequisito>) => {
      setEvaluacion((prev) => {
        const current = prev[reqId] ?? { estado: "pendiente" as const };
        const next = { ...prev, [reqId]: { ...current, ...patch } };
        storage.saveEvaluacion(aspiranteId, next);
        return next;
      });
    },
    [aspiranteId],
  );

  return { evaluacion, updateRequisito };
}
