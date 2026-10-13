import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Bell,
  Volume2,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Check,
  Flame,
  Scale,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    userProfile,
    updateUserProfile,
    resetToSampleData,
    applyLawCurriculum,
    clearAllUserData,
    exportDataToJson,
    importDataFromJson,
    enableSystemNotifications,
    notificationPermission,
    testAlarmSound,
  } = useApp();

  const [name, setName] = useState(userProfile.name);
  const [stage, setStage] = useState(userProfile.stage);
  const [dailyGoalHours, setDailyGoalHours] = useState(userProfile.dailyGoalHours);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      stage,
      dailyGoalHours,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDataFromJson(content);
        if (ok) {
          alert('تم استيراد بيانات النسخة الاحتياطية بنجاح!');
          onClose();
        } else {
          alert('تعذر استيراد الملف. يرجى التأكد من اختيار ملف JSON صحيح من المنصة القانونية.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-50">
          <h3 className="font-extrabold text-lg text-slate-900">
            الإعدادات والملف الشخصي
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Section */}
        <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
          <div className="flex items-center gap-2 mb-2 font-extrabold text-sm text-purple-950">
            <User className="w-4 h-4 text-purple-600" />
            <span>بيانات الطالب الدراسية</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم الطالب
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              المرحلة الدراسية
            </label>
            <input
              type="text"
              required
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              placeholder="مثال: الثانوية العامة / الهندسة"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              الهدف اليومي للمذاكرة (بالساعات)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="18"
                value={dailyGoalHours}
                onChange={(e) => setDailyGoalHours(Number(e.target.value))}
                className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-purple-500 outline-none"
              />
              <span className="text-xs text-slate-500">ساعات يومياً</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>تم حفظ التعديلات!</span>
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              حفظ بيانات الملف
            </button>
          </div>
        </form>

        {/* Notifications & Audio toggles */}
        <div className="mt-6 pt-5 border-t border-purple-50 space-y-3">
          <div className="flex items-center gap-2 mb-2 font-extrabold text-sm text-purple-950">
            <Bell className="w-4 h-4 text-purple-600" />
            <span>تفضيلات التنبيهات والأصوات</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
            <div>
              <span className="block text-xs font-bold text-slate-800">
                إشعارات المتصفح والنظام
              </span>
              <span className="text-[11px] text-slate-500">
                {notificationPermission === 'granted' ? 'مفعلة' : 'تحتاج إذن'}
              </span>
            </div>

            <button
              type="button"
              onClick={enableSystemNotifications}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-purple-300 text-purple-700 text-xs font-bold transition-colors"
            >
              {notificationPermission === 'granted' ? 'تمكين مجدداً' : 'طلب الصلاحية'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
            <div>
              <span className="block text-xs font-bold text-slate-800">
                نغمة التنبيه الصوتية
              </span>
              <span className="text-[11px] text-slate-500">
                {userProfile.soundEnabled ? 'مفعلة' : 'معطلة'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={testAlarmSound}
                className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition-colors"
              >
                تجربة النغمة
              </button>
              <button
                type="button"
                onClick={() =>
                  updateUserProfile({ soundEnabled: !userProfile.soundEnabled })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  userProfile.soundEnabled
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {userProfile.soundEnabled ? 'مفعّل' : 'مكتوم'}
              </button>
            </div>
          </div>
        </div>

        {/* Data Backup & Restore */}
        <div className="mt-6 pt-5 border-t border-purple-50 space-y-3">
          <div className="flex items-center gap-2 mb-2 font-extrabold text-sm text-purple-950">
            <Download className="w-4 h-4 text-purple-600" />
            <span>النسخ الاحتياطي واستيراد البيانات</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={exportDataToJson}
              className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تصدير نسخة احتياطية</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>استيراد نسخة سابقة</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Public Law Curriculum Quick Apply */}
        <div className="mt-6 pt-5 border-t border-purple-50 space-y-2">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-purple-950">
                <Scale className="w-4 h-4 text-purple-600" />
                <span>خطة مواد القانون العام (كليات الحقوق)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                تطبيق جدول مواد: الدستوري، العقوبات، المالية والضرائب، وأصول البحث.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('هل تريد تفعيل وتحميل خطة مواد القانون العام (الدستوري، العقوبات، المالية، أصول البحث)؟')) {
                  applyLawCurriculum();
                  onClose();
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>تطبيق الخطة فوراً</span>
            </button>
          </div>
        </div>

        {/* Sample Data & Reset */}
        <div className="mt-4 pt-3 border-t border-purple-50 space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm('هل تريد إعادة تحميل البيانات التجريبية الشاملة؟')) {
                  resetToSampleData();
                  onClose();
                }
              }}
              className="text-xs font-bold text-purple-700 hover:bg-purple-50 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة ضبط البيانات</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('تنبيه: هل أنت متأكد من مسح جميع البيانات والجداول؟')) {
                  clearAllUserData();
                  onClose();
                }
              }}
              className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>مسح كل البيانات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
