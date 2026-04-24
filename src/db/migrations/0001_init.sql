-- Esquema inicial para Evaluación Guías Mayores
-- Ejecutar con: psql $DATABASE_URL -f src/db/migrations/0001_init.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nombre TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aspirantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS aspirantes_owner_idx ON aspirantes(owner_id);

CREATE TABLE IF NOT EXISTS evaluaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aspirante_id UUID NOT NULL REFERENCES aspirantes(id) ON DELETE CASCADE,
  requisito_id TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  seleccionados JSONB DEFAULT '[]'::jsonb,
  motivo TEXT,
  comentario TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS evaluaciones_asp_req_unique
  ON evaluaciones(aspirante_id, requisito_id);
