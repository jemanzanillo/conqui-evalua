# Concurso de Predicación — Conqui Evalúa

Web app móvil-first para que un panel de jueces califique en vivo un concurso de predicación de
Conquistadores. Reemplaza las hojas de calificación en papel con un flujo digital que muestra el
puntaje en vivo, bloquea calificaciones ya enviadas y publica un ranking en tiempo real.

> Variación de [gm-evalua](https://github.com/jemanzanillo/gm-evalua), reutilizando su base
> técnica para un caso de uso distinto.

---

## Características

- **Evento único**: no hay fases. Cada participante da un sermón y es calificado por todos los
  jueces conectados.
- **6 criterios de calificación** definidos en `src/data/criterios.ts`, total 100 pts por juez:
  - Mensaje y contenido — 25 pts
  - Aplicación — 15 pts
  - Dominio y manejo del tema — 30 pts
  - Originalidad del tema — 10 pts
  - Tiempo (6–8 min) — 10 pts
  - Participación — 10 pts
- **Sliders** de 0 al máximo por criterio, con un sticky footer que muestra el total en vivo (0-100).
- **Envío y bloqueo**: al enviar su calificación, el juez ya no puede editarla. El Coordinador
  puede reabrirla desde el panel de administración si hace falta corregir algo.
- **Privacidad entre jueces**: cada juez solo ve su propia calificación por participante
  (pendiente/enviada), nunca la de otros jueces ni el acumulado.
- **Roles**: `juez` y `admin` (Coordinador). El admin gestiona cuentas de jueces, participantes,
  reaperturas y el historial de envíos.
- **Resultados públicos en vivo** (`/resultados`, sin login): ranking por puntaje total (suma de
  todos los jueces que ya enviaron), con detalle expandible por criterio.

---

## Tech stack

- **TanStack Start v1** sobre React 19 y Vite 7 (SSR + server functions).
- **TanStack Router** (file-based) y **TanStack Query** para cache de datos.
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives).
- **Drizzle ORM** sobre **Neon Postgres** (`@neondatabase/serverless`).
- Auth propia con `bcryptjs` y sesión cifrada en cookie `httpOnly`.
- Despliegue: Cloudflare Workers (preview Lovable) o Vercel (producción) — ver `DEPLOY.md`.

---

## Estructura del proyecto

```text
src/
  routes/                rutas file-based (incluye _authenticated, _admin, resultados público)
  components/            UI (ParticipanteCard, CriterioCard, PuntajeFooter, ...)
  server/                server functions (auth, participantes, calificaciones, admin, resultados)
  db/                    schema Drizzle + migraciones SQL
  data/criterios.ts      los 6 criterios del concurso y sus puntajes máximos
  hooks/, lib/           hooks de datos y utilidades (scoring, storage)
```

---

## Requisitos previos

- **Bun** ≥ 1.1 (o npm/pnpm).
- **Node.js** ≥ 20.
- Una base **Postgres** (recomendado: [Neon](https://neon.tech), gratis).

---

## Setup local

```bash
# 1. Instalar dependencias
bun install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env: DATABASE_URL (Neon) y SESSION_SECRET (openssl rand -base64 48)

# 3. Aplicar el esquema
psql $DATABASE_URL -f src/db/migrations/0001_init.sql
# (o: bunx drizzle-kit push)

# 4. Crear la primera cuenta admin (Coordinador)
DATABASE_URL=$DATABASE_URL bun scripts/create-admin.ts coordinador@ejemplo.com "Mi Nombre" "ClaveSegura123"

# 5. Iniciar
bun run dev   # http://localhost:3000
```

Desde `/admin` (con la cuenta del Coordinador) puedes crear las cuentas de los jueces.

Para producción, ver `DEPLOY.md` (Vercel + Neon).

---

## Modelo de datos

| Tabla                      | Propósito                                                                 |
| -------------------------- | -------------------------------------------------------------------------- |
| `usuarios`                 | Cuentas (`juez` / `admin`) con hash bcrypt.                                |
| `participantes`            | Participantes del concurso (nombre, club, zona, orden de presentación).   |
| `calificaciones`           | Calificación actual de cada juez por participante (puntos por criterio, estado, fecha de envío). |
| `historial_calificaciones` | Bitácora de envíos y reaperturas, con autor y timestamp.                   |

Las definiciones viven en `src/db/schema.ts` y el SQL inicial en `src/db/migrations/0001_init.sql`.

---

## Cómo se calcula el ranking

- Cada juez califica de 0 al máximo en cada uno de los 6 criterios (suma máxima: 100 pts).
- Al enviar, esa calificación queda bloqueada para ese juez/participante.
- El **total general** de un participante es la suma de los totales de todos los jueces que ya
  enviaron su calificación. El ranking en `/resultados` ordena por ese total general.

---

## Créditos

Proyecto interno para el concurso de predicación de Conquistadores. Variación de gm-evalua. Sin
licencia pública declarada.
