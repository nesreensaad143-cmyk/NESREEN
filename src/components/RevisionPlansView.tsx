import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  ArrowRight,
  Edit2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LAW_SUBJECTS, RevisionPlan, RevisionTopic, RevisionStatus } from '../types';
import { formatArabicDate, formatArabicDateShort, getTodayDateString } from '../utils/dateUtils';

export const RevisionPlansView: React.FC = () => {
  const {
    revisionPlans,
    exams,
    addRevisionPlan,
    updateRevisionPlan,
    deleteRevisionPlan,
    updateTopicStatus,
    addTopicToPlan,
    deleteTopicFromPlan,
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(
    revisionPlans.length > 0 ? revisionPlans[0].id : null
  );

  // New plan state
  const [subject, setSubject] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [dailyMinutes, setDailyMinutes] = useState(90);
  const [rawTopicsText, setRawTopicsText] = useState(
    'الفصل الأول: المفاهيم الأساسية\nالفصل الثاني: التطبيقات العملية\nالفصل الثالث: المسائل المعقدة'
  );
  const [includePastPapers, setIncludePastPapers] = useState(true);
  const [planNotes, setPlanNotes] = useState('');

  // Quick topic adder
  const [quickTopicTitle, setQuickTopicTitle] = useState('');
  const [quickTopicDate, setQuickTopicDate] = useState(getTodayDateString());

  // Handle Exam selection auto-populating subject and deadline
  const handleSelectExam = (examId: string) => {
    setSelectedExamId(examId);
    const ex = exams.find((e) => e.id === examId);
    if (ex) {
      setSubject(ex.subject);
      setDeadlineDate(ex.date);
    }
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    // Split topics by newline
    const lines = rawTopicsText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const generatedTopics: RevisionTopic[] = [];

    // Calculate dates between startDate and deadlineDate
    const start = new Date(startDate);
    const end = new Date(deadlineDate);
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // Leave the last day for past papers/final review if more than 2 days available
    const daysForChapters = includePastPapers && diffDays > 2 ? diffDays - 1 : diffDays;

    lines.forEach((line, idx) => {
      // Auto assign target date evenly across available days
      const dayOffset = Math.floor((idx / Math.max(1, lines.length)) * daysForChapters);
      const target = new Date(start);
      target.setDate(start.getDate() + dayOffset);
      const targetDateStr = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;

      generatedTopics.push({
        id: 'topic-' + Date.now() + '-' + idx,
        title: line,
        targetDate: targetDateStr,
        estimatedDurationMinutes: dailyMinutes,
        status: 'not_started',
      });
    });

    if (includePastPapers) {
      const lastDay = new Date(end);
      const lastDayStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

      generatedTopics.push({
        id: 'topic-' + Date.now() + '-past-papers',
        title: 'حل أسئلة ونماذج امتحانات السنوات السابقة والمراجعة النهائية',
        targetDate: lastDayStr,
        estimatedDurationMinutes: dailyMinutes + 30,
        status: 'not_started',
        isPastPaper: true,
      });
    }

    addRevisionPlan({
      subject,
      examId: selectedExamId || undefined,
      startDate,
      deadlineDate,
      dailySessionMinutes: dailyMinutes,
      topics: generatedTopics,
      notes: planNotes,
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            خطط المراجعة وتوزيع الفصول
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            خطط دراسية ذكية تقسم محتوى المادة على الأيام المتبقية قبل الامتحان مع وقت مخصص للمراجعة الشاملة
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء خطة مراجعة ذكية</span>
        </button>
      </div>

      {/* Revision Plans List */}
      {revisionPlans.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-xs">
          <Bookmark className="w-14 h-14 text-purple-200 mx-auto mb-3" />
          <h3 className="font-extrabold text-base text-slate-800">لا توجد خطط مراجعة حالية</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            أنشئ خطة مراجعة لمادة امتحانك وسيقوم النظام بتوزيع الفصول تلقائياً على الأيام المتبقية!
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء أول خطة مراجعة</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {revisionPlans.map((plan) => {
            const isExpanded = expandedPlanId === plan.id;
            const completedCount = plan.topics.filter((t) => t.status === 'completed').length;
            const totalCount = plan.topics.length;
            const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const todayStr = getTodayDateString();

            // Check for overdue topics (targetDate < today and status != completed)
            const overdueTopics = plan.topics.filter(
              (t) => t.status !== 'completed' && t.targetDate < todayStr
            );

            return (
              <div
                key={plan.id}
                className="bg-white rounded-3xl border border-purple-100 shadow-xs overflow-hidden transition-all"
              >
                {/* Plan Header Card */}
                <div className="p-5 sm:p-6 bg-white hover:bg-purple-50/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-lg text-slate-900">{plan.subject}</h3>
                        {overdueTopics.length > 0 && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{overdueTopics.length} موضوعات متأخرة</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>من {formatArabicDateShort(plan.startDate)}</span>
                        <span>إلى {formatArabicDateShort(plan.deadlineDate)}</span>
                        <span>·</span>
                        <span>{plan.dailySessionMinutes} دقيقة يومياً</span>
                        <span>·</span>
                        <span>{completedCount} من {totalCount} موضوعات مكتملة</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Circular or bar progress */}
                      <div className="text-right">
                        <div className="text-sm font-black text-purple-700">
                          {progressPercent}%
                        </div>
                        <div className="w-24 sm:w-32 h-2 rounded-full bg-purple-100 overflow-hidden mt-1">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedPlanId((prev) => (prev === plan.id ? null : plan.id))
                        }
                        className="p-2 rounded-xl text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                        title="تفاصيل الخطة"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>

                      <button
                        onClick={() => deleteRevisionPlan(plan.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="حذف الخطة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Plan Details & Topics (Collapsible) */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-purple-50 bg-purple-50/10 space-y-4">
                    {plan.notes && (
                      <div className="p-3 rounded-xl bg-purple-50/50 text-xs text-purple-900">
                        {plan.notes}
                      </div>
                    )}

                    {/* Topics Checklist */}
                    <div className="space-y-2.5">
                      <h4 className="font-extrabold text-xs text-slate-700">
                        قائمة موضوعات وفصول المراجعة:
                      </h4>

                      {plan.topics.map((topic) => {
                        const isOverdue =
                          topic.status !== 'completed' && topic.targetDate < todayStr;

                        return (
                          <div
                            key={topic.id}
                            className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              topic.status === 'completed'
                                ? 'bg-emerald-50/40 border-emerald-200 text-slate-500'
                                : isOverdue
                                ? 'bg-rose-50/30 border-rose-200'
                                : 'bg-white border-slate-100 hover:border-purple-200 shadow-xs'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {topic.isPastPaper ? (
                                  <FileCheck className="w-5 h-5 text-indigo-600" />
                                ) : (
                                  <Bookmark className="w-5 h-5 text-purple-600" />
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <h5
                                    className={`font-bold text-sm ${
                                      topic.status === 'completed'
                                        ? 'line-through text-slate-500'
                                        : 'text-slate-900'
                                    }`}
                                  >
                                    {topic.title}
                                  </h5>
                                  {topic.isPastPaper && (
                                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                                      امتحانات سابقة
                                    </span>
                                  )}
                                  {isOverdue && (
                                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                                      متأخر
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                  <span>تاريخ المراجعة المقترح: {formatArabicDateShort(topic.targetDate)}</span>
                                  <span>·</span>
                                  <span>{topic.estimatedDurationMinutes} دقيقة</span>
                                </div>
                              </div>
                            </div>

                            {/* Status Selector */}
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <select
                                value={topic.status}
                                onChange={(e) =>
                                  updateTopicStatus(
                                    plan.id,
                                    topic.id,
                                    e.target.value as RevisionStatus
                                  )
                                }
                                className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border outline-none bg-white transition-colors ${
                                  topic.status === 'completed'
                                    ? 'border-emerald-300 text-emerald-800 bg-emerald-50'
                                    : topic.status === 'in_progress'
                                    ? 'border-purple-300 text-purple-800 bg-purple-50'
                                    : 'border-slate-200 text-slate-700'
                                }`}
                              >
                                <option value="not_started">لم يبدأ</option>
                                <option value="in_progress">قيد المراجعة</option>
                                <option value="completed">تمت المراجعة ✓</option>
                              </select>

                              <button
                                onClick={() => deleteTopicFromPlan(plan.id, topic.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                                title="حذف الموضوع"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add topic directly to this plan */}
                    <div className="pt-2 border-t border-purple-50 flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        placeholder="إضافة موضوع أو فصل جديد لهذه الخطة..."
                        value={quickTopicTitle}
                        onChange={(e) => setQuickTopicTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-purple-500 outline-none"
                      />
                      <input
                        type="date"
                        value={quickTopicDate}
                        onChange={(e) => setQuickTopicDate(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white shrink-0"
                      />
                      <button
                        onClick={() => {
                          if (!quickTopicTitle.trim()) return;
                          addTopicToPlan(plan.id, {
                            title: quickTopicTitle,
                            targetDate: quickTopicDate,
                            estimatedDurationMinutes: plan.dailySessionMinutes,
                            status: 'not_started',
                          });
                          setQuickTopicTitle('');
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shrink-0 whitespace-nowrap"
                      >
                        إضافة موضوع
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Plan Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-purple-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-lg text-slate-900">
                  إنشاء خطة مراجعة ذكية جديدة
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="mt-4 space-y-4 text-right">
              {/* Exam linking */}
              {exams.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ربط بامتحان محدد (اختياري)
                  </label>
                  <select
                    value={selectedExamId}
                    onChange={(e) => handleSelectExam(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs bg-white"
                  >
                    <option value="">خطة مراجعة حرة (بدون امتحان محدد)</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.subject} — تاريخ: {formatArabicDate(ex.date)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    اسم المادة *
                  </label>
                  <span className="text-[11px] text-purple-600 font-semibold">مواد القانون العام:</span>
                </div>
                <input
                  type="text"
                  required
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
                    تاريخ بداية المراجعة *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الموعد النهائي (تاريخ الامتحان) *
                  </label>
                  <input
                    type="date"
                    required
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مدة جلسة المراجعة اليومية (بالدقائق)
                </label>
                <input
                  type="number"
                  min="20"
                  max="360"
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الموضوعات والفصول المطلوبة (كل موضوع في سطر منفصل) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={rawTopicsText}
                  onChange={(e) => setRawTopicsText(e.target.value)}
                  placeholder="الفصل الأول: المفاهيم والقوانين&#10;الفصل الثاني: التدريبات والتطبيقات&#10;الفصل الثالث: المسائل الحسابية"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono outline-none leading-relaxed"
                />
                <span className="text-[11px] text-purple-600 block mt-1">
                  * سيقوم النظام بتوزيع هذه الموضوعات تلقائياً على الأيام المتبقية قبل الامتحان.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pastPapersCheckbox"
                  checked={includePastPapers}
                  onChange={(e) => setIncludePastPapers(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
                <label
                  htmlFor="pastPapersCheckbox"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  تخصيص وقت نهائي لحل نماذج الامتحانات السابقة والمراجعة الشاملة
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                >
                  توزيع الخطة وإنشاؤها
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
