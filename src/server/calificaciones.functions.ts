import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client.server";
import { calificaciones, historialCalificaciones, participantes } from "@/db/schema";
import { CRITERIOS } from "@/data/criterios";
import { getSessionConfig, type SessionData } from "./session.server";
import type { Calificacion, Puntos } from "@/lib/storage";

async function requireUserId(): Promise<string> {
  const session = await useSession<SessionData>(getSessionConfig());
  const userId = session.data.userId;
  if (!userId) throw new Error("UNAUTHORIZED");
  return userId;
}

async function assertParticipanteExists(participanteId: string) {
  const [row] = await db
    .select({ id: participantes.id })
    .from(participantes)
    .where(eq(participantes.id, participanteId))
    .limit(1);
  if (!row) throw new Error("NOT_FOUND");
}

function toCalificacion(row: typeof calificaciones.$inferSelect): Calificacion {
  return {
    puntos: row.puntos ?? {},
    estado: row.estado as Calificacion["estado"],
    submittedAt: row.submittedAt ? row.submittedAt.toISOString() : null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

const maxPorCriterio = new Map(CRITERIOS.map((c) => [c.id, c.puntosMax]));

const puntosSchema = z.record(z.string(), z.number()).refine(
  (obj) =>
    Object.entries(obj).every(([id, val]) => {
      const max = maxPorCriterio.get(id);
      return max !== undefined && val >= 0 && val <= max;
    }),
  { message: "Puntos inválidos para alguno de los criterios" },
);

export const getCalificacion = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ participanteId: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<Calificacion> => {
    const userId = await requireUserId();
    await assertParticipanteExists(data.participanteId);

    const [row] = await db
      .select()
      .from(calificaciones)
      .where(
        and(
          eq(calificaciones.participanteId, data.participanteId),
          eq(calificaciones.juezId, userId),
        ),
      )
      .limit(1);

    if (!row) {
      return { puntos: {}, estado: "pendiente", submittedAt: null };
    }
    return toCalificacion(row);
  });

const updateSchema = z.object({
  participanteId: z.string().uuid(),
  puntos: puntosSchema,
});

export const updatePuntos = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await assertParticipanteExists(data.participanteId);

    const [current] = await db
      .select({ estado: calificaciones.estado })
      .from(calificaciones)
      .where(
        and(
          eq(calificaciones.participanteId, data.participanteId),
          eq(calificaciones.juezId, userId),
        ),
      )
      .limit(1);

    if (current?.estado === "enviado") {
      throw new Error(
        "Esta calificación ya fue enviada. Pide al Coordinador que la reabra para editarla.",
      );
    }

    const now = new Date();

    await db
      .insert(calificaciones)
      .values({
        participanteId: data.participanteId,
        juezId: userId,
        puntos: data.puntos as Puntos,
        estado: "pendiente",
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [calificaciones.participanteId, calificaciones.juezId],
        set: { puntos: data.puntos as Puntos, updatedAt: now },
      });

    return { ok: true };
  });

const submitSchema = z.object({ participanteId: z.string().uuid() });

export const submitCalificacion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await assertParticipanteExists(data.participanteId);

    const now = new Date();

    const [current] = await db
      .select()
      .from(calificaciones)
      .where(
        and(
          eq(calificaciones.participanteId, data.participanteId),
          eq(calificaciones.juezId, userId),
        ),
      )
      .limit(1);

    if (current?.estado === "enviado") {
      throw new Error("Esta calificación ya fue enviada.");
    }

    const puntos = current?.puntos ?? {};

    if (current) {
      await db
        .update(calificaciones)
        .set({ estado: "enviado", submittedAt: now, updatedAt: now })
        .where(eq(calificaciones.id, current.id));
    } else {
      await db.insert(calificaciones).values({
        participanteId: data.participanteId,
        juezId: userId,
        puntos: {} as Puntos,
        estado: "enviado",
        submittedAt: now,
        updatedAt: now,
      });
    }

    await db.insert(historialCalificaciones).values({
      participanteId: data.participanteId,
      juezId: userId,
      accion: "enviado",
      puntos: puntos as Puntos,
      actorId: userId,
    });

    return { ok: true };
  });
