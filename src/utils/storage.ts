import { DailyTask, Exam, ExamAlarm, RevisionPlan, StudySession, UserProfile } from '../types';
import { calculateAlarmTimestamp } from './notifications';

export const STORAGE_KEYS = {
  USER_PROFILE: 'studymate_user_profile',
  SESSIONS: 'studymate_study_sessions',
  EXAMS: 'studymate_exams',
  ALARMS: 'studymate_alarms',
  REVISION_PLANS: 'studymate_revision_plans',
  TASKS: 'studymate_daily_tasks',
  HAS_ONBOARDED: 'studymate_has_onboarded',
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'طالب الحقوق',
  stage: 'كلية الحقوق – شعبة القانون العام',
  dailyGoalHours: 5,
  avatarSeed: 'law_student',
  themePreference: 'light',
  notificationsEnabled: true,
  soundEnabled: true,
};

// Generate realistic near-future dates for high quality demo
function getRelativeDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateSampleData() {
  const today = getRelativeDateStr(0);
  const tomorrow = getRelativeDateStr(1);
  const in3Days = getRelativeDateStr(3);
  const in6Days = getRelativeDateStr(6);
  const in10Days = getRelativeDateStr(10);
  const in14Days = getRelativeDateStr(14);

  const sampleExams: Exam[] = [
    {
      id: 'exam-constitutional',
      subject: 'القانون الدستوري',
      date: in3Days,
      time: '09:00',
      location: 'مدرج د. السنهوري - الدور الأرضي',
      notes: 'مراجعة مبدأ سمو الدستور، الرقابة القضائية على دستورية القوانين، ونظام الحكم البرلماني والرئاسي، ودستور الدولة.',
      color: '#7c3aed',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exam-penal',
      subject: 'قانون العقوبات العام',
      date: in6Days,
      time: '09:30',
      location: 'مدرج 2 - كلية الحقوق',
      notes: 'التركيز على النظرية العامة للجريمة (الركن المادي والمعنوي)، القصد الجنائي، أسباب الإباحة (الدفاع الشرعي)، وتطبيقات القضايا.',
      color: '#9333ea',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exam-finance',
      subject: 'قانون المالية العامة والتشريع الضريبي',
      date: in10Days,
      time: '10:00',
      location: 'قاعة 4B - مبنى القانون العام',
      notes: 'الموازنة العامة للدولة (قواعدها واعتمادها)، النفقات العامة، وعاء الضريبة والازدواج الضريبي والضريبة على الدخل والقيمة المضافة.',
      color: '#6366f1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exam-research',
      subject: 'أصول البحث القانوني',
      date: in14Days,
      time: '11:00',
      location: 'قاعة السيمينار والبحوث القانونية',
      notes: 'مناهج البحث القانوني (الوصفي، المقارن، التحليلي)، قواعد التوثيق العلمي في الهوامش، استخراج المراجع الفقهية وقرارات المحاكم العليا.',
      color: '#2563eb',
      createdAt: new Date().toISOString(),
    },
  ];

  const sampleSessions: StudySession[] = [
    {
      id: 'session-law-1',
      subject: 'قانون العقوبات العام',
      topic: 'الركن المادي للجريمة (السلوك، النتيجة، علاقة السببية)',
      date: today,
      startTime: '14:00',
      endTime: '16:00',
      durationMinutes: 120,
      priority: 'high',
      notes: 'دراسة تطبيقات محكمة النقض بشأن معيار علاقة السببية والشروع في الجريمة.',
      isCompleted: true,
      hasReminder: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'session-law-2',
      subject: 'القانون الدستوري',
      topic: 'أنواع الرقابة على دستورية القوانين (الامتناع مقابل الإلغاء)',
      date: today,
      startTime: '16:30',
      endTime: '18:00',
      durationMinutes: 90,
      priority: 'high',
      notes: 'مقارنة بين النموذج الأمريكي في الرقابة والنموذج الأوروبي ومحكمة الدستورية العليا.',
      isCompleted: false,
      hasReminder: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'session-law-3',
      subject: 'قانون المالية العامة والتشريع الضريبي',
      topic: 'مبادئ الموازنة العامة (السنوية، الشمول، العمومية، الوحدة)',
      date: tomorrow,
      startTime: '10:00',
      endTime: '11:45',
      durationMinutes: 105,
      priority: 'medium',
      notes: 'فهم الاستثناءات الواردة على مبدأ سنوية الموازنة والاعتمادات الإضافية.',
      isCompleted: false,
      hasReminder: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'session-law-4',
      subject: 'أصول البحث القانوني',
      topic: 'قواعد صياغة الإشكالية القانونية وتوثيق أحكام القضاء في الهوامش',
      date: tomorrow,
      startTime: '15:00',
      endTime: '16:30',
      durationMinutes: 90,
      priority: 'medium',
      notes: 'تطبيق عملي على تهميش الأحكام القضائية والمؤلفات الفقهية العامة والخاصة.',
      isCompleted: false,
      hasReminder: false,
      createdAt: new Date().toISOString(),
    },
  ];

  const sampleTasks: DailyTask[] = [
    {
      id: 'task-law-1',
      title: 'تلخيص أسباب الإباحة (الدفاع الشرعي وأداء الواجب القانوني)',
      description: 'كتابة جدول مقارن لشروط الدفاع الشرعي والقيود المفروضة عليه في قانون العقوبات',
      date: today,
      time: '13:30',
      priority: 'high',
      subject: 'قانون العقوبات العام',
      isCompleted: true,
      hasReminder: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-law-2',
      title: 'حل وتكييف قضية دستورية عملية بشأن مدى دستورية قانون ذي أثر رجعي',
      description: 'كتابة المذكرة القانونية بالتكييف السليم مستنداً إلى نصوص الدستور وأحكام المحكمة الدستورية',
      date: today,
      time: '19:00',
      priority: 'high',
      subject: 'القانون الدستوري',
      isCompleted: false,
      hasReminder: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-law-3',
      title: 'مراجعة الفرق بين الرسم والضريبة والثمن العام',
      description: 'مراجعة المعايير الفقهية للتمييز بين الموارد المالية العامة للدولة',
      date: today,
      time: '21:00',
      priority: 'medium',
      subject: 'قانون المالية العامة والتشريع الضريبي',
      isCompleted: false,
      hasReminder: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-law-4',
      title: 'إعداد خطة بحث نموذجية ومقدمة بحث في مسألة قانونية عامة',
      description: 'تطبيق قواعد المنهج التحليلي وصياغة خطة ثنائية (مبحثين ومطلبين)',
      date: tomorrow,
      time: '17:00',
      priority: 'medium',
      subject: 'أصول البحث القانوني',
      isCompleted: false,
      hasReminder: false,
      createdAt: new Date().toISOString(),
    },
  ];

  const sampleAlarms: ExamAlarm[] = [
    {
      id: 'alarm-law-1',
      examId: 'exam-constitutional',
      subject: 'القانون الدستوري',
      examDate: in3Days,
      examTime: '09:00',
      triggerOption: '1_day_before',
      scheduledTimestamp: calculateAlarmTimestamp(in3Days, '09:00', '1_day_before'),
      isEnabled: true,
      isFired: false,
      notes: 'تذكير: المراجعة النهائية لمذكرات القانون الدستوري والنظم السياسية',
    },
    {
      id: 'alarm-law-2',
      examId: 'exam-constitutional',
      subject: 'القانون الدستوري',
      examDate: in3Days,
      examTime: '09:00',
      triggerOption: 'exam_morning',
      scheduledTimestamp: calculateAlarmTimestamp(in3Days, '09:00', 'exam_morning'),
      isEnabled: true,
      isFired: false,
      notes: 'الاستيقاظ والتوجه إلى مدرج د. السنهوري قبل موعد اللجنة بنصف ساعة',
    },
    {
      id: 'alarm-law-3',
      examId: 'exam-penal',
      subject: 'قانون العقوبات العام',
      examDate: in6Days,
      examTime: '09:30',
      triggerOption: '3_days_before',
      scheduledTimestamp: calculateAlarmTimestamp(in6Days, '09:30', '3_days_before'),
      isEnabled: true,
      isFired: false,
      notes: 'بدء حل النماذج الشاملة وتكييف القضايا الجنائية',
    },
  ];

  const samplePlans: RevisionPlan[] = [
    {
      id: 'plan-law-constitutional',
      subject: 'القانون الدستوري',
      examId: 'exam-constitutional',
      startDate: today,
      deadlineDate: in3Days,
      dailySessionMinutes: 120,
      createdAt: new Date().toISOString(),
      notes: 'خطة المراجعة المركزة للقانون الدستوري والنظم السياسية المقارنة',
      topics: [
        {
          id: 'topic-const-1',
          title: 'الباب الأول: النظرية العامة للدولة وأركانها وسيادتها',
          targetDate: today,
          estimatedDurationMinutes: 80,
          status: 'completed',
        },
        {
          id: 'topic-const-2',
          title: 'الباب الثاني: نشأة الدساتير وتعديلها ونهايتها ومبدأ سمو الدستور',
          targetDate: getRelativeDateStr(1),
          estimatedDurationMinutes: 90,
          status: 'in_progress',
        },
        {
          id: 'topic-const-3',
          title: 'الباب الثالث: صور الرقابة على دستورية القوانين والنظم السياسية المعاصرة',
          targetDate: getRelativeDateStr(2),
          estimatedDurationMinutes: 90,
          status: 'not_started',
        },
        {
          id: 'topic-const-4',
          title: 'حل أسئلة وقضايا الامتحانات السابقة في القانون الدستوري (2022 - 2025)',
          targetDate: getRelativeDateStr(2),
          estimatedDurationMinutes: 120,
          status: 'not_started',
          isPastPaper: true,
        },
      ],
    },
    {
      id: 'plan-law-penal',
      subject: 'قانون العقوبات العام',
      examId: 'exam-penal',
      startDate: today,
      deadlineDate: in6Days,
      dailySessionMinutes: 100,
      createdAt: new Date().toISOString(),
      notes: 'خطة مراجعة النظرية العامة للجريمة والعقوبة والمسؤولية الجنائية',
      topics: [
        {
          id: 'topic-penal-1',
          title: 'الركن الشرعي: مبدأ شرعية الجرائم والعقوبات وتطبيق القانون من حيث الزمان والمكان',
          targetDate: today,
          estimatedDurationMinutes: 90,
          status: 'in_progress',
        },
        {
          id: 'topic-penal-2',
          title: 'الركن المادي: السلوك الإجرامي، النتيجة، علاقة السببية، والشروع وأحكامه',
          targetDate: getRelativeDateStr(1),
          estimatedDurationMinutes: 90,
          status: 'not_started',
        },
        {
          id: 'topic-penal-3',
          title: 'الركن المعنوي: القصد الجنائي والخطأ غير العمدي',
          targetDate: getRelativeDateStr(3),
          estimatedDurationMinutes: 80,
          status: 'not_started',
        },
        {
          id: 'topic-penal-4',
          title: 'المساهمة الجنائية (الفاعل الأصلي والشريك) وأسباب الإباحة وموانع المسؤولية',
          targetDate: getRelativeDateStr(4),
          estimatedDurationMinutes: 100,
          status: 'not_started',
        },
        {
          id: 'topic-penal-5',
          title: 'حل نماذج قضايا عملية وامتحانات سابقة في قانون العقوبات',
          targetDate: getRelativeDateStr(5),
          estimatedDurationMinutes: 110,
          status: 'not_started',
          isPastPaper: true,
        },
      ],
    },
  ];

  return {
    sampleExams,
    sampleSessions,
    sampleTasks,
    sampleAlarms,
    samplePlans,
  };
}

export function loadStoredData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return fallback;
  }
}

export function saveStoredData<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}
