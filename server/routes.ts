import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAttendanceRecordSchema, insertQuarterSettingsSchema, insertAppSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Attendance Records
  app.get("/api/attendance", async (req, res) => {
    try {
      const records = await storage.getAttendanceRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  app.get("/api/attendance/quarter/:quarter", async (req, res) => {
    try {
      const { quarter } = req.params;
      const records = await storage.getAttendanceRecordsByQuarter(quarter);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quarterly attendance" });
    }
  });

  app.get("/api/attendance/month/:month", async (req, res) => {
    try {
      const { month } = req.params;
      const records = await storage.getAttendanceRecordsByMonth(month);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly attendance" });
    }
  });

  app.get("/api/attendance/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const record = await storage.getAttendanceRecordByDate(date);
      if (!record) {
        return res.status(404).json({ message: "No attendance record found for this date" });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance record" });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const validatedData = insertAttendanceRecordSchema.parse(req.body);
      const record = await storage.createAttendanceRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ message: "Invalid attendance data", error: error.message });
    }
  });

  app.put("/api/attendance/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const validatedData = insertAttendanceRecordSchema.partial().parse(req.body);
      const record = await storage.updateAttendanceRecord(date, validatedData);
      if (!record) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(400).json({ message: "Invalid attendance data", error: error.message });
    }
  });

  app.delete("/api/attendance/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const deleted = await storage.deleteAttendanceRecord(date);
      if (!deleted) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete attendance record" });
    }
  });

  // Quarter Settings
  app.get("/api/quarter-settings", async (req, res) => {
    try {
      const settings = await storage.getQuarterSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quarter settings" });
    }
  });

  app.get("/api/quarter-settings/:quarter", async (req, res) => {
    try {
      const { quarter } = req.params;
      const settings = await storage.getQuarterSettingsByQuarter(quarter);
      if (!settings) {
        return res.status(404).json({ message: "Quarter settings not found" });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quarter settings" });
    }
  });

  app.post("/api/quarter-settings", async (req, res) => {
    try {
      const validatedData = insertQuarterSettingsSchema.parse(req.body);
      const settings = await storage.createQuarterSettings(validatedData);
      res.status(201).json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid quarter settings", error: error.message });
    }
  });

  app.put("/api/quarter-settings/:quarter", async (req, res) => {
    try {
      const { quarter } = req.params;
      const validatedData = insertQuarterSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateQuarterSettings(quarter, validatedData);
      if (!settings) {
        return res.status(404).json({ message: "Quarter settings not found" });
      }
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid quarter settings", error: error.message });
    }
  });

  // App Settings
  app.get("/api/app-settings", async (req, res) => {
    try {
      const settings = await storage.getAppSettings();
      if (!settings) {
        return res.status(404).json({ message: "App settings not found" });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch app settings" });
    }
  });

  app.post("/api/app-settings", async (req, res) => {
    try {
      const validatedData = insertAppSettingsSchema.parse(req.body);
      const settings = await storage.createAppSettings(validatedData);
      res.status(201).json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid app settings", error: error.message });
    }
  });

  app.put("/api/app-settings", async (req, res) => {
    try {
      const validatedData = insertAppSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateAppSettings(validatedData);
      if (!settings) {
        return res.status(404).json({ message: "App settings not found" });
      }
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid app settings", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
