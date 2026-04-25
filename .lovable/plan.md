## Objetivo

Dar al evaluador acceso rápido a los criterios oficiales del Manual del Guía Mayor 2022 dentro de cada tarjeta de requisito. Para cada uno mostraremos:

1. **Descripción/contexto** — resumen breve del propósito del requisito.
2. **Qué debe presentar** — el checklist exacto de la sección "Finalización del portafolio" del manual.

## Experiencia de usuario

En cada `RequisitoCard` aparecerá un pequeño botón con icono de información (📖) junto al título. Al tocarlo, se abre un **Sheet lateral** (panel deslizante desde la derecha en desktop, desde abajo en móvil) con:

```text
┌────────────────────────────────┐
│ [×] EVA-1 · Requisito 3        │
│                                │
│ Carta de Recomendación         │
│ ─────────────────────────────  │
│ 📖 Contexto                    │
│ Texto del manual explicando    │
│ por qué importa…               │
│                                │
│ ✅ Qué debe presentar          │
│ • Documento firmado por…       │
│ • Sello de la junta            │
│ • Teléfonos de referencia      │
└────────────────────────────────┘
```

Esto mantiene la tarjeta compacta y rápida (no añade altura), pero pone los criterios oficiales a un toque de distancia.

## Cambios técnicos

1. **`src/data/requisitos.ts`** — extender el tipo `RequisitoBase` con dos campos opcionales:
   - `guia?: string` — contexto/descripción del manual.
   - `evidencias?: string[]` — lista de items de "Finalización del portafolio".

2. **Cargar contenido del manual** — para los requisitos del PDF parseado (Prerequisitos = EVA-1 mayoría, y parte de EVA-2 honores físicos). Para los que aún no tienen guía, los dejaremos vacíos y el botón "info" no aparecerá hasta que añadas el texto.

3. **Nuevo componente `src/components/RequisitoGuiaSheet.tsx`** — usa el `Sheet` de shadcn que ya está instalado. Recibe el requisito y muestra contexto + lista de evidencias.

4. **`src/components/RequisitoCard.tsx`** — añadir un botón pequeño con icono `Info` de lucide junto al título, visible solo cuando el requisito tiene `guia` o `evidencias`. Al tocarlo abre el Sheet.

## Cobertura inicial

Cargaré las guías de estos requisitos (extraídos textualmente del manual):

**EVA-1 (12 de 12):** bautismo, edad/cédula, antecedentes y protección infantil, carta de recomendación / mentor (resumen-video), talleres PBST, libro liderazgo, dones espirituales (cuestionario+reflexión), personalidades (cuestionario+reflexión), diario devocional, El Camino a Cristo.

**EVA-2 (parcial):** aptitud física, los 5 honores obligatorios (agua, campamento, campamento I, II, temperancia), las 10 especialidades adicionales, Primeros Auxilios + RCP.

**EVA-2 restantes y EVA-3 completo:** quedarán sin guía por ahora (botón info oculto). Más adelante me pasas los textos del manual o re-parseamos las páginas 51+ y los añado.

## Resultado

- Sin cambios en el flujo del evaluador: la tarjeta se ve y se usa igual.
- Un botón opcional revela los criterios oficiales del manual cuando hay duda.
- Estructura preparada para completar guías progresivamente sin más cambios de código.
