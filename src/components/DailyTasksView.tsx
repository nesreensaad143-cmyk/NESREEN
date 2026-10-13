import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  Calendar,
  Clock,
  ArrowRightLeft,
  AlertCircle,
  Bell,
  Filter,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DailyTask, LAW_SUBJECTS, Priority } from '../types';
import { formatArabicDate, formatArabicDateShort, formatArabicTime, getTodayDateString } from '../utils/dateUtils';

export const DailyTasksView: React.FC = () => {
  const {
    dailyTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    rolloverIncompleteTasksToTomorrow,
    exams,
  } = useApp();

  const todayStr = getTodayDateString();
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'pending' | 'completed' | 'overdue'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('17:00');
  const [priority, setPriority] = useState<Priority>('medium');
  const [subject, setSubject] = useState('');
  const [hasReminder, setHasReminder] = useState(true);

  // Filtered tasks calculation
  const filteredTasks = useMemo(() => {
    return dailyTasks.filter((task) => {
      if (activeFilter === 'today') return task.date === todayStr;
      if (activeFilter === 'pending') return !task.isCompleted;
      if (activeFilter === 'completed') return task.isCompleted;
      if (activeFilter === 'overdue') return !task.isCompleted && task.date < todayStr;
      return true;
    });
  }, [dailyTasks, activeFilter, todayStr]);

  // Today's statistics
  const todayTasks = dailyTasks.filter((t) => t.date === todayStr);
  const completedToday = todayTasks.filter((t) => t.isCompleted).length;
  const todayProgress = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;
  const overdueCount = dailyTasks.filter((t) => !t.isCompleted && t.date < todayStr).length;

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setDate(todayStr);
    setTime('17:00');
    setPriority('medium');
    setSubject('');
    setHasReminder(true);
    setIsModalOpen(true);
  };

  const openEditModal = (task: DailyTask) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setDate(task.date);
    setTime(task.time || '17:00');
    setPriority(task.priority);
    setSubject(task.subject || '');
    setHasReminder(task.hasReminder);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title,
        description,
        date,
        time,
        priority,
        subject: subject || undefined,
        hasReminder,
      });
    } else {
      addTask({
        title,
        description,
        date,
        time,
        priority,
        subject: subject || undefined,
        hasReminder,
        isCompleted: false,
      });
    }

    setIsModalOpen(false);
  };

  const handleRollover = () => {
    const count = rolloverIncompleteTasksToTomorrow();
    alert(`تم بنجاح ترحيل ${count} مهام غير مكتملة إلى يوم الغد.`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            تنظيم المهام اليومية
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تابع واجباتك وتدريباتك خطوة بخطوة مع إمكانية الترحيل الذكي للمهام
          </p>
        </div>

        <div className="flex items-center gap-2">
          {overdueCount > 0 && (
            <button
              onClick={handleRollover}
              className="py-2.5 px-3.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="ترحيل المهام المتأخرة للغد"
            >
              <ArrowRightLeft className="w-4 h-4 text-amber-700" />
              <span>ترحيل ({overdueCount}) للغد</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>مهمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Today Progress Overview Bar */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 block mb-1">
            إنجاز اليوم: {formatArabicDateShort(todayStr)}
          </span>
          <h3 className="text-lg font-black text-slate-900">
            أنجزت {completedToday} من {todayTasks.length} مهام
          </h3>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 w-full sm:w-64">
          <div className="flex-1 h-3 rounded-full bg-purple-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all"
              style={{ width: `${todayProgress}%` }}
            />
          </div>
          <span className="text-sm font-black text-purple-900 shrink-0">
            {todayProgress}%
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-purple-50/70 p-1 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveFilter('today')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
            activeFilter === 'today'
              ? 'bg-white text-purple-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          مهام اليوم ({todayTasks.length})
        </button>

        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
            activeFilter === 'pending'
              ? 'bg-white text-purple-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          المتبقية ({dailyTasks.filter((t) => !t.isCompleted).length})
        </button>

        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
            activeFilter === 'completed'
              ? 'bg-white text-purple-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          المكتملة ({dailyTasks.filter((t) => t.isCompleted).length})
        </button>

        <button
          onClick={() => setActiveFilter('overdue')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
            activeFilter === 'overdue'
              ? 'bg-white text-rose-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          المتأخرة ({overdueCount})
        </button>

        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
            activeFilter === 'all'
              ? 'bg-white text-purple-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الكل ({dailyTasks.length})
        </button>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-xs">
          <CheckSquare className="w-12 h-12 text-purple-200 mx-auto mb-3" />
          <h3 className="font-extrabold text-base text-slate-800">لا توجد مهام في هذا التصنيف</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            أضف مهامك اليومية أو التدريبات المطلوبة لتنظيم وقتك بفاعلية.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مهمة جديدة</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isOverdue = !task.isCompleted && task.date < todayStr;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                  task.isCompleted
                    ? 'border-emerald-100 bg-emerald-50/20 text-slate-500 opacity-75'
                    : isOverdue
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-100 hover:border-purple-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`w-6 h-6 rounded-lg mt-0.5 flex items-center justify-center border transition-all shrink-0 ${
                      task.isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-emerald-500 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`font-bold text-sm sm:text-base ${
                          task.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.priority === 'high' && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                          أولوية عالية
                        </span>
                      )}
                      {task.priority === 'medium' && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                          متوسطة
                        </span>
                      )}

                      {isOverdue && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>متأخرة عن الموعد</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>التاريخ: {formatArabicDate(task.date)}</span>
                      {task.time && <span>· الساعة {formatArabicTime(task.time)}</span>}
                      {task.subject && (
                        <>
                          <span>·</span>
                          <span className="text-purple-600 font-medium">مادة: {task.subject}</span>
                        </>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-xl leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 self-end sm:self-center">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-2 rounded-xl text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                    title="تعديل المهمة"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="حذف المهمة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-purple-50">
              <h3 className="font-extrabold text-lg text-slate-900">
                {editingTask ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان المهمة *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: حل الواجب ص 50، كتابة مقال الإنجليزي"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs sm:text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    المادة الدراسية (اختياري)
                  </label>
                  <span className="text-[11px] text-purple-600 font-semibold">مواد القانون العام:</span>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثال: القانون الدستوري، قانون العقوبات العام..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs sm:text-sm"
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
                    تاريخ المهمة *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الوقت المقترح
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الأولوية
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                >
                  <option value="high">عالية (عاجلة جداً)</option>
                  <option value="medium">متوسطة</option>
                  <option value="low">منخفضة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تفاصيل إضافية أو ملاحظات
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثال: التركيز على الأسئلة من 1 إلى 10..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
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
                  {editingTask ? 'حفظ التعديل' : 'إضافة المهمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
