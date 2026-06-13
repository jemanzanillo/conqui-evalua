import {
  pgTable,
  text,
  uuid,
  timestamp,
  jsonb,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  nombre: text("nombre").notNull(),
  rol: text("rol").notNull().default("juez"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const participantes = pgTable("participantes", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  club: text("club"),
  zona: integer("zona"),
  /** Orden de presentación en el concurso (opcional) */
  orden: integer("orden"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const calificaciones = pgTable(
  "calificaciones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participanteId: uuid("participante_id")
      .notNull()
      .references(() => participantes.id, { onDelete: "cascade" }),
    juezId: uuid("juez_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    /** Mapa criterioId -> puntos otorgados */
    puntos: jsonb("puntos").$type<Record<string, number>>().default({}),
    estado: text("estado").notNull().default("pendiente"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqParticipanteJuez: uniqueIndex("calificaciones_participante_juez_unique").on(
      t.participanteId,
      t.juezId,
    ),
  }),
);

export const historialCalificaciones = pgTable(
  "historial_calificaciones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participanteId: uuid("participante_id")
      .notNull()
      .references(() => participantes.id, { onDelete: "cascade" }),
    juezId: uuid("juez_id").references(() => usuarios.id, {
      onDelete: "set null",
    }),
    accion: text("accion").notNull(),
    puntos: jsonb("puntos").$type<Record<string, number>>(),
    actorId: uuid("actor_id").references(() => usuarios.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    participanteIdx: index("historial_participante_idx").on(t.participanteId, t.createdAt),
    juezIdx: index("historial_juez_idx").on(t.juezId, t.createdAt),
  }),
);

export type Usuario = typeof usuarios.$inferSelect;
export type Participante = typeof participantes.$inferSelect;
export type Calificacion = typeof calificaciones.$inferSelect;
export type HistorialCalificacion = typeof historialCalificaciones.$inferSelect;
