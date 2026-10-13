import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Calendar,
  GraduationCap,
  CheckSquare,
  MoreHorizontal,
  Bookmark,
  Calculator,
  Bell,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

interface BottomNavProps {
  onOpenSettings: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenSettings }) => {
  const { activeTab, setActiveTab, exams, dailyTasks } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  const incompleteTasksCount = dailyTasks.filter((t) => !t.isCompleted).length;

  const isMoreTabActive = [
    'revision',
    'alarms',
    'calculator',
    'progress',
    'settings',
  ].includes(activeTab);

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* Pop-up More Sheet */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div
            ref={menuRef}
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-purple-100 mb-16 sm:mb-0"
          >
            <div className="flex items-center justify-between pb-4 border-b border-purple-50">
              <h3 className="font-bold text-slate-800 text-base">الأقسام الإضافية</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => handleSelectTab('revision')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 text-right transition-all ${
                  activeTab === 'revision'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs'
                    : 'border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 text-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">خطط المراجعة</div>
                  <div className="text-[11px] text-slate-500">توزيع فصول المواد</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectTab('alarms')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 text-right transition-all ${
                  activeTab === 'alarms'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs'
                    : 'border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 text-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">المنبّه والتذكير</div>
                  <div className="text-[11px] text-slate-500">تنبيهات الامتحانات</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectTab('calculator')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 text-right transition-all ${
                  activeTab === 'calculator'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs'
                    : 'border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 text-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">الآلة الحاسبة</div>
                  <div className="text-[11px] text-slate-500">حساب المعدل والدرجات</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectTab('progress')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 text-right transition-all ${
                  activeTab === 'progress'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs'
                    : 'border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 text-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">متابعة الإنجاز</div>
                  <div className="text-[11px] text-slate-500">إحصائيات وساعات المذاكرة</div>
                </div>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenSettings();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>الإعدادات والنسخ الاحتياطي</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-purple-100 shadow-lg px-2 py-1.5 sm:py-2">
        <div className="max-w-xl mx-auto flex items-center justify-around">
          {/* 1. Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'home'
                ? 'text-purple-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px] mt-1">الرئيسية</span>
          </button>

          {/* 2. Schedule */}
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'schedule'
                ? 'text-purple-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[11px] mt-1">الجدول</span>
          </button>

          {/* 3. Exams */}
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl relative transition-all ${
              activeTab === 'exams'
                ? 'text-purple-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[11px] mt-1">الامتحانات</span>
            {exams.length > 0 && (
              <span className="absolute top-1 left-2 w-2 h-2 rounded-full bg-purple-600" />
            )}
          </button>

          {/* 4. Daily Tasks */}
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl relative transition-all ${
              activeTab === 'tasks'
                ? 'text-purple-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[11px] mt-1">مهام اليوم</span>
            {incompleteTasksCount > 0 && (
              <span className="absolute top-0.5 left-2 bg-purple-600 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                {incompleteTasksCount}
              </span>
            )}
          </button>

          {/* 5. More */}
          <button
            onClick={() => setShowMoreMenu((prev) => !prev)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isMoreTabActive
                ? 'text-purple-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[11px] mt-1">المزيد</span>
          </button>
        </div>
      </nav>
    </>
  );
};
