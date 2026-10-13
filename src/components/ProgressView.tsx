import React, { useMemo } from 'react';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  GraduationCap,
  Bookmark,
  Calendar,
  Flame,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayDateString, getWeekDates } from '../utils/dateUtils';

export const ProgressView: React.FC = () => {
  const { studySessions, exams, revisionPlans, dailyTasks, userProfile } = useApp();

  // Study sessions stats
  const totalSessions = studySessions.length;
  const completedSessions = studySessions.filter((s) => s.isCompleted);
  const completedSessionsCount = completedSessions.length;
  const sessionCompletionRate =
    totalSessions > 0 ? Math.round((completedSessionsCount / totalSessions) * 100) : 0;

  // Total study minutes from completed sessions
  const totalCompletedMinutes = completedSessions.reduce(
    (acc, s) => acc + (s.durationMinutes || 0),
    0
  );
  const totalStudyHours = Math.round((totalCompletedMinutes / 60) * 10) / 10;

  // Daily Tasks stats
  const totalTasks = dailyTasks.length;
  const completedTasks = dailyTasks.filter((t) => t.isCompleted);
  const completedTasksCount = completedTasks.length;
  const remainingTasksCount = totalTasks - completedTasksCount;
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // Upcoming Exams count
  const todayStr = getTodayDateString();
  const upcomingExamsCount = exams.filter((e) => e.date >= todayStr).length;

  // Weekly study hours breakdown
  const weekDays = useMemo(() => getWeekDates(), []);
  const weeklyData = useMemo(() => {
    return weekDays.map((day) => {
      const daySessions = studySessions.filter(
        (s) => s.date === day.dateStr && s.isCompleted
      );
      const minutes = daySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
      return {
        ...day,
        minutes,
        hours: Math.round((minutes / 60) * 10) / 10,
      };
    });
  }, [studySessions, weekDays]);

  const maxWeeklyHours = Math.max(1, ...weeklyData.map((d) => d.hours));

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          لوحة متابعة الإنجاز والتقدم الدراسي
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          إحصائيات دقيقة محسوبة من بياناتك وجلساتك الحقيقية لقياس التطور وتحقيق الأهداف
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Hours studied */}
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <span className="block text-2xl sm:text-3xl font-black text-slate-900">
            {totalStudyHours} <span className="text-sm font-semibold text-slate-500">ساعة</span>
          </span>
          <span className="text-xs font-semibold text-purple-600 mt-1 block">
            إجمالي ساعات المذاكرة
          </span>
        </div>

        {/* Completed sessions */}
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="block text-2xl sm:text-3xl font-black text-slate-900">
            {completedSessionsCount} / {totalSessions}
          </span>
          <span className="text-xs font-semibold text-indigo-600 mt-1 block">
            جلسات مذاكرة منجزة ({sessionCompletionRate}%)
          </span>
        </div>

        {/* Tasks completed */}
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="block text-2xl sm:text-3xl font-black text-slate-900">
            {completedTasksCount} / {totalTasks}
          </span>
          <span className="text-xs font-semibold text-emerald-600 mt-1 block">
            مهام مكتملة ({taskCompletionRate}%)
          </span>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="block text-2xl sm:text-3xl font-black text-slate-900">
            {upcomingExamsCount}
          </span>
          <span className="text-xs font-semibold text-amber-600 mt-1 block">
            امتحانات قادمة
          </span>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-purple-50">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              نشاط وساعات المذاكرة لهذا الأسبوع
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              مجموع الساعات المستغرقة في الجلسات المنجزة يومياً
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl">
            <TrendingUp className="w-4 h-4" />
            <span>معدل الأداء اليومي</span>
          </div>
        </div>

        {/* Bar chart container */}
        <div className="mt-8 pt-4">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 border-b border-slate-100 pb-2">
            {weeklyData.map((d) => {
              const heightPercent = maxWeeklyHours > 0 ? (d.hours / maxWeeklyHours) * 100 : 0;

              return (
                <div key={d.dateStr} className="flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <span className="text-[10px] font-bold text-slate-600 mb-1 opacity-80">
                    {d.hours > 0 ? `${d.hours}س` : '-'}
                  </span>

                  {/* Vertical bar */}
                  <div className="w-full max-w-[36px] bg-purple-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-32">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        d.isToday
                          ? 'bg-gradient-to-t from-purple-700 to-indigo-600'
                          : 'bg-gradient-to-t from-purple-500 to-purple-400'
                      }`}
                      style={{ height: `${Math.max(4, heightPercent)}%` }}
                    />
                  </div>

                  {/* Day label */}
                  <span
                    className={`text-[11px] font-bold mt-2 ${
                      d.isToday ? 'text-purple-700' : 'text-slate-600'
                    }`}
                  >
                    {d.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Revision Plans Completion Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs">
        <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-purple-600" />
          <span>نسبة إنجاز خطط المراجعة لكل مادة</span>
        </h3>

        {revisionPlans.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">لا توجد خطط مراجعة مسجلة بعد.</p>
        ) : (
          <div className="space-y-4">
            {revisionPlans.map((plan) => {
              const completed = plan.topics.filter((t) => t.status === 'completed').length;
              const total = plan.topics.length;
              const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div key={plan.id} className="p-4 rounded-2xl bg-purple-50/30 border border-purple-100/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm text-slate-900">{plan.subject}</span>
                    <span className="text-xs font-black text-purple-700">
                      {completed} من {total} فصول ({rate}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-purple-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
