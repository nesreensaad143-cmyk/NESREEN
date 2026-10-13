import React, { useState } from 'react';
import {
  Bell,
  Volume2,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Play,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Info,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AlarmTriggerOption, Exam, ExamAlarm } from '../types';
import {
  calculateAlarmTimestamp,
  getTriggerLabelArabic,
} from '../utils/notifications';
import { formatArabicDate, formatArabicTime } from '../utils/dateUtils';

interface ExamAlarmViewProps {
  preselectedExamId?: string;
}

export const ExamAlarmView: React.FC<ExamAlarmViewProps> = ({ preselectedExamId }) => {
  const {
    exams,
    alarms,
    addAlarm,
    deleteAlarm,
    toggleAlarm,
    testAlarmSound,
    triggerManualAlarmPreview,
    enableSystemNotifications,
    notificationPermission,
    userProfile,
  } = useApp();

  const [selectedExamId, setSelectedExamId] = useState<string>(
    preselectedExamId || (exams.length > 0 ? exams[0].id : '')
  );
  const [triggerOption, setTriggerOption] = useState<AlarmTriggerOption>('1_day_before');
  const [customMinutes, setCustomMinutes] = useState<number>(60);
  const [alarmNotes, setAlarmNotes] = useState('');

  const selectedExam = exams.find((e) => e.id === selectedExamId);

  const handleCreateAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    const timestamp = calculateAlarmTimestamp(
      selectedExam.date,
      selectedExam.time,
      triggerOption,
      customMinutes
    );

    addAlarm({
      examId: selectedExam.id,
      subject: selectedExam.subject,
      examDate: selectedExam.date,
      examTime: selectedExam.time,
      triggerOption,
      customMinutesBefore: triggerOption === 'custom_minutes' ? customMinutes : undefined,
      scheduledTimestamp: timestamp,
      isEnabled: true,
      notes: alarmNotes || `تذكير بموعد امتحان ${selectedExam.subject}`,
    });

    setAlarmNotes('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            نظام المنبّه والتذكير بالامتحانات
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            اضبط تذكيرات مسبقة متعددة لكل امتحان مع إشعارات ونغمات تنبيهية واضحة
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Test Sound Button */}
          <button
            onClick={testAlarmSound}
            className="py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="تجربة صوت النغمة"
          >
            <Volume2 className="w-4 h-4" />
            <span>تجربة صوت المنبّه</span>
          </button>

          {/* Test Pop-up Alert Button */}
          <button
            onClick={() =>
              triggerManualAlarmPreview(
                selectedExam ? selectedExam.subject : 'القانون الدستوري',
                'هذا اختبار فوري لنافذة التنبيه والصوت للتأكد من عمل المنبّه على جهازك.'
              )
            }
            className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="إطلاق تنبيه اختباري"
          >
            <Play className="w-4 h-4" />
            <span>إطلاق تنبيه تجريبي الآن</span>
          </button>
        </div>
      </div>

      {/* Permissions & Technical Transparency Banner */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              notificationPermission === 'granted'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">
                حالة إشعارات الجهاز والتطبيق
              </h3>
              {notificationPermission === 'granted' ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  مفعلة بالكامل
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  بحاجة لإذن المتصفح
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              تدعم المنصة القانونية نغمات تنبيه بالصوت (Web Audio) ونوافذ فورية داخل التطبيق، بالإضافة لإشعارات النظام عند منح الصلاحية. عند إبقاء التطبيق مفتوحًا في لسان تبويب، يرن المنبه بدقة في الموعد المحدد.
            </p>
          </div>
        </div>

        {notificationPermission !== 'granted' && (
          <button
            onClick={enableSystemNotifications}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all shrink-0 cursor-pointer"
          >
            السماح بالإشعارات
          </button>
        )}
      </div>

      {/* Create New Alarm Form */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm text-right">
        <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" />
          <span>ضبط تنبيه جديد لامتحان</span>
        </h3>

        {exams.length === 0 ? (
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-center text-xs text-slate-600">
            يرجى إضافة امتحان أولاً من قسم «الامتحانات» لتتمكن من ضبط تنبيهات له.
          </div>
        ) : (
          <form onSubmit={handleCreateAlarm} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Choose Exam */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اختر الامتحان *
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs sm:text-sm bg-white"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.subject} — {formatArabicDate(ex.date)} (الساعة {ex.time})
                    </option>
                  ))}
                </select>
              </div>

              {/* Trigger Option */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  موعد إطلاق التنبيه *
                </label>
                <select
                  value={triggerOption}
                  onChange={(e) => setTriggerOption(e.target.value as AlarmTriggerOption)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs sm:text-sm bg-white"
                >
                  <option value="1_day_before">قبل الامتحان بيوم واحد (24 ساعة)</option>
                  <option value="3_days_before">قبل الامتحان بـ 3 أيام</option>
                  <option value="7_days_before">قبل الامتحان بأسبوع (7 أيام)</option>
                  <option value="12_hours_before">قبل الامتحان بـ 12 ساعة</option>
                  <option value="3_hours_before">قبل الامتحان بـ 3 ساعات</option>
                  <option value="1_hour_before">قبل الامتحان بساعة واحدة</option>
                  <option value="exam_morning">صباح يوم الامتحان (الساعة 7:00 ص)</option>
                  <option value="custom_minutes">تحديد عدد الدقائق يدوياً</option>
                </select>
              </div>
            </div>

            {/* If custom minutes */}
            {triggerOption === 'custom_minutes' && (
              <div className="max-w-xs">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كم دقيقة قبل الامتحان؟
                </label>
                <input
                  type="number"
                  min="5"
                  max="10080"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-purple-500 outline-none"
                />
              </div>
            )}

            {/* Alarm Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رسالة التذكير الخاصة (اختياري)
              </label>
              <input
                type="text"
                value={alarmNotes}
                onChange={(e) => setAlarmNotes(e.target.value)}
                placeholder="مثال: مراجعة القوانين الصباحية، تجهيز بطاقة الهوية والآلة الحاسبة..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xs sm:text-sm"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>حفظ التنبيه</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Alarms List */}
      <div>
        <h3 className="font-extrabold text-base text-slate-900 mb-3">
          قائمة التنبيهات المجدولة ({alarms.length})
        </h3>

        {alarms.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-purple-100">
            <Bell className="w-10 h-10 text-purple-200 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-slate-500">لا توجد تنبيهات منبّه حالية.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alarms.map((alarm) => {
              const targetTime = new Date(alarm.scheduledTimestamp);
              const isPast = Date.now() > alarm.scheduledTimestamp;

              return (
                <div
                  key={alarm.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                    !alarm.isEnabled
                      ? 'border-slate-200 bg-slate-50/60 opacity-60'
                      : alarm.isFired
                      ? 'border-purple-100 bg-purple-50/20'
                      : 'border-slate-100 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        alarm.isEnabled
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Bell className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                          {alarm.subject}
                        </h4>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                          {getTriggerLabelArabic(alarm.triggerOption, alarm.customMinutesBefore)}
                        </span>
                        {alarm.isFired && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            تم الإطلاق
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>موعد الامتحان: {formatArabicDate(alarm.examDate)} (الساعة {alarm.examTime})</span>
                        <span>·</span>
                        <span className="text-purple-600 font-semibold">
                          وقت رنين المنبه: {targetTime.toLocaleDateString('ar-EG')} في{' '}
                          {targetTime.toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>

                      {alarm.notes && (
                        <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-2 rounded-lg">
                          {alarm.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Toggle Switch */}
                    <button
                      onClick={() => toggleAlarm(alarm.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                        alarm.isEnabled
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {alarm.isEnabled ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-purple-600" />
                          <span>نشط</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          <span>معطّل</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => deleteAlarm(alarm.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="حذف التنبيه"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
