## Diagnóstico

He revisado el sitio publicado (`gm-evalua.lovable.app`) y hay **tres problemas** combinados:

1. **El sitio publicado no tiene `DATABASE_URL` ni `SESSION_SECRET`.** Tu `.env` local solo funciona en tu máquina. Lovable no lee `.env` para el sitio publicado — necesita los valores como **secrets** de runtime. Por eso `getCurrentUser` devuelve **HTTP 500** y la web crashea antes de mostrar nada útil.
2. **La base de datos Neon está vacía.** Conecté con tu connection string y `\dt` devuelve "Did not find any relations". Las tablas `usuarios`, `aspirantes`, `evaluaciones` nunca se crearon. Aunque el sitio tuviera la URL configurada, signup fallaría.
3. **Ruta `/signup` huérfana.** Existe `src/routes/signup.tsx` con un formulario antiguo que no encaja con el flujo actual (login.tsx ya tiene tabs Entrar / Crear cuenta). Sospecho que es la "página de registro" que viste cargar en blanco o con error. Hay que eliminarla.

---

## Lo que voy a hacer (en modo build)

### 1. Crear las tablas en Neon
Ejecutar el SQL de `src/db/migrations/0001_init.sql` contra tu Neon usando la `DATABASE_URL` del `.env`. Esto crea `usuarios`, `aspirantes`, `evaluaciones`, índices y la extensión `pgcrypto`. Verificaré con `\dt` que las tres tablas aparecen.

### 2. Configurar los secrets en Lovable
Añadir como **runtime secrets** (los lee `process.env` en el servidor publicado):
- `DATABASE_URL` → la cadena de Neon que ya tienes en `.env`
- `SESSION_SECRET` → la clave de 32+ chars que ya tienes en `.env`

Te pediré confirmación con `add_secret` antes de guardar nada — los valores los pegas tú o me autorizas a usar los del `.env`.

### 3. Eliminar la ruta `/signup` huérfana
Borrar `src/routes/signup.tsx`. El registro vive en `/login` (pestaña "Crear cuenta") y funciona contra el server function `signUp` ya implementado.

### 4. Endurecer manejo de errores
- En `_authenticated.tsx`: si `getCurrentUser` lanza (caso actual: BD no responde), redirigir a `/login` en vez de mostrar el error global. Así nunca vuelves a ver pantalla rota — siempre acabas en login.
- En `login.tsx` (tab Crear cuenta): mostrar mensaje claro si el server devuelve 500 ("Servicio no disponible, contacta al administrador") en vez de un error técnico.

### 5. Verificación end-to-end
Después de aplicar todo:
- Llamar `getCurrentUser` en producción → debe devolver `null` (200), no 500.
- Crear una cuenta de prueba desde la UI y confirmar que entra al dashboard.
- Borrar el usuario de prueba con SQL si quieres dejar la BD limpia.

---

## Notas técnicas (puedes saltarlas)

- Los `runtime secrets` de Lovable se inyectan en el Worker SSR como `process.env.X`, igual que en Vercel. Esto es lo equivalente a "Environment Variables" en Vercel.
- Tu `.env` local lo siguen usando `vite dev` y `psql`/`drizzle-kit`, así que no se borra.
- La cookie de sesión usa `SESSION_SECRET` para encriptar. Si lo cambias después, todas las sesiones existentes se invalidan (en este caso no hay ninguna todavía, así que da igual).
- Sigues teniendo la opción de migrar a Vercel cuando quieras — el código ya es portable. Pero si Lovable Publish te basta, esto te resuelve hoy mismo sin tocar Vercel.

---

## Lo que NO hago en esta tanda (avísame si lo quieres)

- Migrar el deploy a Vercel (sigue siendo posible, pero arreglar el publish actual es más rápido).
- Recuperación de contraseña por email (requiere conector tipo Resend).
- Botón "Exportar/Importar JSON" para datos antiguos del localStorage.
