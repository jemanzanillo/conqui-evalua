import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { FASES, type FaseInfo, type Requisito } from "@/data/requisitos";
import { listRequisitosOverridesPublic } from "@/server/admin.functions";
import type { RequisitoOverride } from "@/lib/storage";

function applyOverride(req: Requisito, ov?: RequisitoOverride): Requisito {
  if (!ov) return req;
  const merged: Requisito = {
    ...req,
    titulo: ov.titulo ?? req.titulo,
    descripcion: ov.descripcion ?? req.descripcion,
    guia: ov.guia ?? req.guia,
    evidencias: ov.evidencias ?? req.evidencias,
  };
  return merged;
}

export function useFasesConOverrides(): {
  fases: FaseInfo[];
  isLoading: boolean;
} {
  const { data: overrides = [], isLoading } = useQuery({
    queryKey: ["requisitos-overrides"],
    queryFn: () => listRequisitosOverridesPublic(),
    staleTime: 60 * 1000,
  });

  const map = useMemo(() => {
    const m = new Map<string, RequisitoOverride>();
    for (const o of overrides) m.set(o.requisitoId, o);
    return m;
  }, [overrides]);

  const fases = useMemo<FaseInfo[]>(() => {
    return FASES.map((f) => ({
      ...f,
      requisitos: f.requisitos.map((r) => applyOverride(r, map.get(r.id))),
    }));
  }, [map]);

  return { fases, isLoading };
}
