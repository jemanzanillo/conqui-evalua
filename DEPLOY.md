# Despliegue en Vercel + Neon Postgres

Esta guía te lleva del repo conectado a una app en producción con dominio propio.

## 1. Conectar el proyecto a GitHub (desde Lovable)

1. En Lovable: **Connectors → GitHub → Connect project**.
2. Autoriza la Lovable GitHub App.
3. Click **Create Repository**. Se crea el repo con todo este código.

## 2. Crear la base de datos en Neon

1. Ve a [neon.tech](https://neon.tech) y crea cuenta (gratis).
2. **New Project** → Region cercana → crear.
3. En **Connection Details** copia la connection string. Debe verse así:
   ```
   postgresql://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require
   ```
4. Guarda esta cadena, la usarás como `DATABASE_URL`.

## 3. Crear las tablas

Desde tu máquina local:

```bash
git clone <tu-repo-de-github>
cd <tu-repo>
bun install

# Opción A: usar el SQL inicial
psql "<DATABASE_URL>" -f src/db/migrations/0001_init.sql

# Opción B: usar drizzle-kit
DATABASE_URL="<DATABASE_URL>" bunx drizzle-kit push
```

## 4. Importar en Vercel

1. Ve a [vercel.com](https://vercel.com) → **New Project** → importa tu repo.
2. Framework Preset: **Other** (Vercel detecta TanStack Start automáticamente con Vite).
3. Build Command: `bun run build` (default).
4. Output Directory: deja el default.

## 5. Configurar variables de entorno en Vercel

En **Settings → Environment Variables** añade dos variables (Production + Preview + Development):

| Nombre | Valor |
|---|---|
| `DATABASE_URL` | La cadena de Neon del paso 2 |
| `SESSION_SECRET` | Generar con: `openssl rand -base64 48` (mínimo 32 chars) |

> Atajo: en Vercel Dashboard → **Storage → Create Database → Neon** linkea Neon directamente y `DATABASE_URL` se inyecta automáticamente.

## 6. Conectar el dominio

1. Vercel → **Settings → Domains → Add**.
2. Escribe tu dominio (`tudominio.com`).
3. Vercel te dará registros DNS (tipo A o CNAME). Cópialos a tu registrador.
4. Espera la propagación (minutos a horas). SSL se provisiona solo.

## 7. Migración de datos antiguos

Los aspirantes que tenías en `localStorage` no se migran automáticamente porque vivían solo en tu navegador. Tienes que recrearlos desde la UI tras crear tu cuenta.

## 8. Cambios futuros

Cada push a la rama principal del repo redespliega Vercel automáticamente. Lovable sigue sincronizando con GitHub, así que puedes editar desde aquí o desde tu IDE.

## Notas técnicas

- **Adapter**: `vite.config.ts` actual usa `@lovable.dev/vite-tanstack-config` (que en Lovable preview corre con Cloudflare). En Vercel, TanStack Start funciona out-of-the-box con su preset por defecto. Si Vercel se queja, sustituye `vite.config.ts` por:

  ```ts
  import { defineConfig } from "vite";
  import { tanstackStart } from "@tanstack/react-start/plugin/vite";
  import viteReact from "@vitejs/plugin-react";
  import tailwindcss from "@tailwindcss/vite";
  import tsConfigPaths from "vite-tsconfig-paths";

  export default defineConfig({
    plugins: [
      tsConfigPaths(),
      tailwindcss(),
      tanstackStart({ target: "vercel" }),
      viteReact(),
    ],
  });
  ```

  Y borra `wrangler.jsonc`.

- **Auth**: cookie de sesión encriptada (httpOnly, secure, sameSite=lax). Sin recuperación de password en v1 — pídeme añadirla si la necesitas (requiere Resend o similar).

- **Seguridad**: cada server function valida ownership por `userId` antes de leer/escribir aspirantes y evaluaciones. No hay acceso directo desde el navegador a la BD.
