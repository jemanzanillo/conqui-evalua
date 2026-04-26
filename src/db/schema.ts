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
  rol: text("rol").notNull().default("evaluador"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const aspirantes = pgTable("aspirantes", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  zona: integer("zona"),
  club: text("club"),
  shareToken: uuid("share_token").notNull().defaultRandom(),
  fechaCreacion: timestamp("fecha_creacion", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const evaluaciones = pgTable(
  "evaluaciones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    aspiranteId: uuid("aspirante_id")
      .notNull()
      .references(() => aspirantes.id, { onDelete: "cascade" }),
    requisitoId: text("requisito_id").notNull(),
    estado: text("estado").notNull().default("pendiente"),
    seleccionados: jsonb("seleccionados").$type<string[]>().default([]),
    motivo: text("motivo"),
    comentario: text("comentario"),
    updatedBy: uuid("updated_by").references(() => usuarios.id, {
      onDelete: "set null",
    }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqAspReq: uniqueIndex("evaluaciones_asp_req_unique").on(
      t.aspiranteId,
      t.requisitoId,
    ),
  }),
);

export const historialEvaluaciones = pgTable(
  "historial_evaluaciones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    aspiranteId: uuid("aspirante_id")
      .notNull()
      .references(() => aspirantes.id, { onDelete: "cascade" }),
    requisitoId: text("requisito_id").notNull(),
    evaluadorId: uuid("evaluador_id").references(() => usuarios.id, {
      onDelete: "set null",
    }),
    estado: text("estado").notNull(),
    seleccionados: jsonb("seleccionados").$type<string[]>().default([]),
    motivo: text("motivo"),
    comentario: text("comentario"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    aspIdx: index("historial_aspirante_idx").on(t.aspiranteId, t.createdAt),
    evalIdx: index("historial_evaluador_idx").on(t.evaluadorId, t.createdAt),
  }),
);

export const requisitosOverrides = pgTable("requisitos_overrides", {
  requisitoId: text("requisito_id").primaryKey(),
  titulo: text("titulo"),
  descripcion: text("descripcion"),
  guia: text("guia"),
  evidencias: jsonb("evidencias").$type<string[]>(),
  updatedBy: uuid("updated_by").references(() => usuarios.id, {
    onDelete: "set null",
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Usuario = typeof usuarios.$inferSelect;
export type Aspirante = typeof aspirantes.$inferSelect;
export type Evaluacion = typeof evaluaciones.$inferSelect;
export type HistorialEvaluacion = typeof historialEvaluaciones.$inferSelect;
export type RequisitoOverride = typeof requisitosOverrides.$inferSelect;
