import { 
  type AttendanceRecord, 
  type InsertAttendanceRecord,
  type QuarterSettings,
  type InsertQuarterSettings,
  type AppSettings,
  type InsertAppSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Attendance Records
  getAttendanceRecords(): Promise<AttendanceRecord[]>;
  getAttendanceRecordsByQuarter(quarter: string): Promise<AttendanceRecord[]>;
  getAttendanceRecordsByMonth(month: string): Promise<AttendanceRecord[]>;
  getAttendanceRecordByDate(date: string): Promise<AttendanceRecord | undefined>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  updateAttendanceRecord(date: string, record: Partial<InsertAttendanceRecord>): Promise<AttendanceRecord | undefined>;
  deleteAttendanceRecord(date: string): Promise<boolean>;
  
  // Quarter Settings
  getQuarterSettings(): Promise<QuarterSettings[]>;
  getQuarterSettingsByQuarter(quarter: string): Promise<QuarterSettings | undefined>;
  createQuarterSettings(settings: InsertQuarterSettings): Promise<QuarterSettings>;
  updateQuarterSettings(quarter: string, settings: Partial<InsertQuarterSettings>): Promise<QuarterSettings | undefined>;
  
  // App Settings
  getAppSettings(): Promise<AppSettings | undefined>;
  createAppSettings(settings: InsertAppSettings): Promise<AppSettings>;
  updateAppSettings(settings: Partial<InsertAppSettings>): Promise<AppSettings | undefined>;
}

export class MemStorage implements IStorage {
  private attendanceRecords: Map<string, AttendanceRecord>;
  private quarterSettings: Map<string, QuarterSettings>;
  private appSettings: AppSettings | undefined;

  constructor() {
    this.attendanceRecords = new Map();
    this.quarterSettings = new Map();
    this.appSettings = undefined;
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default quarter settings for current quarter
    const currentQuarter = "Q3-2025";
    const defaultQuarterSettings: QuarterSettings = {
      id: randomUUID(),
      quarter: currentQuarter,
      year: 2025,
      month1WorkDays: 23,
      month2WorkDays: 21,
      month3WorkDays: 21,
    };
    this.quarterSettings.set(currentQuarter, defaultQuarterSettings);

    // Initialize default app settings
    this.appSettings = {
      id: randomUUID(),
      currentQuarter,
      darkMode: false,
      notifications: true,
    };
  }

  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values());
  }

  async getAttendanceRecordsByQuarter(quarter: string): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values()).filter(
      record => record.quarter === quarter
    );
  }

  async getAttendanceRecordsByMonth(month: string): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values()).filter(
      record => record.month === month
    );
  }

  async getAttendanceRecordByDate(date: string): Promise<AttendanceRecord | undefined> {
    return this.attendanceRecords.get(date);
  }

  async createAttendanceRecord(insertRecord: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const id = randomUUID();
    const record: AttendanceRecord = { ...insertRecord, id };
    this.attendanceRecords.set(insertRecord.date, record);
    return record;
  }

  async updateAttendanceRecord(date: string, updateData: Partial<InsertAttendanceRecord>): Promise<AttendanceRecord | undefined> {
    const existing = this.attendanceRecords.get(date);
    if (!existing) return undefined;
    
    const updated: AttendanceRecord = { ...existing, ...updateData };
    this.attendanceRecords.set(date, updated);
    return updated;
  }

  async deleteAttendanceRecord(date: string): Promise<boolean> {
    return this.attendanceRecords.delete(date);
  }

  async getQuarterSettings(): Promise<QuarterSettings[]> {
    return Array.from(this.quarterSettings.values());
  }

  async getQuarterSettingsByQuarter(quarter: string): Promise<QuarterSettings | undefined> {
    return this.quarterSettings.get(quarter);
  }

  async createQuarterSettings(insertSettings: InsertQuarterSettings): Promise<QuarterSettings> {
    const id = randomUUID();
    const settings: QuarterSettings = { ...insertSettings, id };
    this.quarterSettings.set(insertSettings.quarter, settings);
    return settings;
  }

  async updateQuarterSettings(quarter: string, updateData: Partial<InsertQuarterSettings>): Promise<QuarterSettings | undefined> {
    const existing = this.quarterSettings.get(quarter);
    if (!existing) return undefined;
    
    const updated: QuarterSettings = { ...existing, ...updateData };
    this.quarterSettings.set(quarter, updated);
    return updated;
  }

  async getAppSettings(): Promise<AppSettings | undefined> {
    return this.appSettings;
  }

  async createAppSettings(insertSettings: InsertAppSettings): Promise<AppSettings> {
    const id = randomUUID();
    const settings: AppSettings = { ...insertSettings, id };
    this.appSettings = settings;
    return settings;
  }

  async updateAppSettings(updateData: Partial<InsertAppSettings>): Promise<AppSettings | undefined> {
    if (!this.appSettings) return undefined;
    
    const updated: AppSettings = {
      ...this.appSettings,
      ...updateData,
      darkMode: updateData.darkMode ?? this.appSettings.darkMode,
      notifications: updateData.notifications ?? this.appSettings.notifications,
    };
    this.appSettings = updated;
    return this.appSettings;
  }
}

export const storage = new MemStorage();
