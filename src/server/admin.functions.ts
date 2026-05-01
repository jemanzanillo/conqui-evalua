import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { desc, eq, sql as sqlOp } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/db/client.server";
import {
  aspirantes,
  historialEvaluaciones,
  requisitosOverrides,
  usuarios,
} from "@/db/schema";
import { getSessionConfig, type SessionData } from "./session.server";
import type { RequisitoOverride } from "@/lib/storage";

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

export const listUsuarios = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdminId();
    const rows = await db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        email: usuarios.email,
        rol: usuarios.rol,
        createdAt: usuarios.createdAt,
        aspirantesCount: sqlOp<number>`COUNT(${aspirantes.id})::int`,
      })
      .from(usuarios)
      .leftJoin(aspirantes, eq(aspirantes.ownerId, usuarios.id))
      .groupBy(usuarios.id)
      .orderBy(usuarios.nombre);
    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  },
);

export const listHistorial = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        aspiranteId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(500).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    await requireAdminId();
    const limit = data.limit ?? 200;

    const baseSelect = {
      id: historialEvaluaciones.id,
      aspiranteId: historialEvaluaciones.aspiranteId,
      aspiranteNombre: aspirantes.nombre,
      requisitoId: historialEvaluaciones.requisitoId,
      evaluadorId: historialEvaluaciones.evaluadorId,
      evaluadorNombre: usuarios.nombre,
      estado: historialEvaluaciones.estado,
      seleccionados: historialEvaluaciones.seleccionados,
      motivo: historialEvaluaciones.motivo,
      comentario: historialEvaluaciones.comentario,
      createdAt: historialEvaluaciones.createdAt,
    };

    const rows = data.aspiranteId
      ? await db
          .select(baseSelect)
          .from(historialEvaluaciones)
          .leftJoin(usuarios, eq(historialEvaluaciones.evaluadorId, usuarios.id))
          .leftJoin(aspirantes, eq(historialEvaluaciones.aspiranteId, aspirantes.id))
          .where(eq(historialEvaluaciones.aspiranteId, data.aspiranteId))
          .orderBy(desc(historialEvaluaciones.createdAt))
          .limit(limit)
      : await db
          .select(baseSelect)
          .from(historialEvaluaciones)
          .leftJoin(usuarios, eq(historialEvaluaciones.evaluadorId, usuarios.id))
          .leftJoin(aspirantes, eq(historialEvaluaciones.aspiranteId, aspirantes.id))
          .orderBy(desc(historialEvaluaciones.createdAt))
          .limit(limit);

    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  });

export const listAllAspirantes = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdminId();
    const rows = await db
      .select({
        id: aspirantes.id,
        nombre: aspirantes.nombre,
        zona: aspirantes.zona,
        club: aspirantes.club,
        ownerId: aspirantes.ownerId,
        ownerNombre: usuarios.nombre,
      })
      .from(aspirantes)
      .leftJoin(usuarios, eq(aspirantes.ownerId, usuarios.id))
      .orderBy(aspirantes.nombre);
    return rows;
  },
);

export const listRequisitosOverrides = createServerFn({ method: "GET" }).handler(
  async (): Promise<RequisitoOverride[]> => {
    await requireAdminId();
    const rows = await db.select().from(requisitosOverrides);
    return rows.map((r) => ({
      requisitoId: r.requisitoId,
      titulo: r.titulo,
      descripcion: r.descripcion,
      guia: r.guia,
      evidencias: r.evidencias ?? null,
    }));
  },
);

const overrideSchema = z.object({
  requisitoId: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/),
  titulo: z.string().max(300).nullable().optional(),
  descripcion: z.string().max(1000).nullable().optional(),
  guia: z.string().max(4000).nullable().optional(),
  evidencias: z.array(z.string().min(1).max(500)).max(30).nullable().optional(),
});

export const upsertRequisitoOverride = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => overrideSchema.parse(input))
  .handler(async ({ data }) => {
    const adminId = await requireAdminId();
    const now = new Date();

    const updateSet: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: adminId,
    };
    if (data.titulo !== undefined) updateSet.titulo = data.titulo;
    if (data.descripcion !== undefined) updateSet.descripcion = data.descripcion;
    if (data.guia !== undefined) updateSet.guia = data.guia;
    if (data.evidencias !== undefined) updateSet.evidencias = data.evidencias;

    await db
      .insert(requisitosOverrides)
      .values({
        requisitoId: data.requisitoId,
        titulo: data.titulo ?? null,
        descripcion: data.descripcion ?? null,
        guia: data.guia ?? null,
        evidencias: data.evidencias ?? null,
        updatedBy: adminId,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: requisitosOverrides.requisitoId,
        set: updateSet,
      });

    return { ok: true };
  });

// Pública (no admin) — la usan también evaluadores/observadores para ver el manual con overrides aplicados.
export const listRequisitosOverridesPublic = createServerFn({
  method: "GET",
}).handler(async (): Promise<RequisitoOverride[]> => {
  const rows = await db.select().from(requisitosOverrides);
  return rows.map((r) => ({
    requisitoId: r.requisitoId,
    titulo: r.titulo,
    descripcion: r.descripcion,
    guia: r.guia,
    evidencias: r.evidencias ?? null,
  }));
});

const createEvaluadorSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.string().email().max(255).toLowerCase(),
  password: z.string().min(8).max(200),
  rol: z.enum(["evaluador", "admin"]).default("evaluador"),
});

export const createEvaluador = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createEvaluadorSchema.parse(input))
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
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const adminId = await requireAdminId();
    if (data.id === adminId) {
      throw new Error("No puedes eliminar tu propia cuenta.");
    }
    await db.delete(usuarios).where(eq(usuarios.id, data.id));
    return { ok: true };
  });
