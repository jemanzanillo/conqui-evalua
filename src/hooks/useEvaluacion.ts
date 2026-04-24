import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEvaluacion,
  updateRequisito,
} from "@/server/evaluaciones.functions";
import type { EvaluacionAspirante, EvaluacionRequisito } from "@/lib/storage";

export function useEvaluacion(aspiranteId: string) {
  const qc = useQueryClient();
  const key = ["evaluacion", aspiranteId] as const;

  const query = useQuery<EvaluacionAspirante>({
    queryKey: key,
    queryFn: () => getEvaluacion({ data: { aspiranteId } }),
    enabled: Boolean(aspiranteId),
  });

  const mut = useMutation({
    mutationFn: (vars: {
      requisitoId: string;
      patch: Partial<EvaluacionRequisito>;
    }) =>
      updateRequisito({
        data: {
          aspiranteId,
          requisitoId: vars.requisitoId,
          estado: vars.patch.estado,
          seleccionados: vars.patch.seleccionados,
          motivo: vars.patch.motivo ?? null,
          comentario: vars.patch.comentario ?? null,
        },
      }),
    // Optimistic update
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<EvaluacionAspirante>(key) ?? {};
      const current = prev[vars.requisitoId] ?? { estado: "pendiente" as const };
      const next: EvaluacionAspirante = {
        ...prev,
        [vars.requisitoId]: { ...current, ...vars.patch },
      };
      qc.setQueryData(key, next);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
  });

  // Debounce per requisito para evitar saturar el servidor
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  const updateRequisitoFn = useCallback(
    (requisitoId: string, patch: Partial<EvaluacionRequisito>) => {
      // Aplicar inmediatamente al cache local (optimistic visible al instante)
      const prev = qc.getQueryData<EvaluacionAspirante>(key) ?? {};
      const current = prev[requisitoId] ?? { estado: "pendiente" as const };
      qc.setQueryData(key, {
        ...prev,
        [requisitoId]: { ...current, ...patch },
      });

      // Debounce de la llamada al servidor
      if (timers.current[requisitoId]) {
        clearTimeout(timers.current[requisitoId]);
      }
      timers.current[requisitoId] = setTimeout(() => {
        mut.mutate({ requisitoId, patch });
      }, 350);
    },
    [qc, key, mut],
  );

  return {
    evaluacion: query.data ?? {},
    isLoading: query.isLoading,
    updateRequisito: updateRequisitoFn,
  };
}
