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

// El registro público está deshabilitado: el concurso es un sistema cerrado.
// Las cuentas de jueces las crea el Coordinador desde el panel de
// administración. Mantenemos la firma para no romper imports y devolvemos
// un mensaje genérico que no revela el estado del correo.
export const signUp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => signUpSchema.parse(input))
  .handler(async (_ctx) => {
    throw new Error("El registro está deshabilitado. Solicita una cuenta al Coordinador.");
  });

export const signIn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => signInSchema.parse(input))
  .handler(async ({ data }) => {
    const [user] = await db.select().from(usuarios).where(eq(usuarios.email, data.email)).limit(1);

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
      rol: (user.rol ?? "juez") as Rol,
    };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<SessionData>(getSessionConfig());
  await session.clear();
  return { ok: true };
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<SessionData>(getSessionConfig());
  const userId = session.data.userId;
  // TEMP DEBUG — remove once login is confirmed working
  console.log("[getCurrentUser] session userId:", userId ?? "(none)");
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
  return { ...user, rol: (user.rol ?? "juez") as Rol };
});
