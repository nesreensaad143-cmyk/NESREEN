import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  GraduationCap,
  CheckCircle2,
  Circle,
  Plus,
  AlertTriangle,
  ArrowUpRight,
  Flame,
  ChevronLeft,
  BookOpen,
  Calculator,
  Bell,
  Bookmark,
  BarChart3,
  Check,
  Scale,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateCountdown, formatArabicDate, formatArabicDateShort, formatArabicTime, getTodayDateString } from '../utils/dateUtils';
import { ActiveTab, Exam, LAW_SUBJECTS } from '../types';

interface HomeDashboardProps {
  onOpenAddSession: () => void;
  onOpenAddTask: () => void;
  onOpenAddExam: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onOpenAddSession,
  onOpenAddTask,
  onOpenAddExam,
}) => {
  const {
    userProfile,
    studySessions,
    exams,
    dailyTasks,
    setActiveTab,
    toggleSessionCompletion,
    toggleTaskCompletion,
    rolloverIncompleteTasksToTomorrow,
    applyLawCurriculum,
  } = useApp();

  const todayStr = getTodayDateString();

  // Tick every second for live countdown
  const [, setSecondsTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Today's study sessions
  const todaySessions = studySessions.filter((s) => s.date === todayStr);
  const completedSessionsToday = todaySessions.filter((s) => s.isCompleted);
  const sessionsCompletionRate =
    todaySessions.length > 0
      ? Math.round((completedSessionsToday.length / todaySessions.length) * 100)
      : 0;

  // Today's tasks
  const todayTasks = dailyTasks.filter((t) => t.date === todayStr);
  const completedTasksToday = todayTasks.filter((t) => t.isCompleted);
  const remainingTasksCount = todayTasks.length - completedTasksToday.length;
  const tasksCompletionRate =
    todayTasks.length > 0
      ? Math.round((completedTasksToday.length / todayTasks.length) * 100)
      : 0;

  // Find nearest upcoming exam
  const upcomingExams = exams
    .map((ex) => ({
      ...ex,
      countdown: calculateCountdown(ex.date, ex.time),
    }))
    .filter((ex) => !ex.countdown.isPast)
    .sort((a, b) => a.countdown.totalMs - b.countdown.totalMs);

  const nearestExam = upcomingExams[0];

  // Urgent alerts
  const urgentExams = upcomingExams.filter((ex) => ex.countdown.isImminent);
  const overdueTasks = dailyTasks.filter(
    (t) => !t.isCompleted && t.date < todayStr
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-800 p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-purple-200 text-xs sm:text-sm font-medium">
              <span>{formatArabicDate(todayStr)}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span>الهدف اليومي: {userProfile.dailyGoalHours} ساعات</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              أهلاً بك، {userProfile.name} 👋
            </h2>
            <p className="mt-1 text-sm text-purple-100 max-w-xl">
              «التوفيق يبدأ بخطوة منظمة». لديك اليوم{' '}
              <span className="font-bold underline decoration-purple-300">
                {todaySessions.length} جلسات مذاكرة
              </span>{' '}
              و <span className="font-bold underline decoration-purple-300">{remainingTasksCount} مهام متبقية</span>.
            </p>
          </div>

          {/* Quick Progress Mini Badge */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center">
              <span className="block text-2xl font-black text-amber-300">
                {sessionsCompletionRate}%
              </span>
              <span className="text-[11px] text-purple-100 font-medium">إنجاز المذاكرة</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <span className="block text-2xl font-black text-emerald-300">
                {tasksCompletionRate}%
              </span>
              <span className="text-[11px] text-purple-100 font-medium">إنجاز المهام</span>
            </div>
          </div>
        </div>

        {/* Ambient subtle light glow */}
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
      </div>

      {/* Urgent Alerts Banner (if any) */}
      {(urgentExams.length > 0 || overdueTasks.length > 0) && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200/70 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">تنبيهات عاجلة بحاجة لانتباهك!</div>
              <div className="text-xs text-amber-800">
                {urgentExams.length > 0 && (
                  <span>
                    امتحان {urgentExams[0].subject} متبقٍ عليه أقل من يومين!{' '}
                  </span>
                )}
                {overdueTasks.length > 0 && (
                  <span>
                    يوجد {overdueTasks.length} مهام دراسية متأخرة من أيام سابقة.
                  </span>
                )}
              </div>
            </div>
          </div>
          {overdueTasks.length > 0 && (
            <button
              onClick={() => rolloverIncompleteTasksToTomorrow()}
              className="text-xs font-bold bg-amber-200/80 hover:bg-amber-300 text-amber-950 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              ترحيل المتأخر للغد بنقرة واحدة
            </button>
          )}
        </div>
      )}

      {/* Nearest Exam Countdown Banner */}
      {nearestExam ? (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-md shadow-purple-900/5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-50">
            <div>
              <span className="text-xs font-semibold text-purple-600 block mb-1">
                أقرب موعد امتحان
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                {nearestExam.subject}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {formatArabicDate(nearestExam.date)} · الساعة {formatArabicTime(nearestExam.time)}
                {nearestExam.location && ` · ${nearestExam.location}`}
              </p>
            </div>

            <button
              onClick={() => setActiveTab('exams')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-xl transition-colors self-start sm:self-center"
            >
              <span>تفاصيل الامتحانات</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Countdown Clock Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-5">
            <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-3 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-purple-900">
                {nearestExam.countdown.days}
              </span>
              <span className="text-[11px] font-semibold text-purple-600">يوم</span>
            </div>
            <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-3 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-purple-900">
                {nearestExam.countdown.hours}
              </span>
              <span className="text-[11px] font-semibold text-purple-600">ساعة</span>
            </div>
            <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-3 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-purple-900">
                {nearestExam.countdown.minutes}
              </span>
              <span className="text-[11px] font-semibold text-purple-600">دقيقة</span>
            </div>
            <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-3 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-purple-900 tabular-nums">
                {nearestExam.countdown.seconds}
              </span>
              <span className="text-[11px] font-semibold text-purple-600">ثانية</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 text-center">
          <p className="text-slate-600 text-sm">لا توجد امتحانات مسجلة قادمة حتى الآن.</p>
          <button
            onClick={onOpenAddExam}
            className="mt-3 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة امتحانك الأول</span>
          </button>
        </div>
      )}

      {/* Public Law Subjects Overview Strip */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-50">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-600" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                مواد شعبة القانون العام المقررة
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              خطة دراسية مخصصة لطلاب كلية الحقوق
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm('هل تريد تطبيق وتحديث جدول ومواعيد مواد القانون العام الأربعة (الدستوري، العقوبات، المالية والضرائب، أصول البحث)؟')) {
                applyLawCurriculum();
              }
            }}
            className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>تحديث خطة مواد القانون العام</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          {LAW_SUBJECTS.map((sub) => {
            const sessCount = studySessions.filter((s) => s.subject.includes(sub)).length;
            const examForSub = exams.find((e) => e.subject.includes(sub));

            return (
              <div
                key={sub}
                className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100/70 text-right flex flex-col justify-between"
              >
                <div>
                  <span className="block font-bold text-xs sm:text-sm text-purple-950 leading-snug mb-1">
                    {sub}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {sessCount} جلسات مجدولة
                  </span>
                </div>

                {examForSub ? (
                  <span className="text-[10px] font-semibold text-purple-700 mt-2 block bg-white px-2 py-0.5 rounded-lg border border-purple-100">
                    الامتحان: {formatArabicDateShort(examForSub.date)}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    لم يُسجل امتحان بعد
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Section Shortcuts Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3">الأقسام السريعة</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
          <button
            onClick={() => setActiveTab('schedule')}
            className="bg-white hover:bg-purple-50/70 border border-purple-100/80 rounded-2xl p-3 flex flex-col items-center text-center transition-all shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">الجدول</span>
            <span className="text-[10px] text-slate-500 mt-0.5">جلسات اليوم</span>
          </button>

          <button
            onClick={() => setActiveTab('exams')}
            className="bg-white hover:bg-purple-50/70 border border-purple-100/80 rounded-2xl p-3 flex flex-col items-center text-center transition-all shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">الامتحانات</span>
            <span className="text-[10px] text-slate-500 mt-0.5">العد التنازلي</span>
          </button>

          <button
            onClick={() => setActiveTab('revision')}
            className="bg-white hover:bg-purple-50/70 border border-purple-100/80 rounded-2xl p-3 flex flex-col items-center text-center transition-all shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">المراجعة</span>
            <span className="text-[10px] text-slate-500 mt-0.5">توزيع الفصول</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className="bg-white hover:bg-purple-50/70 border border-purple-100/80 rounded-2xl p-3 flex flex-col items-center text-center transition-all shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">المهام</span>
            <span className="text-[10px] text-slate-500 mt-0.5">إنجاز اليوم</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className="bg-white hover:bg-purple-50/70 border border-purple-100/80 rounded-2xl p-3 flex flex-col items-center text-center transition-all shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">الحاسبة</span>
            <span className="text-[10px] text-slate-500 mt-0.5">المعدل والهدف</span>
          </button>

          <button
            onClick={() => setActiveTab('alarms')}
            className="bg-white hover:bg-purple-50/70 border border-purple-100/80 rounded-2xl p-3 flex flex-col items-center text-center transition-all shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">المنبّه</span>
            <span className="text-[10px] text-slate-500 mt-0.5">التذكيرات</span>
          </button>
        </div>
      </div>

      {/* Dual Column: Today's Schedule & Today's Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule Card */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-md shadow-purple-900/5">
          <div className="flex items-center justify-between pb-4 border-b border-purple-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">جدول مذاكرة اليوم</h3>
                <span className="text-xs text-slate-500">
                  {todaySessions.length} جلسات مجدولة
                </span>
              </div>
            </div>

            <button
              onClick={onOpenAddSession}
              className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة جلسة</span>
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {todaySessions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="w-10 h-10 mx-auto text-purple-200 mb-2" />
                <p className="text-sm">لا توجد جلسات مذاكرة مقررة لليوم.</p>
                <button
                  onClick={onOpenAddSession}
                  className="mt-3 text-xs font-semibold text-purple-700 underline"
                >
                  حدد مادة وابدأ جدول اليوم
                </button>
              </div>
            ) : (
              todaySessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    session.isCompleted
                      ? 'bg-purple-50/40 border-purple-100 text-slate-500 opacity-80'
                      : 'bg-white border-slate-100 hover:border-purple-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSessionCompletion(session.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        session.isCompleted
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-slate-300 hover:border-purple-500 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                    <div>
                      <h4
                        className={`text-sm font-bold ${
                          session.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {session.subject} – {session.topic}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatArabicTime(session.startTime)} إلى {formatArabicTime(session.endTime)} (
                        {session.durationMinutes} دقيقة)
                      </p>
                    </div>
                  </div>

                  {session.priority === 'high' && (
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      أولوية عالية
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Tasks Card */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-md shadow-purple-900/5">
          <div className="flex items-center justify-between pb-4 border-b border-purple-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">مهام اليوم</h3>
                <span className="text-xs text-slate-500">
                  {completedTasksToday.length} من {todayTasks.length} منجزة
                </span>
              </div>
            </div>

            <button
              onClick={onOpenAddTask}
              className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مهمة</span>
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-200 mb-2" />
                <p className="text-sm">لا توجد مهام مسجلة لهذا اليوم.</p>
                <button
                  onClick={onOpenAddTask}
                  className="mt-3 text-xs font-semibold text-purple-700 underline"
                >
                  أضف مهمتك اليومية الأولى
                </button>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    task.isCompleted
                      ? 'bg-emerald-50/30 border-emerald-100 text-slate-500 opacity-80'
                      : 'bg-white border-slate-100 hover:border-emerald-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        task.isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-emerald-500 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                    <div>
                      <h4
                        className={`text-sm font-bold ${
                          task.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.subject && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          مادة: {task.subject} {task.time ? `· الساعة ${formatArabicTime(task.time)}` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {task.priority === 'high' && (
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      عاجل
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
