import React from 'react';
import { Bell, Clock, MapPin, X, Volume2, Sparkles, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatArabicDate, formatArabicTime } from '../utils/dateUtils';

export const AlarmToastModal: React.FC = () => {
  const { activeAlarmAlert, dismissAlarmAlert, snoozeAlarmAlert } = useApp();

  if (!activeAlarmAlert) return null;

  return (
    <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-purple-300 relative text-right animate-in zoom-in-95">
        {/* Pulsing Bell Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30 animate-bounce">
          <Bell className="w-8 h-8" />
        </div>

        <div className="text-center">
          <span className="text-xs font-black tracking-wider text-purple-600 uppercase">
            تنبيه منبّه المنصة القانونية
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            حان موعد الاستعداد لامتحان:
          </h3>
          <h4 className="text-xl font-extrabold text-purple-700 mt-1">
            {activeAlarmAlert.subject}
          </h4>
        </div>

        <div className="my-5 p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">موعد الامتحان:</span>
            <span className="font-bold text-slate-900">
              {activeAlarmAlert.examDate} في {activeAlarmAlert.examTime}
            </span>
          </div>

          {activeAlarmAlert.location && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">المكان / اللجنة:</span>
              <span className="font-bold text-slate-900">{activeAlarmAlert.location}</span>
            </div>
          )}

          {activeAlarmAlert.notes && (
            <div className="pt-2 border-t border-purple-100/60 text-slate-600">
              <span className="font-bold block mb-0.5 text-purple-900">ملاحظات التنبيه:</span>
              <span>{activeAlarmAlert.notes}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => snoozeAlarmAlert(5)}
            className="flex-1 py-3 px-4 rounded-xl border border-purple-200 hover:bg-purple-50 text-purple-800 font-bold text-xs transition-colors"
          >
            غفوة (5 دقائق)
          </button>

          <button
            onClick={dismissAlarmAlert}
            className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/25 transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>حسناً، فهمت</span>
          </button>
        </div>
      </div>
    </div>
  );
};
