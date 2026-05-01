import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client.server";
import {
  aspirantes,
  evaluaciones,
  historialEvaluaciones,
  usuarios,
} from "@/db/schema";
import { getSessionConfig, type SessionData } from "./session.server";
import type { EvaluacionAspirante, EvaluacionRequisito } from "@/lib/storage";

async function requireUserId(): Promise<string> {
  const session = await useSession<SessionData>(getSessionConfig());
  const userId = session.data.userId;
  if (!userId) throw new Error("UNAUTHORIZED");
  return userId;
}

async function assertAspiranteExists(aspiranteId: string) {
  const [row] = await db
    .select({ id: aspirantes.id })
    .from(aspirantes)
    .where(eq(aspirantes.id, aspiranteId))
    .limit(1);
  if (!row) throw new Error("NOT_FOUND");
}

const estadoEnum = z.enum(["pendiente", "completado", "incompleto"]);

export const getEvaluacion = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ aspiranteId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }): Promise<EvaluacionAspirante> => {
    await requireUserId();
    await assertAspiranteExists(data.aspiranteId);

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
      .where(eq(evaluaciones.aspiranteId, data.aspiranteId));

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

const updateSchema = z.object({
  aspiranteId: z.string().uuid(),
  requisitoId: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/),
  estado: estadoEnum.optional(),
  seleccionados: z.array(z.string().min(1).max(32)).max(50).optional(),
  motivo: z.string().max(120).nullable().optional(),
  comentario: z.string().max(2000).nullable().optional(),
});

export const updateRequisito = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await assertAspiranteExists(data.aspiranteId);

    const now = new Date();

    const insertValues = {
      aspiranteId: data.aspiranteId,
      requisitoId: data.requisitoId,
      estado: data.estado ?? "pendiente",
      seleccionados: data.seleccionados ?? [],
      motivo: data.motivo ?? null,
      comentario: data.comentario ?? null,
      updatedBy: userId,
      updatedAt: now,
    };

    const updateSet: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: userId,
    };
    if (data.estado !== undefined) updateSet.estado = data.estado;
    if (data.seleccionados !== undefined)
      updateSet.seleccionados = data.seleccionados;
    if (data.motivo !== undefined) updateSet.motivo = data.motivo;
    if (data.comentario !== undefined) updateSet.comentario = data.comentario;

    await db
      .insert(evaluaciones)
      .values(insertValues)
      .onConflictDoUpdate({
        target: [evaluaciones.aspiranteId, evaluaciones.requisitoId],
        set: updateSet,
      });

    // Leer estado actual final para registrarlo en historial
    const [current] = await db
      .select()
      .from(evaluaciones)
      .where(
        and(
          eq(evaluaciones.aspiranteId, data.aspiranteId),
          eq(evaluaciones.requisitoId, data.requisitoId),
        ),
      )
      .limit(1);

    if (current) {
      await db.insert(historialEvaluaciones).values({
        aspiranteId: data.aspiranteId,
        requisitoId: data.requisitoId,
        evaluadorId: userId,
        estado: current.estado,
        seleccionados: current.seleccionados ?? [],
        motivo: current.motivo,
        comentario: current.comentario,
      });
    }

    return { ok: true };
  });
