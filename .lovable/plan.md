
## Plan: App de Evaluación Guías Mayores (Mobile-First)

Catálogo de requisitos extraído de las 3 imágenes del Excel. Color por fase: **EVA-1 naranja**, **EVA-2 verde**, **EVA-3 azul**.

### Catálogo de requisitos (exacto del Excel)

**EVA-1 — Primera Evaluación (sábado 09 mayo 2026) · 12 pts · color naranja**
1. Certificado de bautismo
2. Copia de cédula o Acta de nacimiento
3. Carta de Recomendación de la Junta de su Iglesia Local (firmada por autoridades, teléfonos, sellada)
4. Resumen de 1 pág. o video de "qué significa ser GM y por qué quiere serlo"
5. Talleres del PBST
6. Libro Liderazgo (Sección Compartir — 2 opciones)
7. Resultados cuestionario Dones Espirituales
8. Reflexión 2 páginas Dones Espirituales
9. Resultados cuestionario Personalidades
10. Reflexión 2 páginas Personalidades
11. Diario devocional durante por lo menos 1 mes
12. El Camino a Cristo (Sección Compartir — 2 opciones)

**EVA-2 — Segunda Evaluación (sábado 22 agosto 2026) · 15 pts · color verde**
1. Seminarios (Liderazgo) — Asistencia presencial (8 temas: Visión/Misión, Liderazgo Cristiano, Disciplina/Discipulado, Evangelismo Niños/Jóvenes, Cultos Efectivos, Comunicación, Educación, Recursos para Instrucción Creativa)
2. Libro La Educación — Reflexión por página leída + cómo aplicarlo en ministerio
3. **Aptitud Física — Elegir 1 de 4**: a) Especialidad Aptitud Física · b) Máster Deportivo (medalla plata/oro) · c) Condición Física con mentor GM (3 meses) · d) Programa de condición física recomendado por médico (3 meses)
4. Especialidad: Seguridad Básica en el Agua
5. Especialidad: Seguridad en el Campamento
6. Especialidad: Campamento I
7. Especialidad: Campamento II
8. Especialidad: Temperancia
9. **Especialidades — Elegir 3 de 8**: Caminata con mochila/Excursionismo, Rescate básico, Campamento IV, Ejercicios y marchas, Ecología, Fogatas y cocina al aire libre, Nudos y amarras, Nutrición, Orientación
10. Certificado actualizado Primeros Auxilios + RCP (Cruz Roja o equivalente) — Asistencia presencial PAB
11. Especialidad de Santuario (Sección Compartir — 2 opciones)
12. **Herencia Adventista — Elegir 1 de 4**: a) Especialidad Herencia Pioneros (firma) · b) Serie "Tell the World" (imagen/resumen/enlace) · c) Serie "Keepers of the Flame" (inglés) · d) Escuchar/leer libro herencia aprobado por Asociación/Misión
13. Especialidad de Evangelismo Personal
14. (Total = 15: las opciones de selección suman 1 cada una; los 8 seminarios podrían contar como bloques individuales para llegar a 15 → ajustar conteo según hoja real)

> **Nota**: La imagen muestra "Total requisitos evaluados EVA-2: 15". Voy a estructurarlo de modo que cada tarjeta = 1 punto y el total sume 15. Si quieres que los 8 seminarios cuenten individualmente (en vez de uno solo), me dices.

**EVA-3 — Tercera y Última Evaluación (domingo 31 octubre 2026) · 11 pts · color azul**
1. Asistir al menos al 75% de las reuniones de la directiva (durante 1 año mínimo como miembro activo del personal de un club Aventureros/Conquistadores + clase de Escuela Sabática)
2. Enseñar 3 especialidades de Aventureros y 2 especialidades de Conquistadores (informe)
3. Especialidad de Narración de Historias Cristianas (foto con firma)
4. Leer/escuchar los 4 Evangelios y "El Deseado de Todas las Gentes" (Sección Compartir — 2 opciones)
5. Reflexión personal de un párrafo sobre cada una de las 28 Creencias Fundamentales
6. **Enseñar — Elegir 1 de 2**: a) Clase de Biblia bautismal de 3 meses (informe: fecha, lugar, nombre alumno, estudio Biblia, firma director Obra Misionera) · b) Enseñar 5 de 10 creencias en programa aprobado por iglesia
7. **Especialidades de Liderazgo — Elegir 3 de 4**: a) Multiculturalidad · b) Pacificador · c) Redes Sociales (ADRA) · d) Economía Doméstica
8. Participar en 3 eventos sociales/camaradería con su iglesia local (informe con descripción, fecha, lugar, fotos, firmas)
9. Servicio Comunitario (informe con descripción, fotos, firmas director departamento)
10. Revisión de antecedentes + curso de protección de niños (mayores de 18)
11. Carpeta Final con todos los requisitos en 1 archivo PDF (portada, índice, organizado por sección/requisito, según "Elaboración de Carpeta GM curriculum 2022")

### Diseño visual con código de color

Cada Tab y cada tarjeta de fase usa su color:
- EVA-1: naranja (`#F97316` / orange-500)
- EVA-2: verde (`#22C55E` / green-500)
- EVA-3: azul (`#3B82F6` / blue-500)

El sticky footer colorea el chip según el estado del semáforo (rojo/amarillo/verde) independiente del color de fase.

### Resto del plan (sin cambios)

- **Storage**: `localStorage` con capa abstracta (`src/lib/storage.ts`) para migrar a Cloud + login después
- **Rutas**: `/` Dashboard · `/aspirante/$id` Perfil con Tabs
- **Aspirantes**: agregar manual desde la app (botón "+ Aspirante")
- **Tarjetas**: simple (segmented Pendiente/Completado/Incompleto) o selección N de M (sub-checkboxes con auto-completado al alcanzar mínimo)
- **Incompleto inline**: chips de motivo (Falta firma · Contenido insuficiente · No cumple formato) + textarea
- **Sticky Footer semáforo proporcional** a las 3 fases:
  - Rojo 0–41% · Amarillo 42–66% · Verde 67–100%
- **Estética mobile-first**: blanco/gris claro, botones grandes (44px+), auto-guardado

### Archivos a crear
- `src/data/requisitos.ts` — catálogo completo arriba
- `src/lib/storage.ts`, `src/lib/scoring.ts`
- `src/hooks/useAspirantes.ts`, `src/hooks/useEvaluacion.ts`
- `src/components/AspiranteCard.tsx`, `RequisitoCard.tsx`, `IncompletoForm.tsx`, `ScoreFooter.tsx`, `NuevoAspiranteDialog.tsx`, `FaseTab.tsx`
- `src/routes/index.tsx` (reescribir), `src/routes/aspirante.$id.tsx`
- Actualizar `src/styles.css` con tokens HSL para los 3 colores de fase
