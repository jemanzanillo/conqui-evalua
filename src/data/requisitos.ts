export type Fase = "EVA-1" | "EVA-2" | "EVA-3";

export type RequisitoBase = {
  id: string;
  titulo: string;
  descripcion?: string;
  /** Contexto del requisito según el Manual del Guía Mayor 2022 */
  guia?: string;
  /** Lista de evidencias que el aspirante debe presentar (sección "Finalización del portafolio") */
  evidencias?: string[];
};

export type RequisitoSimple = RequisitoBase & {
  tipo: "simple";
};

export type RequisitoSeleccion = RequisitoBase & {
  tipo: "seleccion";
  min: number;
  opciones: { id: string; label: string }[];
};

export type Requisito = RequisitoSimple | RequisitoSeleccion;

export type FaseInfo = {
  id: Fase;
  titulo: string;
  fecha: string;
  totalPuntos: number;
  color: "naranja" | "verde" | "azul";
  requisitos: Requisito[];
};

export const FASES: FaseInfo[] = [
  {
    id: "EVA-1",
    titulo: "Primera Evaluación",
    fecha: "Sábado 09 mayo 2026",
    totalPuntos: 12,
    color: "naranja",
    requisitos: [
      {
        id: "e1-1",
        tipo: "simple",
        titulo: "Certificado de bautismo",
        guia:
          "Ser miembro bautizado, de pie regular, de la Iglesia Adventista del Séptimo Día. El programa Guía Mayor está dirigido a quienes desean guiar a los jóvenes y servir en la iglesia, por lo que se espera un compromiso visible con la fe y participación activa en la iglesia local.",
        evidencias: [
          "Certificado de bautismo, o",
          "Foto del bautismo, o",
          "Boletín de la iglesia que incluya su bautismo por nombre, o",
          "Carta del secretario de la iglesia o pastor confirmando la membresía",
        ],
      },
      {
        id: "e1-2",
        tipo: "simple",
        titulo: "Copia de cédula o Acta de nacimiento",
        guia:
          "Tener al menos 16 años para iniciar la tarjeta y 18 años al momento de la investidura. La mayoría de jurisdicciones exige 18 años para asumir responsabilidades plenas de adulto, lo que aplica también al Guía Mayor.",
        evidencias: ["Copia de una identificación oficial que verifique la edad"],
      },
      {
        id: "e1-3",
        tipo: "simple",
        titulo: "Carta de Recomendación de la Junta",
        descripcion: "Firmada por autoridades, teléfonos, sellada",
        guia:
          "Aunque un informe de la junta de la iglesia local es valioso, el manual recomienda complementarlo con una verificación oficial cuando sea posible. La carta debe respaldar formalmente al candidato ante la Conferencia/Misión.",
        evidencias: [
          "Carta firmada por la junta de la iglesia local",
          "Sello de la iglesia",
          "Datos de contacto (teléfonos) de quienes recomiendan",
        ],
      },
      {
        id: "e1-4",
        tipo: "simple",
        titulo: "Resumen 1 pág. o video",
        descripcion: "Qué significa ser GM y por qué quiere serlo",
        guia:
          "Con su mentor, analizar en oración qué significa ser un Guía Mayor y por qué desea serlo. Las preguntas guía son: ¿Cuál es el significado de Guía Mayor? ¿Por qué quieres serlo? ¿Cómo usarías tu entrenamiento para Dios y la iglesia después de la investidura?",
        evidencias: [
          "Informe escrito de una página o video que resuma la discusión y responda a las preguntas",
          "Incluir fecha, lugar y nombre del mentor con quien se reunió",
        ],
      },
      {
        id: "e1-5",
        tipo: "simple",
        titulo: "Talleres del PBST",
        guia:
          "Completar los 8 talleres de Capacitación Básica del Personal de CMT (o equivalente para líderes Aventureros): Ministerio de clubes (propósito e historia), Organización del club, Programación y planificación, Alcance del club, Ceremonias y simulacros, Crecimiento del desarrollo, Introducción a la docencia, y Cuestiones médicas/gestión de riesgos/seguridad infantil. Duración recomendada: 75-90 min cada uno, impartidos por instructores aprobados.",
        evidencias: [
          "Página de firmas con el nombre de cada uno de los 8 talleres",
          "Fecha de cada taller",
          "Firma del instructor por cada taller",
        ],
      },
      {
        id: "e1-6",
        tipo: "simple",
        titulo: "Libro Liderazgo",
        descripcion: "Sección Compartir — 2 opciones",
        guia:
          "Leer o escuchar un libro sobre liderazgo adventista seleccionado por la Conferencia/Misión. Muchos libros de Elena G. de White califican para este requisito.",
        evidencias: [
          "Evidencia de dos opciones de la Sección Compartir",
          "Registro de los capítulos leídos cada día",
        ],
      },
      {
        id: "e1-7",
        tipo: "simple",
        titulo: "Cuestionario Dones Espirituales",
        guia:
          "Cada miembro de la Iglesia recibe al menos un don espiritual del Espíritu Santo. El descubrimiento de los dones implica preparación espiritual a través de la oración, estudio de la Biblia y un corazón abierto a la guía y confirmación del Espíritu Santo.",
        evidencias: ["Cuestionario de dones espirituales completado"],
      },
      {
        id: "e1-8",
        tipo: "simple",
        titulo: "Reflexión 2 págs. Dones Espirituales",
        guia:
          "Documento de reflexión personal sobre los resultados del cuestionario de dones espirituales y cómo aplicarlos en el ministerio.",
        evidencias: ["Documento de reflexión de dos páginas sobre dones espirituales"],
      },
      {
        id: "e1-9",
        tipo: "simple",
        titulo: "Cuestionario Personalidades",
        guia:
          "Identificar el tipo de personalidad ayuda al Guía Mayor a comprenderse mejor a sí mismo y a quienes lidera, mejorando la comunicación y el discipulado.",
        evidencias: ["Cuestionario de personalidades completado"],
      },
      {
        id: "e1-10",
        tipo: "simple",
        titulo: "Reflexión 2 págs. Personalidades",
        guia:
          "Documento de reflexión sobre los resultados del cuestionario de personalidades y cómo influye en su liderazgo.",
        evidencias: ["Documento de reflexión de dos páginas sobre personalidades"],
      },
      {
        id: "e1-11",
        tipo: "simple",
        titulo: "Diario devocional (mínimo 1 mes)",
        guia:
          "Llevar un diario devocional durante al menos un mes, resumiendo lo aprendido en el tiempo devocional y describiendo cómo está creciendo en la fe.",
        evidencias: [
          "Diario devocional de al menos un mes",
          "Resumen de lo aprendido en cada entrada",
          "Descripción del crecimiento en la fe",
        ],
      },
      {
        id: "e1-12",
        tipo: "simple",
        titulo: "El Camino a Cristo",
        descripcion: "Sección Compartir — 2 opciones",
        guia:
          "Leer o escuchar el libro El Camino a Cristo de Elena G. de White y realizar dos opciones de la Sección Compartir.",
        evidencias: [
          "Evidencia de dos opciones de la Sección Compartir",
          "Registro de lectura del libro",
        ],
      },
    ],
  },
  {
    id: "EVA-2",
    titulo: "Segunda Evaluación",
    fecha: "Sábado 22 agosto 2026",
    totalPuntos: 15,
    color: "verde",
    requisitos: [
      {
        id: "e2-1",
        tipo: "simple",
        titulo: "Seminarios de Liderazgo",
        descripcion: "Asistencia presencial a los 8 temas",
        guia:
          "Completar los 8 talleres de capacitación de líderes aprobados por la Conferencia/Misión: Visión-Misión-Motivación, Liderazgo Cristiano, Disciplina y Discipulado, Evangelismo Infantil y Juvenil, Creando Adoraciones Efectivas, Comunicación (teoría y práctica), Educación (teoría y práctica), y Recursos para la Instrucción Creativa. Duración recomendada: 75-90 min cada uno.",
        evidencias: [
          "Página de firmas con el nombre de cada uno de los 8 talleres",
          "Fecha de cada taller",
          "Firma del instructor para cada uno",
        ],
      },
      {
        id: "e2-2",
        tipo: "simple",
        titulo: "Libro La Educación",
        descripcion: "Reflexión por página + aplicación al ministerio",
        guia:
          "Leer o escuchar el libro Educación de Elena G. de White. Las versiones en audio están disponibles y son aceptadas. El libro presenta los principios de la verdadera educación como desarrollo armonioso de todas las facultades.",
        evidencias: [
          "Reflexión de una página con ideas significativas y cómo aplicarlas en el ministerio",
        ],
      },
      {
        id: "e2-3",
        tipo: "seleccion",
        titulo: "Aptitud Física",
        descripcion: "Elegir 1 de 4",
        guia:
          "Elegir una opción y registrar el progreso. Las opciones reconocen distintos niveles y condiciones físicas, incluyendo programas adaptados con recomendación médica.",
        evidencias: [
          "Respuestas y materiales recopilados para la especialidad de Aptitud Física, o",
          "Respuestas y materiales del Master recreativo, o",
          "Récords físicos del medallón de Plata u Oro JA con informe de fechas y sesiones, o",
          "Recomendación escrita de un profesional médico sobre programa apropiado",
        ],
        min: 1,
        opciones: [
          { id: "a", label: "Especialidad Aptitud Física" },
          { id: "b", label: "Máster Deportivo (medalla plata/oro)" },
          { id: "c", label: "Condición Física con mentor GM (3 meses)" },
          { id: "d", label: "Programa físico recomendado por médico (3 meses)" },
        ],
      },
      {
        id: "e2-4",
        tipo: "simple",
        titulo: "Especialidad: Seguridad Básica en el Agua",
        guia:
          "Primer paso antes de cualquier actividad acuática. NO reemplaza la certificación de salvavidas. El objetivo es prevenir accidentes y ser conscientes de los riesgos en entornos acuáticos.",
        evidencias: ["Respuestas y materiales recopilados para la especialidad"],
      },
      {
        id: "e2-5",
        tipo: "simple",
        titulo: "Especialidad: Seguridad en el Campamento",
        guia:
          "Promueve la seguridad en el entorno de campamento. La identidad del Club de Conquistadores está fuertemente arraigada en actividades al aire libre; identificar riesgos previene lesiones.",
        evidencias: ["Respuestas y materiales recopilados para la especialidad"],
      },
      {
        id: "e2-6",
        tipo: "simple",
        titulo: "Especialidad: Campamento I",
        guia:
          "Conocimientos básicos para crear una experiencia positiva mientras se acampa. Las actividades al aire libre tienen un papel importante en el ministerio del club.",
        evidencias: ["Respuestas y materiales recopilados para la especialidad"],
      },
      {
        id: "e2-7",
        tipo: "simple",
        titulo: "Especialidad: Campamento II",
        guia:
          "Continúa los fundamentos de Campamento I, ampliando habilidades para acampar de forma segura y efectiva.",
        evidencias: ["Respuestas y materiales recopilados para la especialidad"],
      },
      {
        id: "e2-8",
        tipo: "simple",
        titulo: "Especialidad: Temperancia",
        guia:
          "Hábito de evitar los extremos de comportamiento. Incluso el entusiasmo por un buen estilo de vida debe estar sujeto a moderación: tiempo de pantalla, alimentación, trabajo, descanso.",
        evidencias: ["Respuestas y materiales recopilados para la especialidad"],
      },
      {
        id: "e2-9",
        tipo: "seleccion",
        titulo: "Especialidades adicionales",
        descripcion: "Elegir 3 de 9",
        guia:
          "Ganar honores desarrolla los dones que Dios nos ha dado y aporta experiencia útil para la comunidad. Antes de seleccionar, preguntarse cuáles se relacionan con habilidades personales y son más útiles para su contexto.",
        evidencias: [
          "Respuestas y materiales recopilados para los tres honores seleccionados",
        ],
        min: 3,
        opciones: [
          { id: "a", label: "Caminata con mochila / Excursionismo" },
          { id: "b", label: "Rescate básico" },
          { id: "c", label: "Campamento IV" },
          { id: "d", label: "Ejercicios y marchas" },
          { id: "e", label: "Ecología" },
          { id: "f", label: "Fogatas y cocina al aire libre" },
          { id: "g", label: "Nudos y amarras" },
          { id: "h", label: "Nutrición" },
          { id: "i", label: "Orientación" },
        ],
      },
      {
        id: "e2-10",
        tipo: "simple",
        titulo: "Primeros Auxilios + RCP",
        descripcion: "Certificado actualizado (Cruz Roja o equivalente) + PAB presencial",
        guia:
          "Certificado vigente (obtenido en los últimos 2 años o no caducado). En países sin Cruz Roja/Media Luna Roja, la especialidad de Primeros Auxilios Básico y RCP cumple cuando es impartida por profesionales de la salud.",
        evidencias: ["Materiales recopilados del certificado u honor"],
      },
      {
        id: "e2-11",
        tipo: "simple",
        titulo: "Especialidad de Santuario",
        descripcion: "Sección Compartir — 2 opciones",
      },
      {
        id: "e2-12",
        tipo: "seleccion",
        titulo: "Herencia Adventista",
        descripcion: "Elegir 1 de 4",
        min: 1,
        opciones: [
          { id: "a", label: "Especialidad Herencia Pioneros (firma)" },
          { id: "b", label: "Serie Tell the World (imagen/resumen/enlace)" },
          { id: "c", label: "Serie Keepers of the Flame (inglés)" },
          { id: "d", label: "Libro de herencia aprobado por Asociación/Misión" },
        ],
      },
      { id: "e2-13", tipo: "simple", titulo: "Especialidad de Evangelismo Personal" },
      { id: "e2-14", tipo: "simple", titulo: "Carpeta organizada EVA-2" },
      { id: "e2-15", tipo: "simple", titulo: "Entrevista personal con evaluador" },
    ],
  },
  {
    id: "EVA-3",
    titulo: "Tercera y Última Evaluación",
    fecha: "Domingo 31 octubre 2026",
    totalPuntos: 11,
    color: "azul",
    requisitos: [
      {
        id: "e3-1",
        tipo: "simple",
        titulo: "Asistencia 75% directiva (1 año)",
        descripcion: "Miembro activo del personal de un club + clase de Escuela Sabática",
      },
      {
        id: "e3-2",
        tipo: "simple",
        titulo: "Enseñar 3 esp. Aventureros + 2 Conquistadores",
        descripcion: "Con informe",
      },
      {
        id: "e3-3",
        tipo: "simple",
        titulo: "Esp. Narración de Historias Cristianas",
        descripcion: "Foto con firma",
      },
      {
        id: "e3-4",
        tipo: "simple",
        titulo: "Leer 4 Evangelios + El Deseado de Todas las Gentes",
        descripcion: "Sección Compartir — 2 opciones",
      },
      {
        id: "e3-5",
        tipo: "simple",
        titulo: "Reflexión sobre las 28 Creencias Fundamentales",
        descripcion: "Un párrafo por cada creencia",
      },
      {
        id: "e3-6",
        tipo: "seleccion",
        titulo: "Enseñar",
        descripcion: "Elegir 1 de 2",
        min: 1,
        opciones: [
          { id: "a", label: "Clase Biblia bautismal 3 meses (informe + firma)" },
          { id: "b", label: "Enseñar 5 de 10 creencias en programa aprobado" },
        ],
      },
      {
        id: "e3-7",
        tipo: "seleccion",
        titulo: "Especialidades de Liderazgo",
        descripcion: "Elegir 3 de 4",
        min: 3,
        opciones: [
          { id: "a", label: "Multiculturalidad" },
          { id: "b", label: "Pacificador" },
          { id: "c", label: "Redes Sociales (ADRA)" },
          { id: "d", label: "Economía Doméstica" },
        ],
      },
      {
        id: "e3-8",
        tipo: "simple",
        titulo: "3 eventos sociales con iglesia local",
        descripcion: "Informe con descripción, fecha, lugar, fotos, firmas",
      },
      {
        id: "e3-9",
        tipo: "simple",
        titulo: "Servicio Comunitario",
        descripcion: "Informe con descripción, fotos, firmas",
      },
      {
        id: "e3-10",
        tipo: "simple",
        titulo: "Antecedentes + protección de niños",
        descripcion: "Mayores de 18",
        guia:
          "Jesús dio gran valor a la protección de los niños (Mateo 18:1-6). Como líderes tenemos el deber moral y civil de protegerlos. El curso debe ser aprobado por la Conferencia/Misión según las regulaciones del país.",
        evidencias: [
          "Certificado o carta de la Conferencia/Misión o de la organización emisora indicando que pasó la verificación de antecedentes",
          "Firma del instructor del curso de protección infantil",
        ],
      },
      {
        id: "e3-11",
        tipo: "simple",
        titulo: "Carpeta Final PDF",
        descripcion: "Portada, índice, organizado por sección/requisito",
      },
    ],
  },
];

export const MOTIVOS_INCOMPLETO = [
  "Falta firma",
  "Contenido insuficiente",
  "No cumple formato",
  "Documento ilegible",
  "Falta sello",
];

export function getFase(id: Fase): FaseInfo {
  return FASES.find((f) => f.id === id)!;
}
