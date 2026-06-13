// Crea (o actualiza) la primera cuenta admin (Coordinador).
// Como el registro público está deshabilitado, esta es la forma de arrancar
// el sistema: el admin luego crea las cuentas de los jueces desde /admin.
//
// Uso:
//   DATABASE_URL=... bun scripts/create-admin.ts coordinador@ejemplo.com "Mi Nombre" "ClaveSegura123"

import { db } from "../src/db/client.server";
import { usuarios } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const [email, nombre, password] = process.argv.slice(2);

if (!email || !nombre || !password) {
  console.error(
    'Uso: bun scripts/create-admin.ts <email> "<nombre>" "<password (mín. 8)>"',
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("La contraseña debe tener al menos 8 caracteres.");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);

const [existing] = await db
  .select({ id: usuarios.id })
  .from(usuarios)
  .where(eq(usuarios.email, email.toLowerCase()))
  .limit(1);

if (existing) {
  await db
    .update(usuarios)
    .set({ passwordHash, nombre, rol: "admin" })
    .where(eq(usuarios.id, existing.id));
  console.log(`Cuenta admin actualizada: ${email}`);
} else {
  await db.insert(usuarios).values({
    email: email.toLowerCase(),
    nombre,
    passwordHash,
    rol: "admin",
  });
  console.log(`Cuenta admin creada: ${email}`);
}

process.exit(0);
