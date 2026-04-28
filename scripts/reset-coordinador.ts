import { db } from "../src/db/client.server";
import { usuarios } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const hash = await bcrypt.hash("Graciaslovable", 10);
const res = await db
  .update(usuarios)
  .set({ passwordHash: hash })
  .where(eq(usuarios.email, "coordinador@local.com"))
  .returning({ id: usuarios.id, email: usuarios.email });
console.log("Reset:", res);
process.exit(0);
