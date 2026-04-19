import type { EvaluacionAspirante } from "./storage";
import type { FaseInfo, Requisito } from "@/data/requisitos";
import { FASES } from "@/data/requisitos";

export type SemaforoEstado = "rojo" | "amarillo" | "verde";

export function isCompletado(req: Requisito, ev?: EvaluacionAspirante[string]): boolean {
  if (!ev) return false;
  if (req.tipo === "seleccion") {
    const n = ev.seleccionados?.length ?? 0;
    return n >= req.min;
  }
  return ev.estado === "completado";
}

export function puntajeFase(fase: FaseInfo, ev: EvaluacionAspirante) {
  const obtenidos = fase.requisitos.reduce(
    (acc, r) => acc + (isCompletado(r, ev[r.id]) ? 1 : 0),
    0,
  );
  return { obtenidos, total: fase.totalPuntos };
}

export function semaforo(porcentaje: number): SemaforoEstado {
  if (porcentaje >= 67) return "verde";
  if (porcentaje >= 42) return "amarillo";
  return "rojo";
}

export function semaforoLabel(estado: SemaforoEstado): string {
  switch (estado) {
    case "verde":
      return "Excelente desempeño";
    case "amarillo":
      return "Aprobado por el mínimo";
    case "rojo":
      return "No aprobado";
  }
}

export function porcentaje(obtenidos: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((obtenidos / total) * 100);
}

export function puntajeTotal(ev: EvaluacionAspirante) {
  const obtenidos = FASES.reduce((acc, f) => acc + puntajeFase(f, ev).obtenidos, 0);
  const total = FASES.reduce((acc, f) => acc + f.totalPuntos, 0);
  return { obtenidos, total };
}
