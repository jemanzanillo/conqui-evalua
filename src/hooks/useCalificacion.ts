import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCalificacion,
  submitCalificacion,
  updatePuntos,
} from "@/server/calificaciones.functions";
import type { Calificacion, Puntos } from "@/lib/storage";

export function useCalificacion(participanteId: string) {
  const qc = useQueryClient();
  const key = useMemo(
    () => ["calificacion", participanteId] as const,
    [participanteId],
  );

  const query = useQuery<Calificacion>({
    queryKey: key,
    queryFn: () => getCalificacion({ data: { participanteId } }),
    enabled: Boolean(participanteId),
  });

  const updateMut = useMutation({
    mutationFn: (puntos: Puntos) => updatePuntos({ data: { participanteId, puntos } }),
    onError: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });

  const submitMut = useMutation({
    mutationFn: () => submitCalificacion({ data: { participanteId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  // Debounce de la llamada al servidor para no saturarlo mientras se mueve el slider.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const setPuntos = useCallback(
    (criterioId: string, valor: number) => {
      const prev = qc.getQueryData<Calificacion>(key) ?? {
        puntos: {},
        estado: "pendiente" as const,
      };
      const next: Calificacion = {
        ...prev,
        puntos: { ...prev.puntos, [criterioId]: valor },
      };
      qc.setQueryData(key, next);

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        updateMut.mutate(next.puntos);
      }, 350);
    },
    [qc, key, updateMut],
  );

  return {
    calificacion: query.data ?? { puntos: {}, estado: "pendiente" as const },
    isLoading: query.isLoading,
    setPuntos,
    submit: () => submitMut.mutateAsync(),
    isSubmitting: submitMut.isPending,
    submitError: submitMut.error as Error | null,
  };
}
