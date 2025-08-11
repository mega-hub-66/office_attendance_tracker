import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { getCurrentQuarter, getQuarterMonths } from "@/lib/date-utils";
import type { AttendanceRecord, QuarterSettings } from "@shared/schema";

const availableQuarters = [
  "Q4-2027", "Q3-2027", "Q2-2027", "Q1-2027",
  "Q4-2026", "Q3-2026", "Q2-2026", "Q1-2026",
  "Q4-2025", "Q3-2025", "Q2-2025", "Q1-2025"
];

export default function History() {
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter());

  // Fetch attendance records for selected quarter
  const { data: quarterRecords = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance/quarter", selectedQuarter],
  });

  // Fetch quarter settings
  const { data: quarterSettings } = useQuery<QuarterSettings>({
    queryKey: ["/api/quarter-settings", selectedQuarter],
  });

  const getMonthlyStats = () => {
    if (!quarterSettings) return [];

    const months = getQuarterMonths(selectedQuarter);
    const workDays = [
      quarterSettings.month1WorkDays,
      quarterSettings.month2WorkDays,
      quarterSettings.month3WorkDays,
    ];

    return months.map((month, index) => {
      const monthRecords = quarterRecords.filter(r => r.month === month);
      const officeDays = monthRecords.filter(r => r.location === 'office').length;
      const percentage = workDays[index] > 0 ? (officeDays / workDays[index]) * 100 : 0;

      return {
        month,
        officeDays,
        workDays: workDays[index],
        percentage,
        records: monthRecords,
      };
    });
  };

  const calculateQuarterlySummary = () => {
    if (!quarterSettings) return { percentage: 0, officeDays: 0, totalDays: 0, aboveTarget: 0 };

    const totalWorkDays = quarterSettings.month1WorkDays + quarterSettings.month2WorkDays + quarterSettings.month3WorkDays;
    const officeDays = quarterRecords.filter(r => r.location === 'office').length;
    const percentage = totalWorkDays > 0 ? (officeDays / totalWorkDays) * 100 : 0;
    const target = Math.ceil(totalWorkDays * 0.5);
    const aboveTarget = officeDays - target;

    return { percentage, officeDays, totalDays: totalWorkDays, aboveTarget };
  };

  const monthlyStats = getMonthlyStats();
  const quarterlySummary = calculateQuarterlySummary();

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 50) return "text-ios-green";
    if (percentage >= 40) return "text-ios-orange";
    return "text-ios-red";
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 50) return "bg-ios-green";
    if (percentage >= 40) return "bg-ios-orange";
    return "bg-ios-red";
  };

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
            <h1 className="text-lg font-semibold font-display">History</h1>
            <div className="w-10" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* History Card */}
        <Card className="ios-card p-6">
          <h2 className="text-xl font-bold mb-4 font-display">Quarterly History</h2>
          
          {/* Quarter Selector */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            {availableQuarters.map((quarter) => (
              <button
                key={quarter}
                onClick={() => setSelectedQuarter(quarter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ios-button smooth-transition ${
                  selectedQuarter === quarter
                    ? "bg-ios-blue text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-ios-secondary-label-light dark:text-ios-secondary-label-dark"
                }`}
                data-testid={`button-quarter-${quarter}`}
              >
                {quarter.replace('-', ' ')}
              </button>
            ))}
          </div>
          
          {/* Monthly Breakdown */}
          <div className="space-y-4">
            {monthlyStats.map((month) => (
              <div 
                key={month.month} 
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl"
                data-testid={`month-${month.month}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">{month.month.replace('-', ' ')}</h4>
                  <span className={`font-bold ${getPercentageColor(month.percentage)}`}>
                    {Math.round(month.percentage)}%
                  </span>
                </div>
                <div className="text-sm text-ios-secondary-label-light dark:text-ios-secondary-label-dark mb-2">
                  {month.officeDays} of {month.workDays} work days in office
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getProgressBarColor(month.percentage)}`}
                    style={{ width: `${Math.min(100, month.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Summary Stats */}
        <Card className="ios-card p-6">
          <h3 className="text-lg font-semibold mb-4 font-display">
            {selectedQuarter.replace('-', ' ')} Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${getPercentageColor(quarterlySummary.percentage)}`}>
                {Math.round(quarterlySummary.percentage)}%
              </div>
              <div className="text-xs text-ios-secondary-label-light dark:text-ios-secondary-label-dark">
                Overall Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" data-testid="text-summary-office-days">
                {quarterlySummary.officeDays}
              </div>
              <div className="text-xs text-ios-secondary-label-light dark:text-ios-secondary-label-dark">
                Office Days
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" data-testid="text-summary-total-days">
                {quarterlySummary.totalDays}
              </div>
              <div className="text-xs text-ios-secondary-label-light dark:text-ios-secondary-label-dark">
                Total Days
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${quarterlySummary.aboveTarget >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                {quarterlySummary.aboveTarget >= 0 ? '+' : ''}{quarterlySummary.aboveTarget}
              </div>
              <div className="text-xs text-ios-secondary-label-light dark:text-ios-secondary-label-dark">
                {quarterlySummary.aboveTarget >= 0 ? 'Above Target' : 'Below Target'}
              </div>
            </div>
          </div>
        </Card>

        {/* No Data State */}
        {quarterRecords.length === 0 && (
          <Card className="ios-card p-6">
            <div className="text-center text-ios-secondary-label-light dark:text-ios-secondary-label-dark">
              <p>No attendance data for {selectedQuarter.replace('-', ' ')}.</p>
              <p className="mt-2">Start logging your attendance to see history.</p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
