# Plan: Add `README.md` for the repository

Create a single new file `README.md` at the repository root. Nothing else changes.

## Goals

- Give anyone landing on the repo a clear picture of what the app is, who it's for, and how to run it.
- Document the tech stack, project structure, environment variables, and deploy path (Vercel + Neon, already covered in `DEPLOY.md`).
- Capture the domain rules that already live in `contexto.txt` (3 evaluation phases, scoring, roles).

## Proposed sections

1. **Title & one-line pitch** — "Evaluación Guías Mayores: web app móvil-first para evaluar aspirantes a Guías Mayores en sesiones presenciales."
2. **Contexto** — short summary of the project's purpose (digitalizar el Excel de evaluación, Zona 5 GM 2026).
3. **Características principales**
   - Pool compartido de aspirantes entre todos los evaluadores.
   - 3 fases de evaluación (EVA-1 12 pts, EVA-2 15 pts, EVA-3 11 pts) con tarjetas de requisitos, sub-checkboxes para requisitos "X de Y", y formulario de Incompleto con motivo + comentario.
   - Semáforo de puntaje en vivo (rojo / amarillo / verde) en sticky footer basado en EVA-1.
   - Roles: `evaluador` y `admin` (Coordinador). Admin puede crear/eliminar evaluadores y editar overrides de requisitos desde `/admin`.
   - Vista de "observador" pública por token (`/observador/:token`) para compartir el progreso de un aspirante.
   - Historial completo por requisito (quién corrigió qué y cuándo).
4. **Tech stack**
   - TanStack Start v1 (React 19, Vite 7, SSR, server functions).
   - TanStack Router (file-based) + TanStack Query.
   - Tailwind CSS v4 + shadcn/ui (Radix primitives).
   - Drizzle ORM sobre Neon Postgres (`@neondatabase/serverless`).
   - Auth propia con `bcryptjs` + sesión cifrada en cookie httpOnly.
   - Despliegue: Cloudflare Workers (preview Lovable) o Vercel (producción).
5. **Estructura del proyecto** — árbol resumido:
   ```text
   src/
     routes/                rutas file-based (incluye _authenticated, _admin, observador)
     components/            UI (AspiranteCard, RequisitoCard, ScoreFooter, ...)
     server/                server functions (auth, aspirantes, evaluaciones, admin, observador)
     db/                    schema Drizzle + migraciones SQL
     data/requisitos.ts     definición de las 3 fases y requisitos
     hooks/, lib/           hooks de datos y utilidades (scoring, storage)
   scripts/                 utilidades one-off (reset de coordinador)
   ```
6. **Requisitos previos** — Bun (o npm), Node 20+, una base Neon Postgres.
7. **Setup local**
   - `bun install`
   - copiar `.env.example` → `.env` con `DATABASE_URL` y `SESSION_SECRET` (generar con `openssl rand -base64 48`).
   - aplicar esquema: `psql $DATABASE_URL -f src/db/migrations/0001_init.sql && psql $DATABASE_URL -f src/db/migrations/0002_admin_y_extras.sql` (o `bunx drizzle-kit push`).
   - `bun run dev` → http://localhost:3000.
8. **Variables de entorno**
   | Nombre | Descripción |
   |---|---|
   | `DATABASE_URL` | Cadena Postgres de Neon (`postgresql://...?sslmode=require`). |
   | `SESSION_SECRET` | Secreto ≥ 32 chars para firmar la cookie de sesión. |
9. **Cuentas y roles**
   - El registro público está deshabilitado.
   - El Coordinador (`admin`) crea cuentas de evaluador desde `/admin → Usuarios → Nuevo evaluador`.
   - Hay un script `scripts/reset-coordinador.ts` para resetear la contraseña del coordinador inicial.
10. **Scripts NPM** — `dev`, `build`, `build:dev`, `preview`, `lint`, `format`.
11. **Despliegue** — referencia corta a `DEPLOY.md` (Vercel + Neon, dominio propio, variables).
12. **Modelo de datos** — tabla resumen: `usuarios`, `aspirantes`, `evaluaciones`, `historial_evaluaciones`, `requisitos_overrides`. Una línea por tabla.
13. **Licencia / créditos** — uso interno Zona 5 GM 2026; sin licencia pública declarada.

## Notas

- No tocar código de la app, solo añadir `README.md`.
- Reusar texto literal de `contexto.txt` y `DEPLOY.md` donde aplique para no duplicar definiciones.
- Mantener el README en español (el resto del proyecto y la UI están en español).
