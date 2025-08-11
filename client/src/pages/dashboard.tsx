import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/progress-ring";
import { formatDisplayDate, getCurrentQuarter, getCurrentMonth, getQuarterMonths } from "@/lib/date-utils";
import { Link } from "wouter";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import type { AttendanceRecord, QuarterSettings, AppSettings } from "@shared/schema";

export default function Dashboard() {
  const { theme, setTheme } = useTheme();

  // Fetch current app settings
  const { data: appSettings } = useQuery<AppSettings>({
    queryKey: ["/api/app-settings"],
  });

  const currentQuarter = appSettings?.currentQuarter || getCurrentQuarter();
  const currentMonth = getCurrentMonth();

  // Fetch attendance records for current quarter
  const { data: quarterRecords = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance/quarter", currentQuarter],
  });

  // Fetch quarter settings
  const { data: quarterSettings } = useQuery<QuarterSettings>({
    queryKey: ["/api/quarter-settings", currentQuarter],
  });

  // Fetch monthly records
  const { data: monthRecords = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance/month", currentMonth],
  });

  // Calculate quarter progress
  const calculateQuarterProgress = () => {
    if (!quarterSettings) return { percentage: 0, officeDays: 0, totalDays: 0, target: 0, remaining: 0 };
    
    const totalWorkDays = quarterSettings.month1WorkDays + quarterSettings.month2WorkDays + quarterSettings.month3WorkDays;
    const officeDays = quarterRecords.filter(r => r.location === 'office').length;
    const target = Math.ceil(totalWorkDays * 0.5);
    const remaining = Math.max(0, target - officeDays);
    const percentage = totalWorkDays > 0 ? (officeDays / totalWorkDays) * 100 : 0;

    return { percentage, officeDays, totalDays: totalWorkDays, target, remaining };
  };

  // Calculate month progress
  const calculateMonthProgress = () => {
    if (!quarterSettings) return { percentage: 0, officeDays: 0, workDays: 0, target: 0 };
    
    const quarterMonths = getQuarterMonths(currentQuarter);
    const currentMonthIndex = quarterMonths.indexOf(currentMonth);
    
    let workDays = 0;
    if (currentMonthIndex === 0) workDays = quarterSettings.month1WorkDays;
    else if (currentMonthIndex === 1) workDays = quarterSettings.month2WorkDays;
    else if (currentMonthIndex === 2) workDays = quarterSettings.month3WorkDays;
    
    const officeDays = monthRecords.filter(r => r.location === 'office').length;
    const target = Math.ceil(workDays * 0.5);
    const percentage = workDays > 0 ? (officeDays / workDays) * 100 : 0;

    return { percentage, officeDays, workDays, target };
  };

  const quarterProgress = calculateQuarterProgress();
  const monthProgress = calculateMonthProgress();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getStatusMessage = () => {
    const diff = quarterProgress.percentage - 50;
    if (diff >= 10) return { text: `${Math.round(diff)}% ahead of target`, color: "text-ios-green" };
    if (diff > 0) return { text: `${Math.round(diff)}% ahead of target`, color: "text-ios-green" };
    if (diff > -10) return { text: `${Math.round(Math.abs(diff))}% behind target`, color: "text-ios-orange" };
    return { text: `${Math.round(Math.abs(diff))}% behind target`, color: "text-ios-red" };
  };

  const status = getStatusMessage();

  return (
    <div className="min-h-screen">
      {/* Status Bar Spacer */}
      <div className="h-safe-top bg-transparent"></div>
      
      {/* Navigation Bar */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-safe-top z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold font-display">Office Tracker</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="p-2 -m-2"
              data-testid="button-toggle-theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Quick Action Button */}
        <Link href="/log">
          <Button 
            className="w-full bg-ios-blue hover:bg-ios-blue/90 text-white py-4 rounded-2xl font-semibold ios-button smooth-transition"
            data-testid="button-log-attendance"
          >
            Log Office Attendance
          </Button>
        </Link>

        {/* Monthly Breakdown */}
        <Card className="ios-card p-6">
          <h3 className="text-lg font-semibold mb-4 font-display" data-testid="text-current-month">
            {currentMonth.replace('-', ' ')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-ios-secondary-label-light dark:text-ios-secondary-label-dark">Work Days</span>
              <span className="font-medium" data-testid="text-month-work-days">{monthProgress.workDays}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ios-secondary-label-light dark:text-ios-secondary-label-dark">Days in Office</span>
              <span className="font-medium text-ios-green" data-testid="text-month-office-days">{monthProgress.officeDays}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ios-secondary-label-light dark:text-ios-secondary-label-dark">Target (50%)</span>
              <span className="font-medium" data-testid="text-month-target">{monthProgress.target}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-ios-green rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, monthProgress.percentage)}%` }}
                data-testid="progress-month"
              />
            </div>
            <div className="text-center">
              <span className={`text-sm font-medium ${monthProgress.officeDays >= monthProgress.target ? 'text-ios-green' : 'text-ios-orange'}`}>
                {monthProgress.officeDays >= monthProgress.target 
                  ? `${monthProgress.officeDays - monthProgress.target} days ahead this month`
                  : `${monthProgress.target - monthProgress.officeDays} days behind this month`
                }
              </span>
            </div>
          </div>
        </Card>

        {/* Quarterly Progress Card */}
        <Card className="ios-card p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 font-display" data-testid="text-quarter">
              {currentQuarter.replace('-', ' ')} Progress
            </h2>
            <div className="flex justify-center mb-4">
              <ProgressRing progress={quarterProgress.percentage} />
            </div>
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-ios-green rounded-full"></div>
              <span className={`text-sm font-medium ${status.color}`} data-testid="text-status">
                {status.text}
              </span>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="ios-card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" data-testid="text-office-days">
                {quarterProgress.officeDays}
              </div>
              <div className="text-xs text-ios-secondary-label-light dark:text-ios-secondary-label-dark">
                Days in Office
              </div>
            </div>
          </Card>
          <Card className="ios-card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" data-testid="text-total-days">
                {quarterProgress.totalDays}
              </div>
              <div className="text-xs text-ios-secondary-label-light dark:text-ios-secondary-label-dark">
                Total Work Days
              </div>
            </div>
          </Card>
          <Card className="ios-card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1 text-ios-orange" data-testid="text-remaining-days">
                {Math.max(0, quarterProgress.totalDays - quarterRecords.length)}
              </div>
              <div className="text-xs text-ios-secondary-label-light dark:text-ios-secondary-label-dark">
                Days Remaining
              </div>
            </div>
          </Card>
          <Card className="ios-card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1 text-ios-blue" data-testid="text-target-days">
                {quarterProgress.remaining}
              </div>
              <div className="text-xs text-ios-secondary-label-light dark:text-ios-secondary-label-dark">
                Still Need
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Link href="/history">
              <Button 
                variant="secondary"
                className="w-full py-3 rounded-xl font-medium ios-button smooth-transition"
                data-testid="button-history"
              >
                View History
              </Button>
            </Link>
            <Link href="/settings">
              <Button 
                variant="secondary"
                className="w-full py-3 rounded-xl font-medium ios-button smooth-transition"
                data-testid="button-settings"
              >
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
