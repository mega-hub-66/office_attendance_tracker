export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getQuarterFromDate(date: Date): string {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  if (month <= 3) return `Q1-${year}`;
  if (month <= 6) return `Q2-${year}`;
  if (month <= 9) return `Q3-${year}`;
  return `Q4-${year}`;
}

export function getMonthFromDate(date: Date): string {
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${monthName}-${year}`;
}

export function getCurrentQuarter(): string {
  return getQuarterFromDate(new Date());
}

export function getCurrentMonth(): string {
  return getMonthFromDate(new Date());
}

export function getQuarterMonths(quarter: string): string[] {
  const [q, year] = quarter.split('-');
  const yearNum = parseInt(year);
  
  switch (q) {
    case 'Q1':
      return [`January-${yearNum}`, `February-${yearNum}`, `March-${yearNum}`];
    case 'Q2':
      return [`April-${yearNum}`, `May-${yearNum}`, `June-${yearNum}`];
    case 'Q3':
      return [`July-${yearNum}`, `August-${yearNum}`, `September-${yearNum}`];
    case 'Q4':
      return [`October-${yearNum}`, `November-${yearNum}`, `December-${yearNum}`];
    default:
      return [];
  }
}

export function isWorkDay(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5; // Monday to Friday
}

export function getWorkDaysInMonth(year: number, month: number): number {
  const date = new Date(year, month, 1);
  let workDays = 0;
  
  while (date.getMonth() === month) {
    if (isWorkDay(date)) {
      workDays++;
    }
    date.setDate(date.getDate() + 1);
  }
  
  return workDays;
}
