import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const attendanceRecords = pgTable("attendance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: date("date").notNull(),
  location: text("location").notNull(), // 'office', 'home', 'dayoff'
  quarter: text("quarter").notNull(), // 'Q1-2024'
  month: text("month").notNull(), // 'January-2024'
});

export const quarterSettings = pgTable("quarter_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quarter: text("quarter").notNull().unique(), // 'Q1-2024'
  year: integer("year").notNull(),
  month1WorkDays: integer("month1_work_days").notNull(),
  month2WorkDays: integer("month2_work_days").notNull(),
  month3WorkDays: integer("month3_work_days").notNull(),
});

export const appSettings = pgTable("app_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  currentQuarter: text("current_quarter").notNull(),
  darkMode: boolean("dark_mode").notNull().default(false),
  notifications: boolean("notifications").notNull().default(true),
});

export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
});

export const insertQuarterSettingsSchema = createInsertSchema(quarterSettings).omit({
  id: true,
});

export const insertAppSettingsSchema = createInsertSchema(appSettings).omit({
  id: true,
});

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;

export type QuarterSettings = typeof quarterSettings.$inferSelect;
export type InsertQuarterSettings = z.infer<typeof insertQuarterSettingsSchema>;

export type AppSettings = typeof appSettings.$inferSelect;
export type InsertAppSettings = z.infer<typeof insertAppSettingsSchema>;
