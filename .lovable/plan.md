## Resumen de mejoras

1. **Autoría y fecha en correcciones**: cada requisito muestra "Corregido por [evaluador] el [fecha hora]".
2. **Exportar 1/0 al portapapeles** dividido por EVA (un botón por evaluación dentro del aspirante).
3. **Zona (1–11) y Club** al crear un aspirante.
4. **Usuario admin "Coordinador"** con panel propio: ve usuarios, historial completo de calificaciones, y edita textos/guía/evidencias de los requisitos.
5. **Link de observador** (solo lectura) para compartir el progreso de un aspirante específico, sin necesidad de cuenta.

---

## Cambios técnicos

### Base de datos (nueva migración `0002_admin_y_extras.sql`)

- `usuarios`: añadir columna `rol TEXT NOT NULL DEFAULT 'evaluador'` (`'admin' | 'evaluador'`).
- `aspirantes`: añadir `zona INT` y `club TEXT`. Añadir `share_token UUID UNIQUE DEFAULT gen_random_uuid()` para el link de observador.
- `evaluaciones`: añadir `updated_by UUID REFERENCES usuarios(id)` para saber quién hizo la última corrección. (`updated_at` ya existe.)
- Nueva tabla `historial_evaluaciones` (log completo):
  ```
  id, aspirante_id, requisito_id, evaluador_id, estado,
  seleccionados JSONB, motivo, comentario, created_at
  ```
- Nueva tabla `requisitos_overrides` para que el admin edite textos sin tocar el código:
  ```
  requisito_id PK, titulo, descripcion, guia, evidencias JSONB, updated_at, updated_by
  ```
  El frontend hará merge: `requisito.json` (código) + override (BD) si existe.
- **Seed del admin**: insertar usuario `Coordinador` con la contraseña `Graciaslovable` (bcrypt) y `rol='admin'`. Si ya existe, no duplicar.

### Backend (server functions)

- `auth.functions.ts`: `getCurrentUser` ahora devuelve también `rol`. `signUp` siempre crea con rol `evaluador`.
- `aspirantes.functions.ts`: 
  - `addAspirante` recibe `{ nombre, zona, club }`.
  - `getAspirante` devuelve también `zona`, `club`, `shareToken`.
- `evaluaciones.functions.ts`: en `updateRequisito`, además de upsert, insertar fila en `historial_evaluaciones` y guardar `updated_by = userId`. `getEvaluacion` devuelve por requisito: `{ estado, seleccionados, motivo, comentario, updatedAt, updatedByNombre }`.
- Nuevo `admin.functions.ts` (todas verifican `rol === 'admin'`):
  - `listUsuarios()` → todos los usuarios con rol y conteo de aspirantes.
  - `listHistorial({ aspiranteId? })` → log paginado, joineado con nombre de evaluador y aspirante.
  - `listRequisitosOverrides()` y `upsertRequisitoOverride({ requisitoId, titulo?, descripcion?, guia?, evidencias? })`.
- Nuevo `observador.functions.ts` (sin auth, valida por `shareToken`):
  - `getAspiranteByToken({ token })` → nombre, zona, club.
  - `getEvaluacionByToken({ token })` → mismo shape pero solo lectura.

### Frontend

- **`NuevoAspiranteDialog`**: añadir `Select` de Zona (1–11) y `Input` de Club.
- **`AspiranteCard`** (dashboard): mostrar `Zona X · Club` debajo del nombre.
- **`RequisitoCard`**: si la evaluación tiene `updatedAt + updatedByNombre`, mostrar pie pequeño "Última corrección: Juan · 25 abr, 14:32".
- **Botón "Copiar 1/0"**: en cada `TabsContent` de la página del aspirante (`aspirante.$id.tsx`), un botón que copia al portapapeles los `1`/`0` de los requisitos de esa EVA separados por tab. Toast de confirmación. Otro botón "Copiar todo" en el footer copia las 3 EVAs en el mismo orden.
- **Botón "Compartir"** en la página del aspirante: copia URL `…/observador/{shareToken}`.
- **Nueva ruta pública `/observador/$token.tsx`** (fuera de `_authenticated`): muestra solo lectura del aspirante (nombre, zona, club, progreso por EVA, requisitos con estado, motivo y comentario si están incompletos). Sin botones de edición.
- **Nuevo guard `_admin.tsx`** dentro de `_authenticated/`: redirige a `/` si `user.rol !== 'admin'`.
- **Nuevas rutas admin**:
  - `/_authenticated/_admin/admin/index.tsx`: panel con tres pestañas:
    1. **Usuarios** — lista de todos (nombre, correo, rol, # aspirantes).
    2. **Historial** — tabla cronológica (fecha, evaluador, aspirante, requisito, estado nuevo, motivo). Filtro por aspirante.
    3. **Requisitos** — lista todas las EVAs y requisitos; al hacer click abre un Sheet con campos editables (`titulo`, `descripcion`, `guia`, `evidencias[]`). Guarda en `requisitos_overrides`.
- **Hook `useRequisitosConOverrides()`**: combina `FASES` con overrides de la BD. Reemplaza el uso directo de `FASES` en `RequisitoCard`, `RequisitoGuiaSheet`, dashboard, etc.
- **Menú de usuario** en el header: si `rol === 'admin'`, mostrar enlace "Panel admin".

### Detalles de UX

- El botón "Copiar 1/0" para una EVA copia exactamente N celdas (una por requisito definido en orden) separadas por `\t`, listo para pegar en una fila de Excel.
- El link de observador no necesita login. Es revocable más adelante regenerando el `share_token` (no incluido en este plan, pero la columna lo permite).
- El admin no puede borrar usuarios ni cambiar contraseñas en este plan (puede hacerse luego si lo pides).

### Archivos creados / modificados

**Nuevos**:
- `src/db/migrations/0002_admin_y_extras.sql`
- `src/server/admin.functions.ts`
- `src/server/observador.functions.ts`
- `src/hooks/useRequisitosConOverrides.ts`
- `src/hooks/useAdmin.ts`
- `src/components/CopiarEvaButton.tsx`
- `src/components/CompartirLinkButton.tsx`
- `src/routes/_authenticated/_admin.tsx` (guard)
- `src/routes/_authenticated/_admin/admin.index.tsx`
- `src/routes/observador.$token.tsx`

**Modificados**:
- `src/db/schema.ts` (nuevos campos y tablas)
- `src/server/auth.functions.ts` (devolver rol, seed admin)
- `src/server/aspirantes.functions.ts` (zona, club, shareToken)
- `src/server/evaluaciones.functions.ts` (historial, updated_by, devolver autor)
- `src/components/NuevoAspiranteDialog.tsx` (zona + club)
- `src/components/AspiranteCard.tsx` (mostrar zona/club)
- `src/components/RequisitoCard.tsx` (pie con autor/fecha + usar overrides)
- `src/components/RequisitoGuiaSheet.tsx` (usar overrides)
- `src/routes/_authenticated/aspirante.$id.tsx` (botones copiar + compartir)
- `src/routes/_authenticated.tsx` (mostrar enlace admin si rol admin)
- `src/lib/storage.ts` (extender tipos con autor/fecha/zona/club)
