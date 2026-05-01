# Evaluación Guías Mayores

Web app móvil-first para evaluar de forma presencial a aspirantes a Guías Mayores. Reemplaza el Excel y las hojas de cotejo en papel con un flujo digital que muestra puntaje en vivo, registra evidencias y mantiene un historial completo por requisito.

> Uso interno **Zona 5 GM 2026**.

- Preview: <https://id-preview--25e26c2c-e1b4-49bb-888e-4bf05cadc172.lovable.app>
- Producción: <https://gm-evalua.lovable.app>

---

## Características

- **Pool compartido de aspirantes**: cualquier evaluador autenticado ve y evalúa a cualquier aspirante. El campo "creado por" se conserva como auditoría.
- **3 fases de evaluación** definidas en `src/data/requisitos.ts`:
  - **EVA-1** — 12 pts (documentación, talleres, lecturas iniciales).
  - **EVA-2** — 15 pts (seminarios, especialidades obligatorias y opcionales, primeros auxilios).
  - **EVA-3** — 11 pts (servicio, enseñanza, especialidades de liderazgo, carpeta final).
- **Tarjetas de requisito** con estados Pendiente / Completado / Incompleto. Los requisitos del tipo "X de Y" muestran sub-checkboxes y se marcan completados automáticamente al alcanzar el mínimo.
- **Flujo de Incompleto** in-place: motivo de fallo (falta firma, contenido insuficiente, no cumple formato, …) + comentario libre.
- **Semáforo de puntaje en vivo** en sticky footer basado en EVA-1: 🔴 0–5, 🟡 6–8, 🟢 9–12.
- **Roles**: `evaluador` y `admin` (Coordinador). El admin gestiona usuarios y edita overrides de requisitos desde `/admin`.
- **Vista pública de observador** por token: `/observador/:token` permite compartir el progreso de un aspirante sin login.
- **Historial completo** por requisito: quién corrigió qué y cuándo (`historial_evaluaciones`).

---

## Tech stack

- **TanStack Start v1** sobre React 19 y Vite 7 (SSR + server functions).
- **TanStack Router** (file-based) y **TanStack Query** para cache de datos.
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives).
- **Drizzle ORM** sobre **Neon Postgres** (`@neondatabase/serverless`).
- Auth propia con `bcryptjs` y sesión cifrada en cookie `httpOnly`.
- Despliegue: Cloudflare Workers (preview Lovable) o Vercel (producción).

---

## Estructura del proyecto

```text
src/
  routes/                rutas file-based (incluye _authenticated, _admin, observador)
  components/            UI (AspiranteCard, RequisitoCard, ScoreFooter, ...)
  server/                server functions (auth, aspirantes, evaluaciones, admin, observador)
  db/                    schema Drizzle + migraciones SQL
  data/requisitos.ts     definición de las 3 fases y sus requisitos
  hooks/, lib/           hooks de datos y utilidades (scoring, storage)
scripts/                 utilidades one-off (p. ej. reset de coordinador)
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

# 2. Variables de entorno
cp .env.example .env   # crea el archivo si no existe
# Edita .env y completa DATABASE_URL y SESSION_SECRET
#   SESSION_SECRET: openssl rand -base64 48

# 3. Aplicar el esquema a la BD
psql "$DATABASE_URL" -f src/db/migrations/0001_init.sql
psql "$DATABASE_URL" -f src/db/migrations/0002_admin_y_extras.sql
# (alternativa) bunx drizzle-kit push

# 4. Levantar el dev server
bun run dev
```

La app queda en <http://localhost:3000>.

### Variables de entorno

| Nombre            | Descripción                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`    | Cadena Postgres de Neon (`postgresql://user:pass@host/db?sslmode=require`). |
| `SESSION_SECRET`  | Secreto ≥ 32 caracteres usado para firmar la cookie de sesión.           |

---

## Cuentas y roles

- El **registro público está deshabilitado**: el sistema es cerrado.
- El Coordinador (rol `admin`) crea cuentas de evaluador desde **`/admin → Usuarios → Nuevo evaluador`**.
- Para inicializar el primer admin, inserta una fila manual en `usuarios` con `rol = 'admin'` y un hash bcrypt, o usa el utilitario `scripts/reset-coordinador.ts` para resetear la contraseña del coordinador inicial:

  ```bash
  bun scripts/reset-coordinador.ts
  ```

---

## Scripts NPM

| Comando            | Acción                              |
| ------------------ | ----------------------------------- |
| `bun run dev`      | Dev server con HMR.                 |
| `bun run build`    | Build de producción.                |
| `bun run build:dev`| Build en modo development.          |
| `bun run preview`  | Sirve el build local.               |
| `bun run lint`     | ESLint sobre todo el repo.          |
| `bun run format`   | Prettier `--write`.                 |

---

## Despliegue

Guía completa en [`DEPLOY.md`](./DEPLOY.md). Resumen:

1. Crear base en Neon y copiar `DATABASE_URL`.
2. Importar el repo en Vercel (Framework: *Other*; Build: `bun run build`).
3. Configurar `DATABASE_URL` y `SESSION_SECRET` en *Environment Variables*.
4. Aplicar migraciones (`psql … -f src/db/migrations/*.sql` o `drizzle-kit push`).
5. Conectar dominio en *Settings → Domains*.

---

## Modelo de datos

| Tabla                    | Propósito                                                                |
| ------------------------ | ------------------------------------------------------------------------ |
| `usuarios`               | Cuentas (`evaluador` / `admin`) con hash bcrypt.                         |
| `aspirantes`             | Aspirantes evaluados (con `zona`, `club` y `share_token` público).       |
| `evaluaciones`           | Estado actual de cada requisito por aspirante (último resultado).        |
| `historial_evaluaciones` | Bitácora completa de cada cambio de estado, con autor y timestamp.       |
| `requisitos_overrides`   | Ediciones del admin sobre el catálogo base de requisitos del manual.     |

Las definiciones viven en `src/db/schema.ts` y los SQL iniciales en `src/db/migrations/`.

---

## Créditos

Proyecto interno para la evaluación de aspirantes a Guías Mayores, **Zona 5 — promoción 2026**. Sin licencia pública declarada.
