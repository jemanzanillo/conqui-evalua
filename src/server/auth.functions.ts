import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/db/client.server";
import { usuarios } from "@/db/schema";
import { getSessionConfig, type SessionData } from "./session.server";
import type { Rol } from "@/lib/storage";

const signUpSchema = z.object({
  email: z.string().email().max(255).toLowerCase(),
  password: z.string().min(8).max(200),
  nombre: z.string().min(1).max(120),
});

const signInSchema = z.object({
  email: z.string().email().max(255).toLowerCase(),
  password: z.string().min(1).max(200),
});

export const signUp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => signUpSchema.parse(input))
  .handler(async ({ data }) => {
    const existing = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(eq(usuarios.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("Ya existe una cuenta con ese correo.");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const [user] = await db
      .insert(usuarios)
      .values({
        email: data.email,
        passwordHash,
        nombre: data.nombre,
        rol: "evaluador",
      })
      .returning({
        id: usuarios.id,
        email: usuarios.email,
        nombre: usuarios.nombre,
        rol: usuarios.rol,
      });

    const session = await useSession<SessionData>(getSessionConfig());
    await session.update({ userId: user.id });

    return { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol as Rol };
  });

export const signIn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => signInSchema.parse(input))
  .handler(async ({ data }) => {
    const [user] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, data.email))
      .limit(1);

    if (!user) {
      throw new Error("Correo o contraseña incorrectos.");
    }

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) {
      throw new Error("Correo o contraseña incorrectos.");
    }

    const session = await useSession<SessionData>(getSessionConfig());
    await session.update({ userId: user.id });

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: (user.rol ?? "evaluador") as Rol,
    };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<SessionData>(getSessionConfig());
  await session.clear();
  return { ok: true };
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useSession<SessionData>(getSessionConfig());
    const userId = session.data.userId;
    if (!userId) return null;

    const [user] = await db
      .select({
        id: usuarios.id,
        email: usuarios.email,
        nombre: usuarios.nombre,
        rol: usuarios.rol,
      })
      .from(usuarios)
      .where(eq(usuarios.id, userId))
      .limit(1);

    if (!user) return null;
    return { ...user, rol: (user.rol ?? "evaluador") as Rol };
  },
);
