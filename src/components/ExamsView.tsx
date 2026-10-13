import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Bell,
  AlertCircle,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateCountdown, formatArabicDate, formatArabicTime, getTodayDateString } from '../utils/dateUtils';
import { Exam, LAW_SUBJECTS } from '../types';

interface ExamsViewProps {
  onOpenAddAlarmForExam?: (exam: Exam) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({ onOpenAddAlarmForExam }) => {
  const { exams, addExam, updateExam, deleteExam, setActiveTab } = useApp();

  // Tick state to force live countdown updates every second
  const [, setSecondsTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form inputs
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#7c3aed');

  // Sorted exams by nearest upcoming date
  const processedExams = useMemo(() => {
    return exams
      .map((ex) => ({
        ...ex,
        countdown: calculateCountdown(ex.date, ex.time),
      }))
      .sort((a, b) => {
        // If one is past and one is future, future comes first
        if (a.countdown.isPast !== b.countdown.isPast) {
          return a.countdown.isPast ? 1 : -1;
        }
        return a.countdown.totalMs - b.countdown.totalMs;
      });
  }, [exams]);

  const openAddModal = () => {
    setEditingExam(null);
    setSubject('');
    setDate(getTodayDateString());
    setTime('09:00');
    setLocation('');
    setNotes('');
    setColor('#7c3aed');
    setIsModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setSubject(exam.subject);
    setDate(exam.date);
    setTime(exam.time);
    setLocation(exam.location || '');
    setNotes(exam.notes || '');
    setColor(exam.color || '#7c3aed');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    if (editingExam) {
      updateExam(editingExam.id, {
        subject,
        date,
        time,
        location,
        notes,
        color,
      });
    } else {
      addExam({
        subject,
        date,
        time,
        location,
        notes,
        color,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            مواعيد الامتحانات والعدّاد التنازلي
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تابع الوقت المتبقي لكل مادة بالثواني مع تنبيهات دقيقة لضمان الاستعداد الكامل
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة امتحان جديد</span>
        </button>
      </div>

      {/* Exams Grid */}
      {processedExams.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-xs">
          <GraduationCap className="w-14 h-14 text-purple-200 mx-auto mb-3" />
          <h3 className="font-extrabold text-base text-slate-800">لا توجد امتحانات مسجلة حتى الآن</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            أضف جدول امتحاناتك القادمة لنبدأ بحساب العد التنازلي وضبط منبهات المذاكرة قبلها.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل أول امتحان</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {processedExams.map((exam) => {
            const { countdown } = exam;

            return (
              <div
                key={exam.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all relative overflow-hidden flex flex-col justify-between shadow-xs ${
                  countdown.isImminent
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : countdown.isPast
                    ? 'border-slate-200 bg-slate-50/50 opacity-75'
                    : 'border-purple-100 hover:border-purple-200 hover:shadow-md'
                }`}
              >
                {/* Accent Top Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: exam.color || '#7c3aed' }}
                />

                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
                          {exam.subject}
                        </h3>
                        {countdown.isImminent && (
                          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>قريب جداً!</span>
                          </span>
                        )}
                        {countdown.isPast && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                            انتهى
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-600" />
                          <span>{formatArabicDate(exam.date)}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                          <span>الساعة {formatArabicTime(exam.time)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(exam)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteExam(exam.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Hall / Location info */}
                  {exam.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-purple-50/50 px-3 py-1.5 rounded-xl mb-3">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="font-medium">{exam.location}</span>
                    </div>
                  )}

                  {/* Special Notes */}
                  {exam.notes && (
                    <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl leading-relaxed">
                      {exam.notes}
                    </p>
                  )}
                </div>

                {/* Countdown Block */}
                <div className="mt-2 pt-3 border-t border-purple-50">
                  {countdown.isPast ? (
                    <div className="text-center py-2 text-xs text-slate-500 font-semibold">
                      تم اجتياز هذا الامتحان بنجاح.
                    </div>
                  ) : (
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 mb-2">
                        الوقت المتبقي حتى الامتحان:
                      </span>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-purple-50/60 rounded-xl p-2 border border-purple-100/60">
                          <span className="block text-xl font-black text-purple-900">
                            {countdown.days}
                          </span>
                          <span className="text-[10px] font-semibold text-purple-600">يوم</span>
                        </div>
                        <div className="bg-purple-50/60 rounded-xl p-2 border border-purple-100/60">
                          <span className="block text-xl font-black text-purple-900">
                            {countdown.hours}
                          </span>
                          <span className="text-[10px] font-semibold text-purple-600">ساعة</span>
                        </div>
                        <div className="bg-purple-50/60 rounded-xl p-2 border border-purple-100/60">
                          <span className="block text-xl font-black text-purple-900">
                            {countdown.minutes}
                          </span>
                          <span className="text-[10px] font-semibold text-purple-600">دقيقة</span>
                        </div>
                        <div className="bg-purple-50/60 rounded-xl p-2 border border-purple-100/60">
                          <span className="block text-xl font-black text-purple-900 tabular-nums">
                            {countdown.seconds}
                          </span>
                          <span className="text-[10px] font-semibold text-purple-600">ثانية</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Alarm shortcut button */}
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (onOpenAddAlarmForExam) {
                          onOpenAddAlarmForExam(exam);
                        } else {
                          setActiveTab('alarms');
                        }
                      }}
                      className="text-xs font-bold text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Bell className="w-3.5 h-3.5 text-purple-600" />
                      <span>إدارة تنبيهات هذا الامتحان</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-purple-50">
              <h3 className="font-extrabold text-lg text-slate-900">
                {editingExam ? 'تعديل موعد الامتحان' : 'إضافة موعد امتحان جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-right">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    اسم المادة أو المقرر *
                  </label>
                  <span className="text-[11px] text-purple-600 font-semibold">مواد القانون العام:</span>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاريخ الامتحان *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
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
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs transition-all bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مكان الامتحان أو رقم القاعة / اللجنة (اختياري)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="مثال: مبنى العلوم - قاعة 3B - لجنة رقم 12"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات أو أدوات مطلوبة
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: إحضار الآلة الحاسبة البيانية، مسطرة، قلم رصاص..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs transition-all"
                />
              </div>

              {/* Color tag picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  تمييز لوني للبطاقة
                </label>
                <div className="flex items-center gap-2">
                  {['#7c3aed', '#9333ea', '#6366f1', '#2563eb', '#059669', '#d97706'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c ? 'scale-110 border-slate-800' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
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
                  {editingExam ? 'حفظ التعديلات' : 'حفظ الامتحان'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
