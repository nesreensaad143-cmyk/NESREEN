export type Priority = 'low' | 'medium' | 'high';

export const LAW_SUBJECTS = [
  'القانون الدستوري',
  'قانون العقوبات العام',
  'قانون المالية العامة والتشريع الضريبي',
  'أصول البحث القانوني',
] as const;

export type LawSubject = typeof LAW_SUBJECTS[number];

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  priority: Priority;
  notes?: string;
  isCompleted: boolean;
  hasReminder: boolean;
  createdAt: string;
}

export interface Exam {
  id: string;
  subject: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location?: string;
  notes?: string;
  color?: string;
  createdAt: string;
}

export type AlarmTriggerOption =
  | '7_days_before'
  | '3_days_before'
  | '1_day_before'
  | '12_hours_before'
  | '3_hours_before'
  | '1_hour_before'
  | 'exam_morning'
  | 'custom_minutes';

export interface ExamAlarm {
  id: string;
  examId: string;
  subject: string;
  examDate: string;
  examTime: string;
  triggerOption: AlarmTriggerOption;
  customMinutesBefore?: number;
  scheduledTimestamp: number; // UTC ms when it should trigger
  isEnabled: boolean;
  isFired: boolean;
  notes?: string;
}

export type RevisionStatus = 'not_started' | 'in_progress' | 'completed';

export interface RevisionTopic {
  id: string;
  title: string;
  targetDate: string; // YYYY-MM-DD
  estimatedDurationMinutes: number;
  status: RevisionStatus;
  isPastPaper?: boolean; // هل هي حل أسئلة وامتحانات سابقة
}

export interface RevisionPlan {
  id: string;
  subject: string;
  examId?: string;
  startDate: string; // YYYY-MM-DD
  deadlineDate: string; // YYYY-MM-DD
  dailySessionMinutes: number;
  topics: RevisionTopic[];
  notes?: string;
  createdAt: string;
}

export interface DailyTask {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  deadline?: string;
  priority: Priority;
  subject?: string;
  examId?: string;
  revisionPlanId?: string;
  isCompleted: boolean;
  hasReminder: boolean;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  stage: string; // e.g. الثانوية العامة، السنة الجامعية الأولى
  dailyGoalHours: number;
  avatarSeed: string;
  themePreference: 'light' | 'soft-purple';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export type ActiveTab =
  | 'home'
  | 'schedule'
  | 'exams'
  | 'tasks'
  | 'revision'
  | 'alarms'
  | 'calculator'
  | 'progress'
  | 'settings';
