export type Fase = "EVA-1" | "EVA-2" | "EVA-3";

export type RequisitoBase = {
  id: string;
  titulo: string;
  descripcion?: string;
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
      { id: "e1-1", tipo: "simple", titulo: "Certificado de bautismo" },
      { id: "e1-2", tipo: "simple", titulo: "Copia de cédula o Acta de nacimiento" },
      {
        id: "e1-3",
        tipo: "simple",
        titulo: "Carta de Recomendación de la Junta",
        descripcion: "Firmada por autoridades, teléfonos, sellada",
      },
      {
        id: "e1-4",
        tipo: "simple",
        titulo: "Resumen 1 pág. o video",
        descripcion: "Qué significa ser GM y por qué quiere serlo",
      },
      { id: "e1-5", tipo: "simple", titulo: "Talleres del PBST" },
      {
        id: "e1-6",
        tipo: "simple",
        titulo: "Libro Liderazgo",
        descripcion: "Sección Compartir — 2 opciones",
      },
      { id: "e1-7", tipo: "simple", titulo: "Cuestionario Dones Espirituales" },
      { id: "e1-8", tipo: "simple", titulo: "Reflexión 2 págs. Dones Espirituales" },
      { id: "e1-9", tipo: "simple", titulo: "Cuestionario Personalidades" },
      { id: "e1-10", tipo: "simple", titulo: "Reflexión 2 págs. Personalidades" },
      { id: "e1-11", tipo: "simple", titulo: "Diario devocional (mínimo 1 mes)" },
      {
        id: "e1-12",
        tipo: "simple",
        titulo: "El Camino a Cristo",
        descripcion: "Sección Compartir — 2 opciones",
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
      },
      {
        id: "e2-2",
        tipo: "simple",
        titulo: "Libro La Educación",
        descripcion: "Reflexión por página + aplicación al ministerio",
      },
      {
        id: "e2-3",
        tipo: "seleccion",
        titulo: "Aptitud Física",
        descripcion: "Elegir 1 de 4",
        min: 1,
        opciones: [
          { id: "a", label: "Especialidad Aptitud Física" },
          { id: "b", label: "Máster Deportivo (medalla plata/oro)" },
          { id: "c", label: "Condición Física con mentor GM (3 meses)" },
          { id: "d", label: "Programa físico recomendado por médico (3 meses)" },
        ],
      },
      { id: "e2-4", tipo: "simple", titulo: "Especialidad: Seguridad Básica en el Agua" },
      { id: "e2-5", tipo: "simple", titulo: "Especialidad: Seguridad en el Campamento" },
      { id: "e2-6", tipo: "simple", titulo: "Especialidad: Campamento I" },
      { id: "e2-7", tipo: "simple", titulo: "Especialidad: Campamento II" },
      { id: "e2-8", tipo: "simple", titulo: "Especialidad: Temperancia" },
      {
        id: "e2-9",
        tipo: "seleccion",
        titulo: "Especialidades adicionales",
        descripcion: "Elegir 3 de 9",
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
