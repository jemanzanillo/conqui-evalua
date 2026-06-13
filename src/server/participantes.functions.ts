import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client.server";
import { participantes, usuarios } from "@/db/schema";
import { getSessionConfig, type SessionData } from "./session.server";
import type { Participante } from "@/lib/storage";

async function requireUserId(): Promise<string> {
  const session = await useSession<SessionData>(getSessionConfig());
  const userId = session.data.userId;
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}

async function requireAdminId(): Promise<string> {
  const userId = await requireUserId();
  const [u] = await db
    .select({ rol: usuarios.rol })
    .from(usuarios)
    .where(eq(usuarios.id, userId))
    .limit(1);
  if (!u || u.rol !== "admin") throw new Error("FORBIDDEN");
  return userId;
}

function toParticipante(row: typeof participantes.$inferSelect): Participante {
  return {
    id: row.id,
    nombre: row.nombre,
    club: row.club,
    zona: row.zona,
    orden: row.orden,
    createdAt: row.createdAt.toISOString(),
  };
}

// Lista compartida: todos los jueces autenticados ven a todos los participantes.
export const listParticipantes = createServerFn({ method: "GET" }).handler(
  async (): Promise<Participante[]> => {
    await requireUserId();
    const rows = await db
      .select()
      .from(participantes)
      .orderBy(asc(participantes.orden), asc(participantes.nombre));
    return rows.map(toParticipante);
  },
);

export const getParticipante = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<Participante | null> => {
    await requireUserId();
    const [row] = await db
      .select()
      .from(participantes)
      .where(eq(participantes.id, data.id))
      .limit(1);
    return row ? toParticipante(row) : null;
  });

export const addParticipante = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        nombre: z.string().trim().min(1).max(120),
        club: z.string().trim().max(120).nullable().optional(),
        zona: z.number().int().min(1).max(11).nullable().optional(),
        orden: z.number().int().min(1).max(999).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<Participante> => {
    await requireAdminId();
    const [row] = await db
      .insert(participantes)
      .values({
        nombre: data.nombre,
        club: data.club ?? null,
        zona: data.zona ?? null,
        orden: data.orden ?? null,
      })
      .returning();
    return toParticipante(row);
  });

export const updateParticipante = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        nombre: z.string().trim().min(1).max(120).optional(),
        club: z.string().trim().max(120).nullable().optional(),
        zona: z.number().int().min(1).max(11).nullable().optional(),
        orden: z.number().int().min(1).max(999).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<Participante> => {
    await requireAdminId();
    const updateSet: Record<string, unknown> = {};
    if (data.nombre !== undefined) updateSet.nombre = data.nombre;
    if (data.club !== undefined) updateSet.club = data.club;
    if (data.zona !== undefined) updateSet.zona = data.zona;
    if (data.orden !== undefined) updateSet.orden = data.orden;

    const [row] = await db
      .update(participantes)
      .set(updateSet)
      .where(eq(participantes.id, data.id))
      .returning();
    return toParticipante(row);
  });

export const removeParticipante = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdminId();
    await db.delete(participantes).where(eq(participantes.id, data.id));
    return { ok: true };
  });
