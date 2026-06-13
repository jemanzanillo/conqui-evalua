-- Esquema inicial para Concurso de Predicación (Conquistadores)
-- Ejecutar con: psql $DATABASE_URL -f src/db/migrations/0001_init.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'juez',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  club TEXT,
  zona INT,
  orden INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  juez_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  puntos JSONB DEFAULT '{}'::jsonb,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS calificaciones_participante_juez_unique
  ON calificaciones(participante_id, juez_id);

CREATE TABLE IF NOT EXISTS historial_calificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  juez_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  accion TEXT NOT NULL,
  puntos JSONB,
  actor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS historial_participante_idx
  ON historial_calificaciones(participante_id, created_at DESC);

CREATE INDEX IF NOT EXISTS historial_juez_idx
  ON historial_calificaciones(juez_id, created_at DESC);
