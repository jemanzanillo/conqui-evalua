import {
  pgTable,
  text,
  uuid,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  nombre: text("nombre").notNull(),
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

export type Usuario = typeof usuarios.$inferSelect;
export type Aspirante = typeof aspirantes.$inferSelect;
export type Evaluacion = typeof evaluaciones.$inferSelect;
