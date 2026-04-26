import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL);

const statements = [
  `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol TEXT NOT NULL DEFAULT 'evaluador'`,
  `ALTER TABLE aspirantes ADD COLUMN IF NOT EXISTS zona INT`,
  `ALTER TABLE aspirantes ADD COLUMN IF NOT EXISTS club TEXT`,
  `ALTER TABLE aspirantes ADD COLUMN IF NOT EXISTS share_token UUID NOT NULL DEFAULT gen_random_uuid()`,
  `CREATE UNIQUE INDEX IF NOT EXISTS aspirantes_share_token_unique ON aspirantes(share_token)`,
  `ALTER TABLE evaluaciones ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES usuarios(id) ON DELETE SET NULL`,
  `CREATE TABLE IF NOT EXISTS historial_evaluaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aspirante_id UUID NOT NULL REFERENCES aspirantes(id) ON DELETE CASCADE,
    requisito_id TEXT NOT NULL,
    evaluador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    estado TEXT NOT NULL,
    seleccionados JSONB DEFAULT '[]'::jsonb,
    motivo TEXT,
    comentario TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS historial_aspirante_idx ON historial_evaluaciones(aspirante_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS historial_evaluador_idx ON historial_evaluaciones(evaluador_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS requisitos_overrides (
    requisito_id TEXT PRIMARY KEY,
    titulo TEXT,
    descripcion TEXT,
    guia TEXT,
    evidencias JSONB,
    updated_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
];

for (const stmt of statements) {
  console.log("→", stmt.split("\n")[0].slice(0, 100));
  await sql.query(stmt);
}
console.log("Migración aplicada.");

const email = "coordinador@local";
const existing = await sql`SELECT id FROM usuarios WHERE email = ${email} LIMIT 1`;
if (existing.length === 0) {
  const hash = await bcrypt.hash("Graciaslovable", 10);
  await sql`
    INSERT INTO usuarios (email, password_hash, nombre, rol)
    VALUES (${email}, ${hash}, 'Coordinador', 'admin')
  `;
  console.log("Coordinador creado.");
} else {
  await sql`UPDATE usuarios SET rol = 'admin' WHERE email = ${email}`;
  console.log("Coordinador ya existía — rol asegurado.");
}
