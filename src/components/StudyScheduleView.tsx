import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Filter,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  computeDurationMinutes,
  formatArabicDate,
  formatArabicDateShort,
  formatArabicTime,
  getTodayDateString,
  getWeekDates,
} from '../utils/dateUtils';
import { LAW_SUBJECTS, Priority, StudySession } from '../types';

export const StudyScheduleView: React.FC = () => {
  const {
    studySessions,
    addStudySession,
    updateStudySession,
    deleteStudySession,
    toggleSessionCompletion,
    checkSessionConflict,
  } = useApp();

  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  // Form states
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [sessionDate, setSessionDate] = useState(getTodayDateString());
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:30');
  const [priority, setPriority] = useState<Priority>('medium');
  const [notes, setNotes] = useState('');
  const [hasReminder, setHasReminder] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Live conflict warning in modal
  const conflictWarning = useMemo(() => {
    if (!sessionDate || !startTime || !endTime) return null;
    return checkSessionConflict(
      sessionDate,
      startTime,
      endTime,
      editingSession ? editingSession.id : undefined
    );
  }, [sessionDate, startTime, endTime, editingSession, checkSessionConflict]);

  // Week days list
  const weekDays = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return getWeekDates(new Date(y, m - 1, d));
  }, [selectedDate]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    if (viewMode === 'day') {
      return studySessions.filter((s) => s.date === selectedDate);
    } else {
      // Week mode: all sessions falling in the week
      const weekDateStrs = weekDays.map((w) => w.dateStr);
      return studySessions.filter((s) => weekDateStrs.includes(s.date));
    }
  }, [studySessions, viewMode, selectedDate, weekDays]);

  const openAddModal = (dateToUse?: string) => {
    setEditingSession(null);
    setSubject('');
    setTopic('');
    setSessionDate(dateToUse || selectedDate);
    setStartTime('16:00');
    setEndTime('17:30');
    setPriority('medium');
    setNotes('');
    setHasReminder(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (session: StudySession) => {
    setEditingSession(session);
    setSubject(session.subject);
    setTopic(session.topic);
    setSessionDate(session.date);
    setStartTime(session.startTime);
    setEndTime(session.endTime);
    setPriority(session.priority);
    setNotes(session.notes || '');
    setHasReminder(session.hasReminder);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !topic.trim()) {
      setFormError('يرجى كتابة اسم المادة واسم الدرس.');
      return;
    }

    const duration = computeDurationMinutes(startTime, endTime);
    if (duration <= 0) {
      setFormError('يجب أن يكون وقت نهاية الجلسة بعد وقت البداية.');
      return;
    }

    if (editingSession) {
      const res = updateStudySession(editingSession.id, {
        subject,
        topic,
        date: sessionDate,
        startTime,
        endTime,
        durationMinutes: duration,
        priority,
        notes,
        hasReminder,
      });
      if (res.conflictWith) {
        alert(
          `تنبيه: تم الحفظ ولكن توجد جلسة أخرى متعارضة في نفس الوقت (${res.conflictWith.subject} - ${res.conflictWith.topic})`
        );
      }
    } else {
      const res = addStudySession({
        subject,
        topic,
        date: sessionDate,
        startTime,
        endTime,
        durationMinutes: duration,
        priority,
        notes,
        isCompleted: false,
        hasReminder,
      });
      if (res.conflictWith) {
        alert(
          `تنبيه: تم الحفظ مع وجود تعارض زمني مع جلسة (${res.conflictWith.subject} - ${res.conflictWith.topic})`
        );
      }
    }

    setIsModalOpen(false);
  };

  // Change day navigation
  const shiftDay = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const yStr = date.getFullYear();
    const mStr = String(date.getMonth() + 1).padStart(2, '0');
    const dStr = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${yStr}-${mStr}-${dStr}`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            جدول المذاكرة اليومي والأسبوعي
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            نظّم جلساتك الدراسية وتجنب تضارب المواعيد مع تنبيهات دقيقة
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Day / Week Switcher */}
          <div className="bg-purple-50 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'day'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              عرض يومي
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              عرض أسبوعي
            </button>
          </div>

          <button
            onClick={() => openAddModal()}
            className="py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>جلسة جديدة</span>
          </button>
        </div>
      </div>

      {/* Week Day Picker Bar */}
      <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-slate-800">
              {formatArabicDate(selectedDate)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => shiftDay(1)}
              className="p-1 rounded-lg hover:bg-purple-50 text-slate-600 transition-colors"
              title="اليوم التالي"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate(getTodayDateString())}
              className="px-2 py-0.5 text-[11px] font-bold text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
            >
              اليوم
            </button>
            <button
              onClick={() => shiftDay(-1)}
              className="p-1 rounded-lg hover:bg-purple-50 text-slate-600 transition-colors"
              title="اليوم السابق"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7 Days Strip */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekDays.map((day) => {
            const isSelected = day.dateStr === selectedDate;
            const countForDay = studySessions.filter((s) => s.date === day.dateStr).length;

            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                    : day.isToday
                    ? 'bg-purple-50 text-purple-900 border border-purple-200'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-[10px] font-medium leading-none">{day.dayName}</span>
                <span className="text-base font-extrabold mt-1">{day.dayNum}</span>
                {countForDay > 0 && (
                  <span
                    className={`mt-1 w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-amber-300' : 'bg-purple-600'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sessions Display */}
      {viewMode === 'day' ? (
        /* DAY VIEW */
        <div className="space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-purple-100">
              <Clock className="w-12 h-12 text-purple-200 mx-auto mb-3" />
              <h3 className="font-bold text-base text-slate-800">لا توجد جلسات مذاكرة في هذا اليوم</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                خصّص وقتًا لمراجعة موادك، وأضف جلسة الآن لبدء تنظيم يومك.
              </p>
              <button
                onClick={() => openAddModal()}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة جلسة لـ {formatArabicDateShort(selectedDate)}</span>
              </button>
            </div>
          ) : (
            filteredSessions
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((session) => {
                // Check if this session has a conflict with another on the same day
                const conflict = studySessions.find(
                  (s) =>
                    s.id !== session.id &&
                    s.date === session.date &&
                    computeDurationMinutes(session.startTime, session.endTime) > 0 &&
                    ((s.startTime <= session.startTime && session.startTime < s.endTime) ||
                      (s.startTime < session.endTime && session.endTime <= s.endTime) ||
                      (session.startTime <= s.startTime && session.endTime >= s.endTime))
                );

                return (
                  <div
                    key={session.id}
                    className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs ${
                      conflict
                        ? 'border-amber-300 bg-amber-50/20'
                        : session.isCompleted
                        ? 'border-purple-100 bg-purple-50/30 opacity-80'
                        : 'border-slate-100 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Checkbox & Details */}
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleSessionCompletion(session.id)}
                          className={`w-6 h-6 rounded-lg mt-0.5 flex items-center justify-center border transition-all shrink-0 ${
                            session.isCompleted
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-slate-300 hover:border-purple-500 text-transparent'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`font-bold text-base ${
                                session.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                              }`}
                            >
                              {session.subject} – {session.topic}
                            </h3>

                            {/* Priority tag */}
                            {session.priority === 'high' && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                                أولوية عالية
                              </span>
                            )}
                            {session.priority === 'medium' && (
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                                أولوية متوسطة
                              </span>
                            )}

                            {session.hasReminder && (
                              <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Bell className="w-3 h-3" />
                                <span>تذكير مفعّل</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <Clock className="w-3.5 h-3.5 text-purple-500" />
                            <span>
                              {formatArabicTime(session.startTime)} إلى {formatArabicTime(session.endTime)}
                            </span>
                            <span>·</span>
                            <span>{session.durationMinutes} دقيقة</span>
                          </div>

                          {session.notes && (
                            <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg">
                              {session.notes}
                            </p>
                          )}

                          {conflict && (
                            <div className="mt-2 text-xs text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                تعارض في التوقيت مع جلسة: {conflict.subject} ({formatArabicTime(conflict.startTime)} - {formatArabicTime(conflict.endTime)})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => openEditModal(session)}
                          className="p-2 rounded-xl text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                          title="تعديل الجلسة"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteStudySession(session.id)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="حذف الجلسة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      ) : (
        /* WEEK VIEW */
        <div className="space-y-4">
          {weekDays.map((day) => {
            const daySessions = studySessions.filter((s) => s.date === day.dateStr);

            return (
              <div
                key={day.dateStr}
                className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-purple-950">
                      {day.dayName} – {day.dayNum}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({daySessions.length} جلسات)
                    </span>
                  </div>

                  <button
                    onClick={() => openAddModal(day.dateStr)}
                    className="text-xs font-semibold text-purple-700 hover:bg-purple-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة</span>
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {daySessions.length === 0 ? (
                    <p className="text-xs text-slate-400 py-1">لا توجد جلسات مجدولة</p>
                  ) : (
                    daySessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          session.isCompleted
                            ? 'bg-purple-50/20 border-purple-100 line-through text-slate-400'
                            : 'bg-white border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleSessionCompletion(session.id)}
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              session.isCompleted
                                ? 'bg-purple-600 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {session.isCompleted && <Check className="w-3 h-3" />}
                          </button>
                          <span className="font-bold text-slate-800">
                            {session.subject} – {session.topic}
                          </span>
                        </div>
                        <span className="text-slate-500 font-medium">
                          {formatArabicTime(session.startTime)} ({session.durationMinutes} د)
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-purple-50">
              <h3 className="font-extrabold text-lg text-slate-900">
                {editingSession ? 'تعديل جلسة المذاكرة' : 'إضافة جلسة مذاكرة جديدة'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-right">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Conflict warning in modal */}
              {conflictWarning && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold">تنبيه تعارض في الوقت!</span>
                    <span>
                      توجد جلسة سابقة «{conflictWarning.subject} - {conflictWarning.topic}» مسجلة بين{' '}
                      {conflictWarning.startTime} و {conflictWarning.endTime}.
                    </span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    اسم المادة الدراسية *
                  </label>
                  <span className="text-[11px] text-purple-600 font-semibold">اختيار سريع لمواد القانون العام:</span>
                </div>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثال: القانون الدستوري، قانون العقوبات العام..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm transition-all"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {LAW_SUBJECTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubject(s)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        subject === s
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-purple-50/80 hover:bg-purple-100 text-purple-900 border-purple-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الدرس أو المحاضرة *
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="مثال: الفصل الثالث - الكهرومغناطيسية"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اليوم والتاريخ *
                  </label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    وقت البداية *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    وقت النهاية *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs transition-all bg-white"
                  />
                </div>
              </div>

              {/* Computed Duration info */}
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-between text-xs text-purple-900 font-semibold">
                <span>مدة المذاكرة المقدرة:</span>
                <span className="font-bold text-purple-700">
                  {computeDurationMinutes(startTime, endTime)} دقيقة
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    مستوى الأولوية
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs transition-all bg-white"
                  >
                    <option value="high">عالية (تركيز مكثف)</option>
                    <option value="medium">متوسطة (عادية)</option>
                    <option value="low">منخفضة (مراجعة سريعة)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="reminderCheckbox"
                    checked={hasReminder}
                    onChange={(e) => setHasReminder(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="reminderCheckbox"
                    className="text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    تفعيل تذكير قبل الجلسة
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: التركيز على حل التمارين ص 42 وتلخيص القوانين..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                >
                  {editingSession ? 'حفظ التعديلات' : 'حفظ الجلسة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
