// Tipos compartidos entre cliente y servidor.
// La persistencia real está en src/server/*.functions.ts (Neon Postgres).

export type EstadoRequisito = "pendiente" | "completado" | "incompleto";

export type EvaluacionRequisito = {
  estado: EstadoRequisito;
  seleccionados?: string[];
  motivo?: string;
  comentario?: string;
};

export type Aspirante = {
  id: string;
  nombre: string;
  fechaCreacion: string;
};

export type EvaluacionAspirante = Record<string, EvaluacionRequisito>;
