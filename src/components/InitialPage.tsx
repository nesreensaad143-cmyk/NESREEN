import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Bell,
  Calculator,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InitialPage: React.FC = () => {
  const { completeOnboarding, applyLawCurriculum } = useApp();
  const [name, setName] = useState('طالب الحقوق');
  const [stage, setStage] = useState('كلية الحقوق – شعبة القانون العام');
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState('law.student@studymate.app');
  const [password, setPassword] = useState('••••••••');

  const handleStart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    completeOnboarding(name || 'طالب القانون', stage);
  };

  const handleDemoStart = () => {
    applyLawCurriculum();
    completeOnboarding('طالب الحقوق', 'كلية الحقوق – شعبة القانون العام');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/70 via-white to-violet-50/50 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Brand Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-purple-200">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-2xl text-purple-950 tracking-tight">المنصة القانونية</h1>
            <p className="text-xs text-purple-600 font-medium">منظّم مواد القانون العام والامتحانات</p>
          </div>
        </div>

        <button
          onClick={handleDemoStart}
          className="text-xs sm:text-sm font-semibold text-purple-700 bg-purple-100/80 hover:bg-purple-200/90 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>تطبيق خطة مواد القانون العام</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="max-w-3xl mx-auto w-full my-auto py-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>مخصص لطلبة كليات الحقوق وشعبة القانون العام</span>
        </div>

        {/* Big Heading */}
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-snug">
          نظّمي مذاكرتك، خطّطي لامتحاناتك،
          <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            وحققي التفوق في مواد القانون العام
          </span>
        </h2>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          تطبيق متكامل ومنظّم لمواد: <strong>القانون الدستوري</strong>، <strong>قانون العقوبات العام</strong>، <strong>قانون المالية العامة والتشريع الضريبي</strong>، و<strong>أصول البحث القانوني</strong> مع جداول مخصصة وعدّاد تنازلي ومنبّه ذكي.
        </p>

        {/* Auth / Profile Setup Card */}
        <div className="mt-8 max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-purple-900/5 border border-purple-100 text-right">
          {/* Mode switch */}
          <div className="flex bg-purple-50 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                !isLoginMode
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              إنشاء حساب طالب جديد
            </button>
            <button
              type="button"
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                isLoginMode
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تسجيل الدخول
            </button>
          </div>

          <form onSubmit={handleStart} className="space-y-4">
            {!isLoginMode ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    اسم الطالب / الطالبة
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: سارة أحمد أو محمد علي"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    المرحلة الدراسية أو التخصص
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm transition-all bg-white"
                  >
                    <option value="كلية الحقوق – شعبة القانون العام">كلية الحقوق – شعبة القانون العام</option>
                    <option value="كلية الحقوق – الفرقة الأولى">كلية الحقوق – الفرقة الأولى</option>
                    <option value="كلية الحقوق – الفرقة الثانية">كلية الحقوق – الفرقة الثانية</option>
                    <option value="كلية الحقوق – دراسات عليا قانون عام">دراسات عليا / ماجستير القانون العام</option>
                    <option value="مرحلة جامعية عامة">مرحلة جامعية / تخصص آخر</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm transition-all"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>ابدأ الآن (Get Started)</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>حفظ تلقائي محلي لبياناتك وجداولك دون فقدان</span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-right">
          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-purple-100/70 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2.5">
              <Calendar className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">جداول مذاكرة ذكية</h4>
            <p className="text-xs text-slate-500 mt-1">كشف التعارض وأولويات المواد</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-purple-100/70 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2.5">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">عدّاد الامتحانات</h4>
            <p className="text-xs text-slate-500 mt-1">عدّاد تنازلي حقيقي بالثواني</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-purple-100/70 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5">
              <Bell className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">منبّه وتذكير فعال</h4>
            <p className="text-xs text-slate-500 mt-1">أصوات تنبيه وإشعارات فعلية</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-purple-100/70 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-2.5">
              <Calculator className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">آلة حاسبة ومعدل</h4>
            <p className="text-xs text-slate-500 mt-1">حساب الدرجات والهدف المتبقي</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        المنصة القانونية © 2026 – صُممت لدعم طلبة كليات الحقوق وتنظيم دراسة القانون العام
      </footer>
    </div>
  );
};
