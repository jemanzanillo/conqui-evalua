import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client.server";
import { aspirantes, evaluaciones, usuarios } from "@/db/schema";
import type { Aspirante, EvaluacionAspirante, EvaluacionRequisito } from "@/lib/storage";

const tokenSchema = z.object({ token: z.string().uuid() });

export const getAspiranteByToken = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }): Promise<Aspirante | null> => {
    const [row] = await db
      .select()
      .from(aspirantes)
      .where(eq(aspirantes.shareToken, data.token))
      .limit(1);
    if (!row) return null;
    return {
      id: row.id,
      nombre: row.nombre,
      zona: row.zona,
      club: row.club,
      shareToken: row.shareToken,
      fechaCreacion: row.fechaCreacion.toISOString(),
    };
  });

export const getEvaluacionByToken = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }): Promise<EvaluacionAspirante> => {
    const [asp] = await db
      .select({ id: aspirantes.id })
      .from(aspirantes)
      .where(eq(aspirantes.shareToken, data.token))
      .limit(1);
    if (!asp) return {};

    const rows = await db
      .select({
        requisitoId: evaluaciones.requisitoId,
        estado: evaluaciones.estado,
        seleccionados: evaluaciones.seleccionados,
        motivo: evaluaciones.motivo,
        comentario: evaluaciones.comentario,
        updatedAt: evaluaciones.updatedAt,
        updatedByNombre: usuarios.nombre,
      })
      .from(evaluaciones)
      .leftJoin(usuarios, eq(evaluaciones.updatedBy, usuarios.id))
      .where(eq(evaluaciones.aspiranteId, asp.id));

    const out: EvaluacionAspirante = {};
    for (const r of rows) {
      out[r.requisitoId] = {
        estado: r.estado as EvaluacionRequisito["estado"],
        seleccionados: r.seleccionados ?? [],
        motivo: r.motivo ?? undefined,
        comentario: r.comentario ?? undefined,
        updatedAt: r.updatedAt.toISOString(),
        updatedByNombre: r.updatedByNombre,
      };
    }
    return out;
  });
