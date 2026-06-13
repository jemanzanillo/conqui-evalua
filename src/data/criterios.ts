export type Criterio = {
  id: string;
  titulo: string;
  descripcion?: string;
  /** Puntaje máximo otorgable para este criterio */
  puntosMax: number;
  /** Guía para el juez: qué se evalúa en este criterio */
  guia?: string;
};

export const CRITERIOS: Criterio[] = [
  {
    id: "mensaje",
    titulo: "Mensaje y contenido",
    puntosMax: 25,
    guia:
      "Evalúa si el mensaje tiene una idea central clara, bien desarrollada y respaldada en la Biblia. " +
      "Considera la estructura (introducción, desarrollo, conclusión), la coherencia del argumento y si el " +
      "contenido transmite un mensaje espiritual relevante para la audiencia.",
  },
  {
    id: "aplicacion",
    titulo: "Aplicación",
    puntosMax: 15,
    guia:
      "Evalúa si el predicador conecta el mensaje con la vida diaria del oyente: ejemplos prácticos, " +
      "desafíos concretos o un llamado a la acción que ayude a la audiencia a vivir lo predicado.",
  },
  {
    id: "dominio",
    titulo: "Dominio y manejo del tema",
    puntosMax: 30,
    guia:
      "Evalúa el conocimiento del tema y la seguridad al presentarlo: fluidez, manejo del texto bíblico, " +
      "capacidad de explicar sin depender de leer todo el sermón, y control del lenguaje corporal y la voz.",
  },
  {
    id: "originalidad",
    titulo: "Originalidad del tema",
    puntosMax: 10,
    guia:
      "Evalúa si el enfoque, las ilustraciones o la forma de presentar el tema son creativos y memorables, " +
      "evitando un desarrollo genérico o repetitivo.",
  },
  {
    id: "tiempo",
    titulo: "Tiempo (entre 6 y 8 minutos)",
    puntosMax: 10,
    guia:
      "El sermón debe durar entre 6 y 8 minutos. Otorga el puntaje máximo si se cumple el rango; " +
      "descuenta proporcionalmente si el participante se queda muy corto o se excede.",
  },
  {
    id: "participacion",
    titulo: "Participación",
    puntosMax: 10,
    guia:
      "Evalúa la actitud general del participante: presentación personal, entusiasmo, respeto por el tiempo " +
      "y las reglas del concurso, y disposición durante toda su intervención.",
  },
];

export const PUNTAJE_MAXIMO = CRITERIOS.reduce((acc, c) => acc + c.puntosMax, 0);

export function getCriterio(id: string): Criterio | undefined {
  return CRITERIOS.find((c) => c.id === id);
}
