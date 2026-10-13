import { AlarmTriggerOption, ExamAlarm } from '../types';

export async function requestNotificationPermission(): Promise<'granted' | 'denied' | 'default'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

export function getNotificationPermissionStatus(): 'granted' | 'denied' | 'default' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export function showSystemNotification(title: string, options?: NotificationOptions) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch {
      // In some environments, Notification constructor fails
    }
  }
}

/**
 * Computes timestamp for a given exam trigger option
 */
export function calculateAlarmTimestamp(
  examDateStr: string,
  examTimeStr: string,
  trigger: AlarmTriggerOption,
  customMinutes = 60
): number {
  const [y, m, d] = examDateStr.split('-').map(Number);
  const [h, min] = examTimeStr.split(':').map(Number);
  const examDate = new Date(y, m - 1, d, h || 9, min || 0, 0, 0);
  const examMs = examDate.getTime();

  switch (trigger) {
    case '7_days_before':
      return examMs - 7 * 24 * 60 * 60 * 1000;
    case '3_days_before':
      return examMs - 3 * 24 * 60 * 60 * 1000;
    case '1_day_before':
      return examMs - 24 * 60 * 60 * 1000;
    case '12_hours_before':
      return examMs - 12 * 60 * 60 * 1000;
    case '3_hours_before':
      return examMs - 3 * 60 * 60 * 1000;
    case '1_hour_before':
      return examMs - 60 * 60 * 1000;
    case 'exam_morning': {
      // Same day at 07:00 AM
      const morning = new Date(y, m - 1, d, 7, 0, 0, 0);
      return morning.getTime();
    }
    case 'custom_minutes':
      return examMs - customMinutes * 60 * 1000;
    default:
      return examMs - 24 * 60 * 60 * 1000;
  }
}

export function getTriggerLabelArabic(trigger: AlarmTriggerOption, customMins?: number): string {
  switch (trigger) {
    case '7_days_before':
      return 'قبل الامتحان بـ 7 أيام';
    case '3_days_before':
      return 'قبل الامتحان بـ 3 أيام';
    case '1_day_before':
      return 'قبل الامتحان بيوم واحد (24 ساعة)';
    case '12_hours_before':
      return 'قبل الامتحان بـ 12 ساعة';
    case '3_hours_before':
      return 'قبل الامتحان بـ 3 ساعات';
    case '1_hour_before':
      return 'قبل الامتحان بساعة واحدة';
    case 'exam_morning':
      return 'صباح يوم الامتحان (الساعة 7:00 صباحاً)';
    case 'custom_minutes':
      return `قبل الامتحان بـ ${customMins || 60} دقيقة`;
    default:
      return 'تنبيه مخصص';
  }
}
