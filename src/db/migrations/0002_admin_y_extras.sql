-- Migración 0002: rol admin, zona/club/share_token, historial, overrides
-- Idempotente (usa IF NOT EXISTS)

-- 1) Rol en usuarios
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS rol TEXT NOT NULL DEFAULT 'evaluador';

-- 2) Zona, club y token público de aspirante
ALTER TABLE aspirantes
  ADD COLUMN IF NOT EXISTS zona INT,
  ADD COLUMN IF NOT EXISTS club TEXT,
  ADD COLUMN IF NOT EXISTS share_token UUID NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS aspirantes_share_token_unique
  ON aspirantes(share_token);

-- 3) Autor de la última corrección por requisito
ALTER TABLE evaluaciones
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES usuarios(id) ON DELETE SET NULL;

-- 4) Historial completo de calificaciones
CREATE TABLE IF NOT EXISTS historial_evaluaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aspirante_id UUID NOT NULL REFERENCES aspirantes(id) ON DELETE CASCADE,
  requisito_id TEXT NOT NULL,
  evaluador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  estado TEXT NOT NULL,
  seleccionados JSONB DEFAULT '[]'::jsonb,
  motivo TEXT,
  comentario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS historial_aspirante_idx
  ON historial_evaluaciones(aspirante_id, created_at DESC);

CREATE INDEX IF NOT EXISTS historial_evaluador_idx
  ON historial_evaluaciones(evaluador_id, created_at DESC);

-- 5) Ediciones del admin sobre los requisitos (overrides del manual)
CREATE TABLE IF NOT EXISTS requisitos_overrides (
  requisito_id TEXT PRIMARY KEY,
  titulo TEXT,
  descripcion TEXT,
  guia TEXT,
  evidencias JSONB,
  updated_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
