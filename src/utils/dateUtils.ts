/**
 * Date and time utilities formatted in Arabic for Study Mate.
 */

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatArabicDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatArabicDateShort(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('ar-EG', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatArabicTime(timeStr: string): string {
  try {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return new Intl.DateTimeFormat('ar-EG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return timeStr;
  }
}

export interface CountdownInfo {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  isImminent: boolean; // within 48 hours
}

export function calculateCountdown(dateStr: string, timeStr = '09:00'): CountdownInfo {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = timeStr.split(':').map(Number);
  const targetDate = new Date(y, m - 1, d, h || 0, min || 0, 0, 0);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      totalMs: diffMs,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      isImminent: false,
    };
  }

  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return {
    totalMs: diffMs,
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    isImminent: diffMs <= 48 * 60 * 60 * 1000,
  };
}

/**
 * Checks if two time intervals overlap on the same date.
 */
export function doSessionsOverlap(
  date1: string,
  start1: string,
  end1: string,
  date2: string,
  start2: string,
  end2: string
): boolean {
  if (date1 !== date2) return false;

  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const s1 = toMins(start1);
  const e1 = toMins(end1);
  const s2 = toMins(start2);
  const e2 = toMins(end2);

  return Math.max(s1, s2) < Math.min(e1, e2);
}

/**
 * Get days for current week (Saturday to Friday in Arabic calendar)
 */
export function getWeekDates(baseDate: Date = new Date()): { dateStr: string; dayName: string; dayNum: number; isToday: boolean }[] {
  const current = new Date(baseDate);
  // In Arab world, week usually starts Saturday (day index 6)
  const day = current.getDay();
  // distance to previous Saturday
  const diffToSaturday = (day + 1) % 7;
  const saturday = new Date(current);
  saturday.setDate(current.getDate() - diffToSaturday);

  const daysList = [];
  const todayStr = getTodayDateString();

  for (let i = 0; i < 7; i++) {
    const d = new Date(saturday);
    d.setDate(saturday.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayOfMonth}`;

    const dayName = new Intl.DateTimeFormat('ar-EG', { weekday: 'short' }).format(d);

    daysList.push({
      dateStr,
      dayName,
      dayNum: d.getDate(),
      isToday: dateStr === todayStr,
    });
  }

  return daysList;
}

export function computeDurationMinutes(startTime: string, endTime: string): number {
  const [h1, m1] = startTime.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  const mins1 = h1 * 60 + m1;
  const mins2 = h2 * 60 + m2;
  return Math.max(0, mins2 - mins1);
}
