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
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();
  
  // Fiscal year: Q1=Feb,Mar,Apr Q2=May,Jun,Jul Q3=Aug,Sep,Oct Q4=Nov,Dec,Jan
  if (month >= 2 && month <= 4) return `Q1-${year}`;
  if (month >= 5 && month <= 7) return `Q2-${year}`;
  if (month >= 8 && month <= 10) return `Q3-${year}`;
  // November and December belong to Q4 of current year, January belongs to Q4 of previous year
  if (month >= 11 && month <= 12) return `Q4-${year}`;
  if (month === 1) return `Q4-${year - 1}`;
  
  return `Q1-${year}`; // fallback
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
      return [`February-${yearNum}`, `March-${yearNum}`, `April-${yearNum}`];
    case 'Q2':
      return [`May-${yearNum}`, `June-${yearNum}`, `July-${yearNum}`];
    case 'Q3':
      return [`August-${yearNum}`, `September-${yearNum}`, `October-${yearNum}`];
    case 'Q4':
      // Q4 spans November-December of current year and January of next year
      return [`November-${yearNum}`, `December-${yearNum}`, `January-${yearNum + 1}`];
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
