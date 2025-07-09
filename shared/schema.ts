import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  activity: text("activity").notNull(), // 'monitoraggio', 'impianto', 'manutenzione ordinaria'
  description: text("description").notNull(),
  location: text("location").notNull(),
  plant: text("plant").notNull(), // Nome dell'impianto
  priority: text("priority").notNull(), // 'bassa', 'media', 'alta', 'urgente'
  estimatedHours: integer("estimated_hours").notNull(),
  status: text("status").notNull().default("available"), // 'available', 'in_progress', 'completed'
  assignedTeamId: integer("assigned_team_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  capacity: text("capacity").notNull(),
  installationDate: text("installation_date").notNull(),
  status: text("status").notNull().default("active"), // 'active', 'maintenance', 'inactive'
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  leader: text("leader").notNull(),
  status: text("status").notNull().default("available"), // 'available', 'busy', 'offline'
  currentLocation: text("current_location").notNull().default("Base Operativa"),
  nextAvailable: text("next_available").notNull().default("Libera ora"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("operatore"), // 'gestore', 'operatore'
  teamId: integer("team_id"), // Associated team for operators
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
  assignedTeamId: true,
  status: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertPlantSchema = createInsertSchema(plants).omit({
  id: true,
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Plant = typeof plants.$inferSelect;
export type InsertPlant = z.infer<typeof insertPlantSchema>;
