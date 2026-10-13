/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { InitialPage } from './components/InitialPage';
import { HomeDashboard } from './components/HomeDashboard';
import { StudyScheduleView } from './components/StudyScheduleView';
import { ExamsView } from './components/ExamsView';
import { ExamAlarmView } from './components/ExamAlarmView';
import { RevisionPlansView } from './components/RevisionPlansView';
import { DailyTasksView } from './components/DailyTasksView';
import { CalculatorView } from './components/CalculatorView';
import { ProgressView } from './components/ProgressView';
import { SettingsModal } from './components/SettingsModal';
import { AlarmToastModal } from './components/AlarmToastModal';
import { Exam } from './types';

const MainAppContent: React.FC = () => {
  const { hasOnboarded, activeTab, setActiveTab } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [alarmTargetExamId, setAlarmTargetExamId] = useState<string | undefined>();

  // If user hasn't completed the initial page / onboarding
  if (!hasOnboarded) {
    return <InitialPage />;
  }

  const handleOpenAddAlarmForExam = (exam: Exam) => {
    setAlarmTargetExamId(exam.id);
    setActiveTab('alarms');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-white to-violet-50/30 text-slate-900 font-['Alexandria',sans-serif] flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main View Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {activeTab === 'home' && (
          <HomeDashboard
            onOpenAddSession={() => setActiveTab('schedule')}
            onOpenAddTask={() => setActiveTab('tasks')}
            onOpenAddExam={() => setActiveTab('exams')}
          />
        )}

        {activeTab === 'schedule' && <StudyScheduleView />}

        {activeTab === 'exams' && (
          <ExamsView onOpenAddAlarmForExam={handleOpenAddAlarmForExam} />
        )}

        {activeTab === 'alarms' && (
          <ExamAlarmView preselectedExamId={alarmTargetExamId} />
        )}

        {activeTab === 'revision' && <RevisionPlansView />}

        {activeTab === 'tasks' && <DailyTasksView />}

        {activeTab === 'calculator' && <CalculatorView />}

        {activeTab === 'progress' && <ProgressView />}
      </main>

      {/* Bottom Bar with 5 Navigation Anchors */}
      <BottomNav onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Live Audio & Visual Alarm Modal */}
      <AlarmToastModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
