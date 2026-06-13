import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db/client.server";
import { calificaciones, participantes } from "@/db/schema";
import { CRITERIOS } from "@/data/criterios";
import { totalCalificacion } from "@/lib/scoring";
import type { Puntos } from "@/lib/storage";

export type ResultadoParticipante = {
  id: string;
  nombre: string;
  club: string | null;
  zona: number | null;
  orden: number | null;
  /** Suma de los totales de cada juez que ya envió su calificación */
  totalGeneral: number;
  /** Cuántos jueces han enviado su calificación */
  juecesCalificaron: number;
  /** Suma por criterio entre todos los jueces que ya enviaron */
  porCriterio: Record<string, number>;
};

// Pública: no requiere sesión. Muestra el ranking en vivo del concurso.
export const listResultadosPublicos = createServerFn({ method: "GET" }).handler(
  async (): Promise<ResultadoParticipante[]> => {
    const participantesRows = await db.select().from(participantes);
    const calificacionesRows = await db
      .select()
      .from(calificaciones)
      .where(eq(calificaciones.estado, "enviado"));

    const porParticipante = new Map<string, (typeof calificacionesRows)[number][]>();
    for (const row of calificacionesRows) {
      const list = porParticipante.get(row.participanteId) ?? [];
      list.push(row);
      porParticipante.set(row.participanteId, list);
    }

    const resultados: ResultadoParticipante[] = participantesRows.map((p) => {
      const cals = porParticipante.get(p.id) ?? [];
      const porCriterio: Record<string, number> = {};
      for (const c of CRITERIOS) porCriterio[c.id] = 0;

      let totalGeneral = 0;
      for (const cal of cals) {
        const puntos = (cal.puntos ?? {}) as Puntos;
        totalGeneral += totalCalificacion(puntos);
        for (const c of CRITERIOS) {
          const v = puntos[c.id] ?? 0;
          porCriterio[c.id] += Math.min(Math.max(v, 0), c.puntosMax);
        }
      }

      return {
        id: p.id,
        nombre: p.nombre,
        club: p.club,
        zona: p.zona,
        orden: p.orden,
        totalGeneral,
        juecesCalificaron: cals.length,
        porCriterio,
      };
    });

    return resultados.sort((a, b) => {
      if (b.totalGeneral !== a.totalGeneral) return b.totalGeneral - a.totalGeneral;
      return a.nombre.localeCompare(b.nombre);
    });
  },
);
