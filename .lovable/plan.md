
# Plan: Migración a Vercel + Neon Postgres + Login por evaluador

## Resumen

Reemplazar `localStorage` por **Neon Postgres** (vía driver serverless), añadir **login por evaluador** (email + password con sesiones encriptadas en cookie), y reconfigurar el proyecto para desplegar en **Vercel** en lugar de Cloudflare Workers. Yo preparo el código y la documentación. Tú ejecutas el deploy y conectas el dominio.

---

## Parte 1 — Cambios de código (lo hago yo)

### 1.1 Cambiar el adapter de TanStack Start a Vercel

- Eliminar `wrangler.jsonc`.
- Actualizar `vite.config.ts` para usar el preset `vercel` del plugin de TanStack Start.
- Añadir `vercel.json` mínimo si hace falta para rutas/runtime.
- Añadir `.nvmrc` con la versión de Node soportada por Vercel.

### 1.2 Capa de base de datos con Neon

- Instalar `@neondatabase/serverless` y `drizzle-orm` (driver HTTP serverless, compatible con edge/Node y rápido en Vercel).
- Crear `src/db/client.server.ts` que lee `DATABASE_URL` desde `process.env` y exporta el cliente Drizzle.
- Crear `src/db/schema.ts` con las tablas:
  - `usuarios` (id uuid, email único, password_hash, nombre, created_at)
  - `aspirantes` (id uuid, owner_id → usuarios.id, nombre, fecha_creacion)
  - `evaluaciones` (id uuid, aspirante_id, requisito_id, estado, seleccionados jsonb, motivo, comentario, updated_at; unique (aspirante_id, requisito_id))
  - `sesiones` (opcional si no usamos cookie session) — usaremos cookie session de TanStack, así que esta tabla no se crea.
- Crear `drizzle.config.ts` y un script `bun run db:push` para sincronizar el schema contra Neon.
- Crear `src/db/migrations/0001_init.sql` como fallback ejecutable por psql si prefieres no usar drizzle-kit.

### 1.3 Autenticación

- Añadir librería `@node-rs/argon2` (o `bcryptjs` si argon no compila para Vercel) para hashing.
- Sesiones con `useSession` de `@tanstack/react-start/server` (cookie encriptada httpOnly, secure, sameSite=lax). Requiere secret `SESSION_SECRET`.
- Server functions:
  - `signUp({ email, password, nombre })` → crea usuario, hashea password, inicia sesión.
  - `signIn({ email, password })` → valida y crea sesión.
  - `signOut()` → limpia cookie.
  - `getCurrentUser()` → lee sesión, devuelve usuario o null.
- Sin recuperación de password en v1 (lo dejamos como nota para v2; requiere proveedor de email tipo Resend).

### 1.4 Rutas y guard

- Crear `src/routes/login.tsx` (signin + signup en pestañas, mobile-first, mismos tokens visuales).
- Crear pathless layout `src/routes/_authenticated.tsx` con `beforeLoad` que redirige a `/login` si no hay sesión.
- Mover `src/routes/index.tsx` y `src/routes/aspirante.$id.tsx` a:
  - `src/routes/_authenticated/index.tsx`
  - `src/routes/_authenticated/aspirante.$id.tsx`
- Añadir botón de logout en el header del dashboard mostrando el nombre del evaluador.

### 1.5 Migrar la lógica de storage

- Reescribir `src/lib/storage.ts` para que sea solo tipos compartidos (los tipos `Aspirante`, `EvaluacionAspirante`, `EvaluacionRequisito`, `EstadoRequisito` se mantienen).
- Crear `src/server/aspirantes.functions.ts` con server functions:
  - `listAspirantes()` → solo del usuario autenticado.
  - `addAspirante(nombre)` → asocia al usuario.
  - `removeAspirante(id)` → valida ownership.
  - `getAspirante(id)` → valida ownership.
- Crear `src/server/evaluaciones.functions.ts`:
  - `getEvaluacion(aspiranteId)` → devuelve mapa requisitoId → datos.
  - `updateRequisito(aspiranteId, requisitoId, patch)` → upsert en `evaluaciones`.
- Reescribir `src/hooks/useAspirantes.ts` y `src/hooks/useEvaluacion.ts` con `useQuery`/`useMutation` de TanStack Query (ya está en el proyecto).
- Mantener auto-guardado: cada cambio en `RequisitoCard` dispara mutation con debounce de 400ms.

### 1.6 Setup de TanStack Query

- Crear QueryClient en `src/router.tsx` dentro de `getRouter` (no a nivel módulo).
- Pasar por context y envolver `<QueryClientProvider>` en `__root.tsx`.

### 1.7 Variables de entorno

Documentar y dejar `.env.example`:

```
DATABASE_URL=postgresql://...neon.tech/...?sslmode=require
SESSION_SECRET=<32+ chars random>
```

`DATABASE_URL` y `SESSION_SECRET` se configuran en Vercel → Settings → Environment Variables. Nada con prefijo `VITE_` (todo es server-side).

---

## Parte 2 — Pasos que tú ejecutas (te dejo guía y enlaces)

1. **Conectar GitHub desde Lovable**: Connectors → GitHub → Connect project → Create Repository.
2. **Crear cuenta Neon** (https://neon.tech) → New Project → copiar connection string (con `?sslmode=require`).
3. **Importar el repo en Vercel**: vercel.com → New Project → seleccionar el repo de GitHub.
4. **Conectar Neon en Vercel**: Vercel Dashboard → Storage → Create Database → Neon → linkear (puebla `DATABASE_URL` automáticamente). Alternativa: pegar la connection string manualmente en Environment Variables.
5. **Añadir `SESSION_SECRET`** en Vercel Environment Variables (genera con `openssl rand -base64 48`).
6. **Ejecutar migración inicial**: desde tu máquina, clonar el repo, `bun install`, `bun run db:push` (o ejecutar el SQL de `src/db/migrations/0001_init.sql` con `psql $DATABASE_URL`). Esto crea las tablas en Neon.
7. **Deploy**: Vercel redespliega solo en cada push. Verifica que el primer build pase.
8. **Conectar dominio**: Vercel → Settings → Domains → Add → seguir instrucciones DNS de tu registrador (Vercel da los registros A/CNAME exactos).

---

## Parte 3 — Lo que se pierde / cambia

- **Datos en localStorage actuales** se quedan en cada navegador. Si tienes aspirantes ya cargados que quieras conservar, te puedo añadir un botón "Exportar JSON" antes de migrar y un "Importar JSON" tras crear cuenta. Dime si lo necesitas.
- **Preview de Lovable**: seguirá funcionando contra Neon (misma `DATABASE_URL` o una de desarrollo separada). El editor visual y la sincronización Lovable↔GitHub continúan iguales.
- **Cloudflare Workers**: se elimina el `wrangler.jsonc`. Si en algún momento quisieras volver a Cloudflare habría que rehacer este paso.

---

## Estructura final de archivos

```text
src/
  db/
    client.server.ts       # Drizzle + neon serverless
    schema.ts              # tablas
    migrations/
      0001_init.sql
  server/
    auth.functions.ts      # signUp, signIn, signOut, getCurrentUser
    aspirantes.functions.ts
    evaluaciones.functions.ts
  routes/
    __root.tsx             # + QueryClientProvider
    login.tsx              # signin/signup
    _authenticated.tsx     # guard
    _authenticated/
      index.tsx            # dashboard (movido)
      aspirante.$id.tsx    # perfil (movido)
  lib/
    storage.ts             # solo tipos (sin localStorage)
    scoring.ts             # sin cambios
  hooks/
    useAspirantes.ts       # con useQuery
    useEvaluacion.ts       # con useMutation + debounce
  components/              # sin cambios
drizzle.config.ts
vercel.json
.env.example
```

---

## Notas técnicas

- **Por qué Drizzle y no Prisma**: Prisma necesita generar binarios y suele ser problemático en serverless edge. Drizzle + driver HTTP de Neon es lighter y arranca en frío más rápido en Vercel.
- **Por qué cookie session y no JWT**: la utilidad `useSession` de TanStack Start ya viene integrada, encripta en servidor y evita el problema de revocación de JWT. Más simple para un solo proveedor de auth.
- **Argon2 vs bcrypt en Vercel**: argon2 (vía `@node-rs/argon2`) es más seguro y rápido pero a veces falla en build serverless por bindings nativos. Si argon falla, el plan de respaldo es `bcryptjs` (puro JS, sin nativo, ligeramente más lento pero universal). Lo elijo en el primer intento de build.
- **RLS no aplica**: como es Neon Postgres "puro" (no Supabase), la seguridad la garantiza cada server function filtrando por `owner_id = sesión.userId`. No hay cliente directo desde el navegador a la BD.
