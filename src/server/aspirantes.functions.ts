import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client.server";
import { aspirantes } from "@/db/schema";
import { getSessionConfig, type SessionData } from "./session.server";
import type { Aspirante } from "@/lib/storage";

async function requireUserId(): Promise<string> {
  const session = await useSession<SessionData>(getSessionConfig());
  const userId = session.data.userId;
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}

function toAspirante(row: typeof aspirantes.$inferSelect): Aspirante {
  return {
    id: row.id,
    nombre: row.nombre,
    zona: row.zona,
    club: row.club,
    shareToken: row.shareToken,
    fechaCreacion: row.fechaCreacion.toISOString(),
  };
}

// Pool compartido: todos los evaluadores autenticados ven todos los aspirantes.
export const listAspirantes = createServerFn({ method: "GET" }).handler(
  async (): Promise<Aspirante[]> => {
    await requireUserId();
    const rows = await db
      .select()
      .from(aspirantes)
      .orderBy(asc(aspirantes.nombre));
    return rows.map(toAspirante);
  },
);

export const getAspirante = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }): Promise<Aspirante | null> => {
    await requireUserId();
    const [row] = await db
      .select()
      .from(aspirantes)
      .where(eq(aspirantes.id, data.id))
      .limit(1);
    return row ? toAspirante(row) : null;
  });

export const addAspirante = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        nombre: z.string().trim().min(1).max(120),
        zona: z.number().int().min(1).max(11).nullable().optional(),
        club: z.string().trim().max(120).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<Aspirante> => {
    const userId = await requireUserId();
    const [row] = await db
      .insert(aspirantes)
      .values({
        ownerId: userId,
        nombre: data.nombre,
        zona: data.zona ?? null,
        club: data.club ?? null,
      })
      .returning();
    return toAspirante(row);
  });

export const removeAspirante = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireUserId();
    await db.delete(aspirantes).where(eq(aspirantes.id, data.id));
    return { ok: true };
  });
