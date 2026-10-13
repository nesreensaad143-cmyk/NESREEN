import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  ActiveTab,
  DailyTask,
  Exam,
  ExamAlarm,
  RevisionPlan,
  RevisionTopic,
  StudySession,
  UserProfile,
} from '../types';
import {
  DEFAULT_USER_PROFILE,
  STORAGE_KEYS,
  generateSampleData,
  loadStoredData,
  saveStoredData,
} from '../utils/storage';
import { doSessionsOverlap } from '../utils/dateUtils';
import {
  calculateAlarmTimestamp,
  requestNotificationPermission,
  showSystemNotification,
} from '../utils/notifications';
import { sound } from '../utils/audio';

export interface TriggeredAlarmAlert {
  id: string;
  subject: string;
  examDate: string;
  examTime: string;
  notes?: string;
  location?: string;
  firedAt: string;
}

interface AppContextType {
  // Navigation & Onboarding
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasOnboarded: boolean;
  completeOnboarding: (name?: string, stage?: string) => void;

  // Profile & Settings
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Study Sessions
  studySessions: StudySession[];
  addStudySession: (session: Omit<StudySession, 'id' | 'createdAt'>) => { success: boolean; conflictWith?: StudySession };
  updateStudySession: (id: string, session: Partial<StudySession>) => { success: boolean; conflictWith?: StudySession };
  deleteStudySession: (id: string) => void;
  toggleSessionCompletion: (id: string) => void;
  checkSessionConflict: (date: string, startTime: string, endTime: string, ignoreId?: string) => StudySession | undefined;

  // Exams
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => string;
  updateExam: (id: string, exam: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  // Alarms
  alarms: ExamAlarm[];
  addAlarm: (alarm: Omit<ExamAlarm, 'id' | 'isFired'>) => void;
  updateAlarm: (id: string, alarm: Partial<ExamAlarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  testAlarmSound: () => void;
  triggerManualAlarmPreview: (subject: string, notes?: string) => void;

  // Revision Plans
  revisionPlans: RevisionPlan[];
  addRevisionPlan: (plan: Omit<RevisionPlan, 'id' | 'createdAt'>) => void;
  updateRevisionPlan: (id: string, plan: Partial<RevisionPlan>) => void;
  deleteRevisionPlan: (id: string) => void;
  updateTopicStatus: (planId: string, topicId: string, status: RevisionTopic['status']) => void;
  addTopicToPlan: (planId: string, topic: Omit<RevisionTopic, 'id'>) => void;
  deleteTopicFromPlan: (planId: string, topicId: string) => void;

  // Daily Tasks
  dailyTasks: DailyTask[];
  addTask: (task: Omit<DailyTask, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<DailyTask>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  rolloverIncompleteTasksToTomorrow: () => number;

  // Data reset / import / export
  resetToSampleData: () => void;
  applyLawCurriculum: () => void;
  clearAllUserData: () => void;
  exportDataToJson: () => void;
  importDataFromJson: (jsonStr: string) => boolean;

  // Active Alarm Popup Modal
  activeAlarmAlert: TriggeredAlarmAlert | null;
  dismissAlarmAlert: () => void;
  snoozeAlarmAlert: (minutes?: number) => void;

  // Browser notification request helper
  enableSystemNotifications: () => Promise<boolean>;
  notificationPermission: 'granted' | 'denied' | 'default';
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if onboarding completed
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
    return loadStoredData<boolean>(STORAGE_KEYS.HAS_ONBOARDED, false);
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const loaded = loadStoredData<UserProfile>(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER_PROFILE);
    if (!loaded.stage || loaded.stage.includes('الثانوية العامة')) {
      return { ...loaded, stage: 'كلية الحقوق – شعبة القانون العام' };
    }
    return loaded;
  });

  // Load state or sample defaults with automatic transition to Law curriculum if old sample existed
  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    const loaded = loadStoredData<StudySession[] | null>(STORAGE_KEYS.SESSIONS, null);
    if (loaded && Array.isArray(loaded)) {
      if (loaded.some((s) => s.subject.includes('الفيزياء') || s.subject.includes('الرياضيات'))) {
        return generateSampleData().sampleSessions;
      }
      return loaded;
    }
    return generateSampleData().sampleSessions;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const loaded = loadStoredData<Exam[] | null>(STORAGE_KEYS.EXAMS, null);
    if (loaded && Array.isArray(loaded)) {
      if (loaded.some((e) => e.subject.includes('الفيزياء') || e.subject.includes('الرياضيات'))) {
        return generateSampleData().sampleExams;
      }
      return loaded;
    }
    return generateSampleData().sampleExams;
  });

  const [alarms, setAlarms] = useState<ExamAlarm[]>(() => {
    const loaded = loadStoredData<ExamAlarm[] | null>(STORAGE_KEYS.ALARMS, null);
    if (loaded && Array.isArray(loaded)) {
      if (loaded.some((a) => a.subject.includes('الفيزياء') || a.subject.includes('الرياضيات'))) {
        return generateSampleData().sampleAlarms;
      }
      return loaded;
    }
    return generateSampleData().sampleAlarms;
  });

  const [revisionPlans, setRevisionPlans] = useState<RevisionPlan[]>(() => {
    const loaded = loadStoredData<RevisionPlan[] | null>(STORAGE_KEYS.REVISION_PLANS, null);
    if (loaded && Array.isArray(loaded)) {
      if (loaded.some((p) => p.subject.includes('الفيزياء') || p.subject.includes('الرياضيات'))) {
        return generateSampleData().samplePlans;
      }
      return loaded;
    }
    return generateSampleData().samplePlans;
  });

  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(() => {
    const loaded = loadStoredData<DailyTask[] | null>(STORAGE_KEYS.TASKS, null);
    if (loaded && Array.isArray(loaded)) {
      if (loaded.some((t) => t.title.includes('الفيزياء') || t.title.includes('تفاضل وتكامل'))) {
        return generateSampleData().sampleTasks;
      }
      return loaded;
    }
    return generateSampleData().sampleTasks;
  });

  const [activeAlarmAlert, setActiveAlarmAlert] = useState<TriggeredAlarmAlert | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | 'default'>('default');

  // Sync state to LocalStorage
  useEffect(() => {
    saveStoredData(STORAGE_KEYS.HAS_ONBOARDED, hasOnboarded);
  }, [hasOnboarded]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.USER_PROFILE, userProfile);
  }, [userProfile]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.SESSIONS, studySessions);
  }, [studySessions]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.EXAMS, exams);
  }, [exams]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.ALARMS, alarms);
  }, [alarms]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.REVISION_PLANS, revisionPlans);
  }, [revisionPlans]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.TASKS, dailyTasks);
  }, [dailyTasks]);

  // Check initial notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const completeOnboarding = (name?: string, stage?: string) => {
    if (name || stage) {
      setUserProfile((prev) => ({
        ...prev,
        ...(name ? { name } : {}),
        ...(stage ? { stage } : {}),
      }));
    }
    setHasOnboarded(true);
    setActiveTab('home');
  };

  const updateUserProfile = (patch: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...patch }));
  };

  // Conflict detection
  const checkSessionConflict = useCallback(
    (date: string, startTime: string, endTime: string, ignoreId?: string): StudySession | undefined => {
      return studySessions.find((sess) => {
        if (ignoreId && sess.id === ignoreId) return false;
        return doSessionsOverlap(date, startTime, endTime, sess.date, sess.startTime, sess.endTime);
      });
    },
    [studySessions]
  );

  const addStudySession = (newSessData: Omit<StudySession, 'id' | 'createdAt'>) => {
    const conflict = checkSessionConflict(newSessData.date, newSessData.startTime, newSessData.endTime);
    const newSession: StudySession = {
      ...newSessData,
      id: 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    setStudySessions((prev) => [newSession, ...prev]);
    sound.playSuccess();
    return { success: true, conflictWith: conflict };
  };

  const updateStudySession = (id: string, patch: Partial<StudySession>) => {
    const target = studySessions.find((s) => s.id === id);
    if (!target) return { success: false };

    const checkDate = patch.date || target.date;
    const checkStart = patch.startTime || target.startTime;
    const checkEnd = patch.endTime || target.endTime;

    const conflict = checkSessionConflict(checkDate, checkStart, checkEnd, id);

    setStudySessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
    return { success: true, conflictWith: conflict };
  };

  const deleteStudySession = (id: string) => {
    setStudySessions((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSessionCompletion = (id: string) => {
    setStudySessions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const next = !s.isCompleted;
          if (next) sound.playChime();
          return { ...s, isCompleted: next };
        }
        return s;
      })
    );
  };

  // Exams management
  const addExam = (examData: Omit<Exam, 'id' | 'createdAt'>) => {
    const id = 'exam-' + Date.now();
    const newExam: Exam = {
      ...examData,
      id,
      createdAt: new Date().toISOString(),
    };
    setExams((prev) => [...prev, newExam]);

    // Automatically create a standard alarm (1 day before) for the student
    const defaultAlarm: ExamAlarm = {
      id: 'alarm-' + Date.now(),
      examId: id,
      subject: newExam.subject,
      examDate: newExam.date,
      examTime: newExam.time,
      triggerOption: '1_day_before',
      scheduledTimestamp: calculateAlarmTimestamp(newExam.date, newExam.time, '1_day_before'),
      isEnabled: true,
      isFired: false,
      notes: newExam.notes || 'تذكير بموعد الامتحان',
    };
    setAlarms((prev) => [defaultAlarm, ...prev]);

    sound.playSuccess();
    return id;
  };

  const updateExam = (id: string, patch: Partial<Exam>) => {
    setExams((prev) =>
      prev.map((ex) => {
        if (ex.id === id) {
          const updated = { ...ex, ...patch };
          // If date or time changed, update associated alarms
          if (patch.date || patch.time) {
            setAlarms((prevAlarms) =>
              prevAlarms.map((a) => {
                if (a.examId === id) {
                  const newDate = updated.date;
                  const newTime = updated.time;
                  return {
                    ...a,
                    examDate: newDate,
                    examTime: newTime,
                    subject: updated.subject,
                    scheduledTimestamp: calculateAlarmTimestamp(
                      newDate,
                      newTime,
                      a.triggerOption,
                      a.customMinutesBefore
                    ),
                  };
                }
                return a;
              })
            );
          }
          return updated;
        }
        return ex;
      })
    );
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((ex) => ex.id !== id));
    // Clean up alarms linked to this exam
    setAlarms((prev) => prev.filter((al) => al.examId !== id));
  };

  // Alarms management
  const addAlarm = (alarmData: Omit<ExamAlarm, 'id' | 'isFired'>) => {
    const newAlarm: ExamAlarm = {
      ...alarmData,
      id: 'alarm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      isFired: false,
    };
    setAlarms((prev) => [newAlarm, ...prev]);
    sound.playSuccess();
  };

  const updateAlarm = (id: string, patch: Partial<ExamAlarm>) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );
  };

  const deleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a))
    );
  };

  const testAlarmSound = () => {
    sound.playAlarm();
  };

  const triggerManualAlarmPreview = (subject: string, notes?: string) => {
    sound.playAlarm();
    setActiveAlarmAlert({
      id: 'test-' + Date.now(),
      subject,
      examDate: 'اليوم',
      examTime: 'الآن',
      notes: notes || 'هذا تنبيه تجريبي لاختبار الصوت والإشعارات في المنصة القانونية',
      firedAt: new Date().toLocaleTimeString('ar-EG'),
    });
  };

  // Revision Plans
  const addRevisionPlan = (planData: Omit<RevisionPlan, 'id' | 'createdAt'>) => {
    const newPlan: RevisionPlan = {
      ...planData,
      id: 'plan-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setRevisionPlans((prev) => [newPlan, ...prev]);
    sound.playSuccess();
  };

  const updateRevisionPlan = (id: string, patch: Partial<RevisionPlan>) => {
    setRevisionPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  };

  const deleteRevisionPlan = (id: string) => {
    setRevisionPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const updateTopicStatus = (planId: string, topicId: string, status: RevisionTopic['status']) => {
    setRevisionPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          const updatedTopics = p.topics.map((t) => (t.id === topicId ? { ...t, status } : t));
          if (status === 'completed') {
            sound.playChime();
          }
          return { ...p, topics: updatedTopics };
        }
        return p;
      })
    );
  };

  const addTopicToPlan = (planId: string, topic: Omit<RevisionTopic, 'id'>) => {
    const newTopic: RevisionTopic = {
      ...topic,
      id: 'top-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
    };
    setRevisionPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, topics: [...p.topics, newTopic] } : p))
    );
  };

  const deleteTopicFromPlan = (planId: string, topicId: string) => {
    setRevisionPlans((prev) =>
      prev.map((p) =>
        p.id === planId ? { ...p, topics: p.topics.filter((t) => t.id !== topicId) } : p
      )
    );
  };

  // Daily Tasks
  const addTask = (taskData: Omit<DailyTask, 'id' | 'createdAt'>) => {
    const newTask: DailyTask = {
      ...taskData,
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      createdAt: new Date().toISOString(),
    };
    setDailyTasks((prev) => [newTask, ...prev]);
    sound.playSuccess();
  };

  const updateTask = (id: string, patch: Partial<DailyTask>) => {
    setDailyTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  };

  const deleteTask = (id: string) => {
    setDailyTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    setDailyTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = !t.isCompleted;
          if (next) sound.playChime();
          return { ...t, isCompleted: next };
        }
        return t;
      })
    );
  };

  // Rollover incomplete tasks to tomorrow
  const rolloverIncompleteTasksToTomorrow = (): number => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const tomorrowStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    let count = 0;
    setDailyTasks((prev) =>
      prev.map((task) => {
        if (!task.isCompleted) {
          count++;
          return { ...task, date: tomorrowStr };
        }
        return task;
      })
    );
    if (count > 0) sound.playSuccess();
    return count;
  };

  // Active alarm alert handling
  const dismissAlarmAlert = () => {
    setActiveAlarmAlert(null);
  };

  const snoozeAlarmAlert = (minutes = 5) => {
    if (!activeAlarmAlert) return;
    const alertCopy = { ...activeAlarmAlert };
    setActiveAlarmAlert(null);
    setTimeout(() => {
      sound.playAlarm();
      setActiveAlarmAlert(alertCopy);
    }, minutes * 60 * 1000);
  };

  // Request browser notification
  const enableSystemNotifications = async (): Promise<boolean> => {
    const status = await requestNotificationPermission();
    setNotificationPermission(status);
    if (status === 'granted') {
      showSystemNotification('تم تفعيل إشعارات المنصة القانونية!', {
        body: 'ستصلك تذكيرات بالامتحانات وجلسات المذاكرة في الموعد المحدد.',
      });
      setUserProfile((prev) => ({ ...prev, notificationsEnabled: true }));
      return true;
    }
    return false;
  };

  // Background Alarm Checker loop (runs every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const nowMs = Date.now();

      alarms.forEach((alarm) => {
        if (alarm.isEnabled && !alarm.isFired) {
          // If scheduled timestamp is reached or slightly past (within last 2 minutes)
          if (nowMs >= alarm.scheduledTimestamp && nowMs - alarm.scheduledTimestamp < 2 * 60 * 1000) {
            // Find exam location & details
            const exam = exams.find((e) => e.id === alarm.examId);

            // Fire Alarm!
            if (userProfile.soundEnabled) {
              sound.playAlarm();
            }

            if (userProfile.notificationsEnabled) {
              showSystemNotification(`تذكير امتحان: ${alarm.subject}`, {
                body: `موعد الامتحان: ${alarm.examDate} في تمام ${alarm.examTime}${exam?.location ? ` - ${exam.location}` : ''}`,
              });
            }

            setActiveAlarmAlert({
              id: alarm.id,
              subject: alarm.subject,
              examDate: alarm.examDate,
              examTime: alarm.examTime,
              location: exam?.location,
              notes: alarm.notes || exam?.notes,
              firedAt: new Date().toLocaleTimeString('ar-EG'),
            });

            // Mark alarm as fired so it doesn't trigger repeatedly
            updateAlarm(alarm.id, { isFired: true });
          }
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [alarms, exams, userProfile]);

  // Data helpers
  const resetToSampleData = () => {
    const sample = generateSampleData();
    setExams(sample.sampleExams);
    setStudySessions(sample.sampleSessions);
    setDailyTasks(sample.sampleTasks);
    setAlarms(sample.sampleAlarms);
    setRevisionPlans(sample.samplePlans);
    setUserProfile(DEFAULT_USER_PROFILE);
    sound.playSuccess();
  };

  const applyLawCurriculum = () => {
    const sample = generateSampleData();
    setExams(sample.sampleExams);
    setStudySessions(sample.sampleSessions);
    setDailyTasks(sample.sampleTasks);
    setAlarms(sample.sampleAlarms);
    setRevisionPlans(sample.samplePlans);
    setUserProfile((prev) => ({
      ...prev,
      stage: 'كلية الحقوق – شعبة القانون العام',
    }));
    sound.playSuccess();
  };

  const clearAllUserData = () => {
    setExams([]);
    setStudySessions([]);
    setDailyTasks([]);
    setAlarms([]);
    setRevisionPlans([]);
  };

  const exportDataToJson = () => {
    const exportData = {
      version: 1,
      appName: 'المنصة القانونية - The Legal Platform',
      exportedAt: new Date().toISOString(),
      userProfile,
      studySessions,
      exams,
      alarms,
      revisionPlans,
      dailyTasks,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `al_manassa_al_qanuniya_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDataFromJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.studySessions)) setStudySessions(data.studySessions);
      if (Array.isArray(data.exams)) setExams(data.exams);
      if (Array.isArray(data.alarms)) setAlarms(data.alarms);
      if (Array.isArray(data.revisionPlans)) setRevisionPlans(data.revisionPlans);
      if (Array.isArray(data.dailyTasks)) setDailyTasks(data.dailyTasks);
      if (data.userProfile) setUserProfile(data.userProfile);
      sound.playSuccess();
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      hasOnboarded,
      completeOnboarding,
      userProfile,
      updateUserProfile,
      studySessions,
      addStudySession,
      updateStudySession,
      deleteStudySession,
      toggleSessionCompletion,
      checkSessionConflict,
      exams,
      addExam,
      updateExam,
      deleteExam,
      alarms,
      addAlarm,
      updateAlarm,
      deleteAlarm,
      toggleAlarm,
      testAlarmSound,
      triggerManualAlarmPreview,
      revisionPlans,
      addRevisionPlan,
      updateRevisionPlan,
      deleteRevisionPlan,
      updateTopicStatus,
      addTopicToPlan,
      deleteTopicFromPlan,
      dailyTasks,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompletion,
      rolloverIncompleteTasksToTomorrow,
      resetToSampleData,
      applyLawCurriculum,
      clearAllUserData,
      exportDataToJson,
      importDataFromJson,
      activeAlarmAlert,
      dismissAlarmAlert,
      snoozeAlarmAlert,
      enableSystemNotifications,
      notificationPermission,
    }),
    [
      activeTab,
      hasOnboarded,
      userProfile,
      studySessions,
      exams,
      alarms,
      revisionPlans,
      dailyTasks,
      activeAlarmAlert,
      notificationPermission,
      checkSessionConflict,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
