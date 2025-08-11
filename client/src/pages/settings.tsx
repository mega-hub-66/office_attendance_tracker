import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { getCurrentQuarter } from "@/lib/date-utils";
import type { AppSettings, QuarterSettings, InsertQuarterSettings, InsertAppSettings } from "@shared/schema";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for form values
  const [currentQuarter, setCurrentQuarter] = useState("Q1");
  const [currentYear, setCurrentYear] = useState("2024");
  const [month1WorkDays, setMonth1WorkDays] = useState(22);
  const [month2WorkDays, setMonth2WorkDays] = useState(20);
  const [month3WorkDays, setMonth3WorkDays] = useState(21);
  const [darkMode, setDarkMode] = useState(theme === "dark");
  const [notifications, setNotifications] = useState(true);

  // Fetch current app settings
  const { data: appSettings } = useQuery<AppSettings>({
    queryKey: ["/api/app-settings"],
  });

  // Fetch current quarter settings
  const selectedQuarterKey = `${currentQuarter}-${currentYear}`;
  const { data: quarterSettings } = useQuery<QuarterSettings>({
    queryKey: ["/api/quarter-settings", selectedQuarterKey],
  });

  // Initialize form values from fetched data
  useEffect(() => {
    if (appSettings) {
      const [q, y] = appSettings.currentQuarter.split('-');
      setCurrentQuarter(q);
      setCurrentYear(y);
      setNotifications(appSettings.notifications);
    }
  }, [appSettings]);

  useEffect(() => {
    if (quarterSettings) {
      setMonth1WorkDays(quarterSettings.month1WorkDays);
      setMonth2WorkDays(quarterSettings.month2WorkDays);
      setMonth3WorkDays(quarterSettings.month3WorkDays);
    }
  }, [quarterSettings]);

  useEffect(() => {
    setDarkMode(theme === "dark");
  }, [theme]);

  // Save quarter settings mutation
  const saveQuarterSettingsMutation = useMutation({
    mutationFn: async (data: InsertQuarterSettings) => {
      if (quarterSettings) {
        return apiRequest("PUT", `/api/quarter-settings/${selectedQuarterKey}`, data);
      } else {
        return apiRequest("POST", "/api/quarter-settings", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quarter-settings"] });
    },
  });

  // Save app settings mutation
  const saveAppSettingsMutation = useMutation({
    mutationFn: async (data: InsertAppSettings) => {
      if (appSettings) {
        return apiRequest("PUT", "/api/app-settings", data);
      } else {
        return apiRequest("POST", "/api/app-settings", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/app-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
    },
  });

  // Reset all data mutation
  const resetDataMutation = useMutation({
    mutationFn: async () => {
      // Delete all attendance records
      const attendanceRecords = await fetch("/api/attendance").then(r => r.json());
      for (const record of attendanceRecords) {
        await apiRequest("DELETE", `/api/attendance/${record.date}`, undefined);
      }
    },
    onSuccess: () => {
      toast({
        title: "Data Reset",
        description: "All attendance data has been cleared.",
      });
      queryClient.invalidateQueries();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = async () => {
    try {
      // Save quarter settings
      const quarterData: InsertQuarterSettings = {
        quarter: selectedQuarterKey,
        year: parseInt(currentYear),
        month1WorkDays,
        month2WorkDays,
        month3WorkDays,
      };
      await saveQuarterSettingsMutation.mutateAsync(quarterData);

      // Save app settings
      const appData: InsertAppSettings = {
        currentQuarter: selectedQuarterKey,
        darkMode,
        notifications,
      };
      await saveAppSettingsMutation.mutateAsync(appData);

      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    setTheme(checked ? "dark" : "light");
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all data? This action cannot be undone.")) {
      resetDataMutation.mutate();
    }
  };

  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const years = ["2024", "2023", "2022", "2021"];

  return (
    <div className="min-h-screen">
      {/* Status Bar Spacer */}
      <div className="h-safe-top bg-transparent"></div>
      
      {/* Navigation Bar */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-safe-top z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold font-display">Settings</h1>
            <div className="w-10" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Settings Card */}
        <Card className="ios-card p-6">
          <h2 className="text-xl font-bold mb-6 font-display">Settings</h2>
          
          {/* Quarter Configuration */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Current Quarter</h3>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="quarter">Quarter</Label>
                  <Select value={currentQuarter} onValueChange={setCurrentQuarter}>
                    <SelectTrigger className="mt-1" data-testid="select-quarter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {quarters.map((q) => (
                        <SelectItem key={q} value={q}>{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="year">Year</Label>
                  <Select value={currentYear} onValueChange={setCurrentYear}>
                    <SelectTrigger className="mt-1" data-testid="select-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Work Days Configuration */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Work Days Configuration</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="month1">Month 1 Work Days</Label>
                  <Input
                    id="month1"
                    type="number"
                    value={month1WorkDays}
                    onChange={(e) => setMonth1WorkDays(parseInt(e.target.value) || 0)}
                    className="w-16 text-center"
                    min="0"
                    max="31"
                    data-testid="input-month1-days"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="month2">Month 2 Work Days</Label>
                  <Input
                    id="month2"
                    type="number"
                    value={month2WorkDays}
                    onChange={(e) => setMonth2WorkDays(parseInt(e.target.value) || 0)}
                    className="w-16 text-center"
                    min="0"
                    max="31"
                    data-testid="input-month2-days"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="month3">Month 3 Work Days</Label>
                  <Input
                    id="month3"
                    type="number"
                    value={month3WorkDays}
                    onChange={(e) => setMonth3WorkDays(parseInt(e.target.value) || 0)}
                    className="w-16 text-center"
                    min="0"
                    max="31"
                    data-testid="input-month3-days"
                  />
                </div>
              </div>
            </div>
            
            {/* Appearance */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Appearance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={handleDarkModeToggle}
                    data-testid="switch-dark-mode"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Notifications</Label>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                    data-testid="switch-notifications"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            disabled={saveQuarterSettingsMutation.isPending || saveAppSettingsMutation.isPending}
            className="w-full bg-ios-blue hover:bg-ios-blue/90 text-white py-4 rounded-2xl font-semibold mt-6 ios-button smooth-transition"
            data-testid="button-save-settings"
          >
            {(saveQuarterSettingsMutation.isPending || saveAppSettingsMutation.isPending)
              ? "Saving..."
              : "Save Settings"
            }
          </Button>
        </Card>
        
        {/* App Info Card */}
        <Card className="ios-card p-6">
          <h3 className="text-lg font-semibold mb-4 font-display">About</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ios-secondary-label-light dark:text-ios-secondary-label-dark">Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ios-secondary-label-light dark:text-ios-secondary-label-dark">Data Storage</span>
              <span>Local Device</span>
            </div>
            <Button
              onClick={handleResetData}
              disabled={resetDataMutation.isPending}
              variant="outline"
              className="w-full mt-4 py-3 border-ios-red text-ios-red hover:bg-ios-red hover:text-white rounded-xl font-medium ios-button smooth-transition"
              data-testid="button-reset-data"
            >
              {resetDataMutation.isPending ? "Resetting..." : "Reset All Data"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
