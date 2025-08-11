import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatDisplayDate, getQuarterFromDate, getMonthFromDate } from "@/lib/date-utils";
import { ArrowLeft, Building2, Calendar } from "lucide-react";
import { Link } from "wouter";
import type { AttendanceRecord, InsertAttendanceRecord } from "@shared/schema";

export default function LogAttendance() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const selectedDateDisplay = formatDisplayDate(selectedDate);
  const today = formatDate(new Date());

  // Check if selected date's attendance is already logged
  const { data: selectedDateRecord } = useQuery<AttendanceRecord>({
    queryKey: ["/api/attendance/date", selectedDate],
    retry: false,
  });

  // Fetch recent entries
  const { data: recentRecords = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance"],
  });

  const saveAttendanceMutation = useMutation({
    mutationFn: async (data: InsertAttendanceRecord) => {
      if (selectedDateRecord) {
        return apiRequest("PUT", `/api/attendance/${selectedDate}`, data);
      } else {
        return apiRequest("POST", "/api/attendance", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Attendance Saved",
        description: `Office attendance for ${selectedDateDisplay} has been recorded.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/date", selectedDate] });
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
    const selectedDateObj = new Date(selectedDate);
    const data: InsertAttendanceRecord = {
      date: selectedDate,
      location: 'office',
      quarter: getQuarterFromDate(selectedDateObj),
      month: getMonthFromDate(selectedDateObj),
    };

    saveAttendanceMutation.mutate(data);
  };

  // Get the maximum date (today)
  const maxDate = formatDate(new Date());

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
            {selectedDateRecord ? "Update Office Attendance" : "Log Office Attendance"}
          </h2>
          
          {/* Date Selection */}
          <div className="space-y-4 mb-6">
            <Label htmlFor="attendance-date">Select Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                id="attendance-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={maxDate}
                className="pl-10"
                data-testid="input-attendance-date"
              />
            </div>
            <div className="text-center">
              <div className="text-lg font-medium mb-2" data-testid="text-selected-date">
                {selectedDateDisplay}
              </div>
              <div className="text-ios-secondary-label-light dark:text-ios-secondary-label-dark">
                {selectedDate === today ? "Today" : new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
            </div>
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
              : selectedDateRecord 
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
              <p>Start by logging your office attendance!</p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}