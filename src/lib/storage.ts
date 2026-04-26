// Tipos compartidos entre cliente y servidor.
// La persistencia real está en src/server/*.functions.ts (Neon Postgres).

export type EstadoRequisito = "pendiente" | "completado" | "incompleto";

export type EvaluacionRequisito = {
  estado: EstadoRequisito;
  seleccionados?: string[];
  motivo?: string;
  comentario?: string;
  /** Fecha (ISO) de la última corrección, si la hay */
  updatedAt?: string;
  /** Nombre del evaluador que hizo la última corrección */
  updatedByNombre?: string | null;
};

export type Aspirante = {
  id: string;
  nombre: string;
  zona: number | null;
  club: string | null;
  shareToken: string;
  fechaCreacion: string;
};

export type EvaluacionAspirante = Record<string, EvaluacionRequisito>;

export type RequisitoOverride = {
  requisitoId: string;
  titulo?: string | null;
  descripcion?: string | null;
  guia?: string | null;
  evidencias?: string[] | null;
};

export type Rol = "admin" | "evaluador";
