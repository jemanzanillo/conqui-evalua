import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { and, asc, desc, eq, sql as sqlOp } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/db/client.server";
import { calificaciones, historialCalificaciones, participantes, usuarios } from "@/db/schema";
import { totalCalificacion } from "@/lib/scoring";
import { getSessionConfig, type SessionData } from "./session.server";
import type { Puntos } from "@/lib/storage";

async function requireAdminId(): Promise<string> {
  const session = await useSession<SessionData>(getSessionConfig());
  const userId = session.data.userId;
  if (!userId) throw new Error("UNAUTHORIZED");
  const [u] = await db
    .select({ rol: usuarios.rol })
    .from(usuarios)
    .where(eq(usuarios.id, userId))
    .limit(1);
  if (!u || u.rol !== "admin") throw new Error("FORBIDDEN");
  return userId;
}

export const listUsuarios = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminId();
  const rows = await db
    .select({
      id: usuarios.id,
      nombre: usuarios.nombre,
      email: usuarios.email,
      rol: usuarios.rol,
      createdAt: usuarios.createdAt,
      enviadas: sqlOp<number>`COUNT(${calificaciones.id}) FILTER (WHERE ${calificaciones.estado} = 'enviado')::int`,
    })
    .from(usuarios)
    .leftJoin(calificaciones, eq(calificaciones.juezId, usuarios.id))
    .groupBy(usuarios.id)
    .orderBy(usuarios.nombre);
  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));
});

const createJuezSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.string().email().max(255).toLowerCase(),
  password: z.string().min(8).max(200),
  rol: z.enum(["juez", "admin"]).default("juez"),
});

export const createJuez = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createJuezSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdminId();

    const [existing] = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(eq(usuarios.email, data.email))
      .limit(1);
    if (existing) {
      throw new Error("Ya existe una cuenta con ese correo.");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const [row] = await db
      .insert(usuarios)
      .values({
        email: data.email,
        passwordHash,
        nombre: data.nombre,
        rol: data.rol,
      })
      .returning({
        id: usuarios.id,
        email: usuarios.email,
        nombre: usuarios.nombre,
        rol: usuarios.rol,
      });
    return row;
  });

export const deleteUsuario = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const adminId = await requireAdminId();
    if (data.id === adminId) {
      throw new Error("No puedes eliminar tu propia cuenta.");
    }
    await db.delete(usuarios).where(eq(usuarios.id, data.id));
    return { ok: true };
  });

export type AdminCalificacion = {
  juezId: string;
  juezNombre: string | null;
  estado: "pendiente" | "enviado";
  submittedAt: string | null;
  total: number;
  puntos: Record<string, number>;
};

export type AdminParticipante = {
  id: string;
  nombre: string;
  club: string | null;
  zona: number | null;
  orden: number | null;
  totalGeneral: number;
  calificaciones: AdminCalificacion[];
};

// Vista completa para el Coordinador: todos los participantes con la
// calificación de cada juez (enviada o pendiente).
export const listCalificacionesAdmin = createServerFn({
  method: "GET",
}).handler(async (): Promise<AdminParticipante[]> => {
  await requireAdminId();

  const participantesRows = await db
    .select()
    .from(participantes)
    .orderBy(asc(participantes.orden), asc(participantes.nombre));

  const calRows = await db
    .select({
      participanteId: calificaciones.participanteId,
      juezId: calificaciones.juezId,
      juezNombre: usuarios.nombre,
      estado: calificaciones.estado,
      submittedAt: calificaciones.submittedAt,
      puntos: calificaciones.puntos,
    })
    .from(calificaciones)
    .leftJoin(usuarios, eq(calificaciones.juezId, usuarios.id));

  const porParticipante = new Map<string, AdminCalificacion[]>();
  for (const row of calRows) {
    const puntos = (row.puntos ?? {}) as Puntos;
    const entry: AdminCalificacion = {
      juezId: row.juezId,
      juezNombre: row.juezNombre,
      estado: row.estado as "pendiente" | "enviado",
      submittedAt: row.submittedAt ? row.submittedAt.toISOString() : null,
      total: totalCalificacion(puntos),
      puntos,
    };
    const list = porParticipante.get(row.participanteId) ?? [];
    list.push(entry);
    porParticipante.set(row.participanteId, list);
  }

  return participantesRows.map((p) => {
    const cals = porParticipante.get(p.id) ?? [];
    const totalGeneral = cals
      .filter((c) => c.estado === "enviado")
      .reduce((acc, c) => acc + c.total, 0);
    return {
      id: p.id,
      nombre: p.nombre,
      club: p.club,
      zona: p.zona,
      orden: p.orden,
      totalGeneral,
      calificaciones: cals,
    };
  });
});

const reabrirSchema = z.object({
  participanteId: z.string().uuid(),
  juezId: z.string().uuid(),
});

// Permite al Coordinador reabrir una calificación ya enviada para que el
// juez pueda corregirla.
export const reabrirCalificacion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => reabrirSchema.parse(input))
  .handler(async ({ data }) => {
    const adminId = await requireAdminId();

    const [current] = await db
      .select()
      .from(calificaciones)
      .where(
        and(
          eq(calificaciones.participanteId, data.participanteId),
          eq(calificaciones.juezId, data.juezId),
        ),
      )
      .limit(1);

    if (!current) throw new Error("No hay calificación para reabrir.");

    await db
      .update(calificaciones)
      .set({ estado: "pendiente", submittedAt: null, updatedAt: new Date() })
      .where(eq(calificaciones.id, current.id));

    await db.insert(historialCalificaciones).values({
      participanteId: data.participanteId,
      juezId: data.juezId,
      accion: "reabierto",
      puntos: (current.puntos ?? {}) as Puntos,
      actorId: adminId,
    });

    return { ok: true };
  });

const historialSchema = z
  .object({
    participanteId: z.string().uuid().optional(),
    limit: z.number().int().min(1).max(500).optional(),
  })
  .optional();

export const listHistorial = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => historialSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdminId();
    const limit = data?.limit ?? 200;

    const baseSelect = {
      id: historialCalificaciones.id,
      participanteId: historialCalificaciones.participanteId,
      participanteNombre: participantes.nombre,
      juezId: historialCalificaciones.juezId,
      juezNombre: usuarios.nombre,
      accion: historialCalificaciones.accion,
      puntos: historialCalificaciones.puntos,
      createdAt: historialCalificaciones.createdAt,
    };

    const rows = data?.participanteId
      ? await db
          .select(baseSelect)
          .from(historialCalificaciones)
          .leftJoin(usuarios, eq(historialCalificaciones.juezId, usuarios.id))
          .leftJoin(participantes, eq(historialCalificaciones.participanteId, participantes.id))
          .where(eq(historialCalificaciones.participanteId, data.participanteId))
          .orderBy(desc(historialCalificaciones.createdAt))
          .limit(limit)
      : await db
          .select(baseSelect)
          .from(historialCalificaciones)
          .leftJoin(usuarios, eq(historialCalificaciones.juezId, usuarios.id))
          .leftJoin(participantes, eq(historialCalificaciones.participanteId, participantes.id))
          .orderBy(desc(historialCalificaciones.createdAt))
          .limit(limit);

    return rows.map((r) => ({
      ...r,
      total: totalCalificacion((r.puntos ?? {}) as Puntos),
      createdAt: r.createdAt.toISOString(),
    }));
  });
