import type { Puntos } from "./storage";
import { CRITERIOS, PUNTAJE_MAXIMO } from "@/data/criterios";

/**
 * Total de puntos otorgados por un juez para un participante,
 * acotando cada criterio a su puntaje máximo y a valores no negativos.
 */
export function totalCalificacion(puntos: Puntos): number {
  return CRITERIOS.reduce((acc, c) => {
    const v = puntos[c.id] ?? 0;
    const clamped = Math.min(Math.max(v, 0), c.puntosMax);
    return acc + clamped;
  }, 0);
}

export { PUNTAJE_MAXIMO };

export function porcentaje(obtenidos: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((obtenidos / total) * 100);
}
