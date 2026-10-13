import React from 'react';
import { Bell, Volume2, VolumeX, Settings, Sparkles, Scale } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatArabicDate } from '../utils/dateUtils';

interface NavbarProps {
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings }) => {
  const {
    userProfile,
    updateUserProfile,
    enableSystemNotifications,
    notificationPermission,
    testAlarmSound,
  } = useApp();

  const todayStr = new Date().toISOString().slice(0, 10);
  const arabicDate = formatArabicDate(todayStr);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-200">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-purple-950 tracking-tight">المنصة القانونية</span>
              <span className="text-xs text-purple-600 font-medium hidden sm:inline">منظّم دراسة القانون</span>
            </div>
            <p className="text-xs text-slate-500 font-normal">{arabicDate}</p>
          </div>
        </div>

        {/* User Info & Quick Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification status / request */}
          <button
            onClick={() => {
              if (notificationPermission !== 'granted') {
                enableSystemNotifications();
              }
            }}
            title={
              notificationPermission === 'granted'
                ? 'الإشعارات مفعلة'
                : 'اضغط لتفعيل إشعارات المتصفح'
            }
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
              notificationPermission === 'granted'
                ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span className="hidden md:inline font-medium">
              {notificationPermission === 'granted' ? 'الإشعارات نشطة' : 'تفعيل الإشعارات'}
            </span>
          </button>

          {/* Sound Toggle / Test */}
          <button
            onClick={() => {
              const nextState = !userProfile.soundEnabled;
              updateUserProfile({ soundEnabled: nextState });
              if (nextState) testAlarmSound();
            }}
            title={userProfile.soundEnabled ? 'صوت التنبيهات مفعّل' : 'صوت التنبيهات مكتوم'}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            {userProfile.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-purple-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            title="الإعدادات والملف الشخصي"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Profile mini avatar */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 pr-1 pl-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-100 transition-colors text-right"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
              {userProfile.name ? userProfile.name.charAt(0) : 'ط'}
            </div>
            <div className="hidden sm:block text-right">
              <span className="block text-xs font-semibold text-slate-800 leading-tight">
                {userProfile.name}
              </span>
              <span className="block text-[10px] text-purple-600 leading-none">
                {userProfile.stage}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
