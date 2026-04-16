import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const employeesTable = pgTable("employees", {
  id: serial("id").primaryKey(),
  first_name: text("first_name").notNull(),
  second_name: text("second_name").notNull(),
  third_name: text("third_name").notNull(),
  full_name_id: text("full_name_id").notNull(),
  phone: text("phone").notNull(),
  skills: text("skills").notNull(),
  profile_photo_path: text("profile_photo_path"),
  id_front_path: text("id_front_path"),
  id_back_path: text("id_back_path"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employeesTable).omit({
  id: true,
  created_at: true,
});
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employeesTable.$inferSelect;
