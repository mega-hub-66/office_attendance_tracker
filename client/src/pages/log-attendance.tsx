import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatDisplayDate, getCurrentQuarter, getCurrentMonth } from "@/lib/date-utils";
import { ArrowLeft, Building2, Home, Sun } from "lucide-react";
import { Link } from "wouter";
import type { AttendanceRecord, InsertAttendanceRecord } from "@shared/schema";

type LocationType = 'office' | 'home' | 'dayoff';

const locationOptions = [
  {
    value: 'office' as LocationType,
    label: 'Office',
    icon: Building2,
    color: 'border-ios-blue bg-ios-blue/10 text-ios-blue',
  },
  {
    value: 'home' as LocationType,
    label: 'Home',
    icon: Home,
    color: 'border-gray-300 dark:border-gray-600',
  },
  {
    value: 'dayoff' as LocationType,
    label: 'Day Off',
    icon: Sun,
    color: 'border-gray-300 dark:border-gray-600',
  },
];

export default function LogAttendance() {
  const [selectedLocation, setSelectedLocation] = useState<LocationType>('office');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const today = formatDate(new Date());
  const todayDisplay = formatDisplayDate(today);

  // Check if today's attendance is already logged
  const { data: todayRecord } = useQuery<AttendanceRecord>({
    queryKey: ["/api/attendance/date", today],
    retry: false,
  });

  // Fetch recent entries
  const { data: recentRecords = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance"],
  });

  const saveAttendanceMutation = useMutation({
    mutationFn: async (data: InsertAttendanceRecord) => {
      if (todayRecord) {
        return apiRequest("PUT", `/api/attendance/${today}`, data);
      } else {
        return apiRequest("POST", "/api/attendance", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Attendance Saved",
        description: `Your attendance for ${todayDisplay} has been recorded.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/date", today] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/quarter"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/month"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveAttendance = () => {
    const data: InsertAttendanceRecord = {
      date: today,
      location: selectedLocation,
      quarter: getCurrentQuarter(),
      month: getCurrentMonth(),
    };

    saveAttendanceMutation.mutate(data);
  };

  // Set initial selection based on existing record
  if (todayRecord && selectedLocation !== todayRecord.location) {
    setSelectedLocation(todayRecord.location as LocationType);
  }

  const getLocationColor = (location: string) => {
    switch (location) {
      case 'office': return 'bg-ios-blue';
      case 'home': return 'bg-ios-orange';
      case 'dayoff': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getLocationLabel = (location: string) => {
    switch (location) {
      case 'office': return 'Office';
      case 'home': return 'Home';
      case 'dayoff': return 'Day Off';
      default: return location;
    }
  };

  // Get recent entries (last 10)
  const recentEntries = recentRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

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
            <h1 className="text-lg font-semibold font-display">Log Attendance</h1>
            <div className="w-10" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Log Attendance Card */}
        <Card className="ios-card p-6">
          <h2 className="text-xl font-bold mb-6 text-center font-display">
            {todayRecord ? "Update Today's Attendance" : "Log Today's Attendance"}
          </h2>
          <div className="text-center mb-6">
            <div className="text-lg font-medium mb-2" data-testid="text-today-date">{todayDisplay}</div>
            <div className="text-ios-secondary-label-light dark:text-ios-secondary-label-dark">
              Choose your work location
            </div>
          </div>
          
          {/* Location Options */}
          <div className="space-y-4 mb-8">
            {locationOptions.map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                onClick={() => setSelectedLocation(value)}
                className={`w-full p-4 border-2 rounded-2xl ios-button smooth-transition ${
                  selectedLocation === value 
                    ? 'border-ios-blue bg-ios-blue/10 text-ios-blue' 
                    : color
                }`}
                data-testid={`button-location-${value}`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <Icon className="w-6 h-6" />
                  <span className="text-lg font-semibold">{label}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Save Button */}
          <Button
            onClick={handleSaveAttendance}
            disabled={saveAttendanceMutation.isPending}
            className="w-full bg-ios-blue hover:bg-ios-blue/90 text-white py-4 rounded-2xl font-semibold ios-button smooth-transition"
            data-testid="button-save-attendance"
          >
            {saveAttendanceMutation.isPending 
              ? "Saving..." 
              : todayRecord 
                ? "Update Attendance" 
                : "Save Attendance"
            }
          </Button>
        </Card>
        
        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <Card className="ios-card p-6">
            <h3 className="text-lg font-semibold mb-4 font-display">Recent Entries</h3>
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <div 
                  key={entry.date} 
                  className="flex justify-between items-center py-2"
                  data-testid={`entry-${entry.date}`}
                >
                  <div>
                    <div className="font-medium">{formatDisplayDate(entry.date)}</div>
                    <div className="text-sm text-ios-secondary-label-light dark:text-ios-secondary-label-dark">
                      {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getLocationColor(entry.location)}`}></div>
                    <span className="font-medium">{getLocationLabel(entry.location)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {recentEntries.length === 0 && (
          <Card className="ios-card p-6">
            <div className="text-center text-ios-secondary-label-light dark:text-ios-secondary-label-dark">
              <p>No attendance records yet.</p>
              <p>Start by logging today's attendance!</p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
