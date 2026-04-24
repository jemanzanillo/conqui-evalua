import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client.server";
import { aspirantes, evaluaciones } from "@/db/schema";
import { getSessionConfig, type SessionData } from "./session.server";
import type { EvaluacionAspirante, EvaluacionRequisito } from "@/lib/storage";

async function requireUserId(): Promise<string> {
  const session = await useSession<SessionData>(getSessionConfig());
  const userId = session.data.userId;
  if (!userId) throw new Error("UNAUTHORIZED");
  return userId;
}

async function assertOwnership(aspiranteId: string, userId: string) {
  const [row] = await db
    .select({ id: aspirantes.id })
    .from(aspirantes)
    .where(and(eq(aspirantes.id, aspiranteId), eq(aspirantes.ownerId, userId)))
    .limit(1);
  if (!row) throw new Error("NOT_FOUND");
}

const estadoEnum = z.enum(["pendiente", "completado", "incompleto"]);

export const getEvaluacion = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ aspiranteId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }): Promise<EvaluacionAspirante> => {
    const userId = await requireUserId();
    await assertOwnership(data.aspiranteId, userId);

    const rows = await db
      .select()
      .from(evaluaciones)
      .where(eq(evaluaciones.aspiranteId, data.aspiranteId));

    const out: EvaluacionAspirante = {};
    for (const r of rows) {
      out[r.requisitoId] = {
        estado: r.estado as EvaluacionRequisito["estado"],
        seleccionados: r.seleccionados ?? [],
        motivo: r.motivo ?? undefined,
        comentario: r.comentario ?? undefined,
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
    await assertOwnership(data.aspiranteId, userId);

    const insertValues = {
      aspiranteId: data.aspiranteId,
      requisitoId: data.requisitoId,
      estado: data.estado ?? "pendiente",
      seleccionados: data.seleccionados ?? [],
      motivo: data.motivo ?? null,
      comentario: data.comentario ?? null,
      updatedAt: new Date(),
    };

    const updateSet: Record<string, unknown> = { updatedAt: new Date() };
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

    return { ok: true, ts: sql`now()` };
  });
