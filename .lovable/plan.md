# Plan de mejoras

## 1) Aspirantes compartidos entre todos los evaluadores

Hoy cada evaluador solo ve los aspirantes que él mismo creó (filtrado por `ownerId`). Vamos a convertirlo en un **pool compartido**: cualquier evaluador (y el admin) ve todos los aspirantes y puede evaluarlos. El campo `ownerId` se mantiene solo como "creado por" para auditoría.

**Cambios server (`src/server/aspirantes.functions.ts`):**
- `listAspirantes`: quitar el `where(eq(ownerId, userId))`. Devolver todos los aspirantes ordenados por nombre. Solo exigir sesión válida.
- `getAspirante`: quitar el filtro por `ownerId`, solo buscar por `id`.
- `removeAspirante`: permitir eliminar a cualquier evaluador autenticado (mismo criterio que la app: equipo de confianza). El admin obviamente también puede.
- `addAspirante`: sin cambios (sigue guardando `ownerId = sesión actual`).

**Cambios server (`src/server/evaluaciones.functions.ts`):**
- Reemplazar `assertOwnership` por `assertAspiranteExists` (solo verifica que el aspirante exista). Tanto `getEvaluacion` como `updateRequisito` lo usan.
- `updatedBy` y el historial siguen registrando al evaluador real que hizo el cambio, así sabes quién corrigió qué (ya estaba implementado).

**Sin migración de base de datos**: la columna `owner_id` se queda como metadato de "creador".

## 2) Cerrar sesión (no funciona)

El bug: `signOut` borra la cookie del lado servidor, pero la query `["currentUser"]` de TanStack Query queda cacheada con `staleTime: 5min`. Al hacer `router.invalidate()`, el `beforeLoad` de `_authenticated` vuelve a usar `ensureQueryData` que devuelve el usuario cacheado → no redirige a `/login`.

**Fix en `src/routes/_authenticated.tsx` (`HeaderUserMenu`):**
- En `onSuccess` del mutation de `signOut`:
  1. `queryClient.removeQueries({ queryKey: ["currentUser"] })` (o `setQueryData(["currentUser"], null)`).
  2. `await router.invalidate()`.
  3. `router.navigate({ to: "/login" })`.
- Importar `useQueryClient` desde `@tanstack/react-query`.

## 3) Crear cuentas de evaluador desde el panel del Coordinador

Nueva sección dentro de `/admin` para que el Coordinador cree, vea y elimine cuentas sin tocar la BD.

**Server (`src/server/admin.functions.ts`):**
- Nueva server function `createEvaluador({ nombre, email, password, rol })`:
  - Solo admin (`requireAdminId`).
  - Valida con Zod: email válido, password ≥ 8, nombre 1–120, rol `'evaluador' | 'admin'` (default `'evaluador'`).
  - Hashea con `bcryptjs` (ya está instalado, lo usa `auth.functions.ts`).
  - Inserta en `usuarios`. Si el email ya existe, devuelve error claro.
- Nueva server function `deleteUsuario({ id })`:
  - Solo admin. Bloquear si `id === adminId` (no auto-eliminarse).
  - `delete from usuarios where id = ...` (cascada borra sus aspirantes; sus historiales mantienen `evaluador_id` con `set null`).

**UI (`src/routes/_authenticated/_admin/admin.index.tsx`):**
- En la pestaña "Usuarios" agregar un botón **"Nuevo evaluador"** que abre un Dialog con campos: nombre, correo, contraseña, rol (select evaluador/admin).
- Cada fila de la tabla de usuarios obtiene un botón de eliminar (icono trash) con `confirm()`. Oculto para la fila del propio admin.
- Al crear/eliminar: invalidar `["admin-usuarios"]` y mostrar toast.

## Detalles técnicos

```text
src/
├── server/
│   ├── aspirantes.functions.ts   (quitar filtros por ownerId)
│   ├── evaluaciones.functions.ts (assertOwnership → assertAspiranteExists)
│   └── admin.functions.ts        (+ createEvaluador, deleteUsuario)
└── routes/
    ├── _authenticated.tsx                       (fix logout: limpiar cache currentUser)
    └── _authenticated/_admin/admin.index.tsx    (UI nuevo evaluador + borrar)
```

No se crean tablas ni migraciones nuevas. No se cambia el flujo de login. La cuenta hardcoded "Coordinador" sigue funcionando igual.
