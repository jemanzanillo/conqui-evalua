// Tipos compartidos entre cliente y servidor.
// La persistencia real está en src/server/*.functions.ts (Neon Postgres).

export type EstadoCalificacion = "pendiente" | "enviado";

export type Participante = {
  id: string;
  nombre: string;
  club: string | null;
  zona: number | null;
  orden: number | null;
  createdAt: string;
};

/** Mapa criterioId -> puntos otorgados */
export type Puntos = Record<string, number>;

export type Calificacion = {
  puntos: Puntos;
  estado: EstadoCalificacion;
  submittedAt?: string | null;
  updatedAt?: string;
};

export type Rol = "admin" | "juez";
