
  import { AcademicData, PredictionResult, StudentFullProfile, User, UserStatus, SystemNotification, UserFeedback, RiskLevel } from '../types';
  import { MOCK_STUDENTS } from '../constants';

  const STORAGE_KEYS = {
    ACADEMIC_DATA: 'ai_student_academic_data',
    PREDICTIONS: 'ai_student_predictions',
    USERS: 'ai_student_users',
    NOTIFICATIONS: 'ai_student_notifications',
    FEEDBACK: 'ai_student_feedback',
  };

  export const storageService = {
    // User Management
    getUsers: (): User[] => {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      const users = stored ? JSON.parse(stored) : [];
      const merged: User[] = JSON.parse(JSON.stringify(MOCK_STUDENTS));
      users.forEach((u: User) => {
        const isMock = MOCK_STUDENTS.some(m => m.email.toLowerCase() === u.email.toLowerCase());
        if (!isMock) merged.push(u);
      });
      return merged;
    },

    saveUser: (user: User) => {
      const isMock = MOCK_STUDENTS.some(m => m.email.toLowerCase() === user.email.toLowerCase());
      if (isMock) return;
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      let users = stored ? JSON.parse(stored) : [];
      const idx = users.findIndex((u: any) => u.id === user.id);
      if (idx > -1) users[idx] = user;
      else users.push(user);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    },

    updateUserStatus: (userId: string, status: UserStatus) => {
      const users = storageService.getUsers();
      const user = users.find(u => u.id === userId);
      if (user) {
        user.status = status;
        storageService.saveUser(user);
      }
    },

    // Notifications
    getNotifications: (): SystemNotification[] => {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return stored ? JSON.parse(stored) : [];
    },

    addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
      const notifications = storageService.getNotifications();
      const newNotif: SystemNotification = {
        ...notif,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        read: false
      };
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([newNotif, ...notifications].slice(0, 50)));
    },

    markAsRead: (id: string) => {
      const notifications = storageService.getNotifications();
      const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    },

    markAllAsRead: () => {
      const notifications = storageService.getNotifications();
      const updated = notifications.map(n => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    },

    // Feedback
    getFeedback: (): UserFeedback[] => {
      const stored = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      return stored ? JSON.parse(stored) : [];
    },

    addFeedback: (student: User, message: string) => {
      const feedback = storageService.getFeedback();
      const newFeedback: UserFeedback = {
        id: Math.random().toString(36).substr(2, 9),
        studentId: student.id,
        studentName: student.name,
        message,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify([newFeedback, ...feedback]));
    },

    // Academic Data
    saveAcademicData: (data: AcademicData) => {
      const existing = storageService.getAllAcademicData();
      const updated = [...existing, data];
      localStorage.setItem(STORAGE_KEYS.ACADEMIC_DATA, JSON.stringify(updated));
      
      // Generic notification for simple updates
      storageService.addNotification({
        title: 'Registry Sync',
        message: `${data.studentName} updated academic metrics.`,
        type: 'SYSTEM',
        studentId: data.studentId
      });
    },

    getAllAcademicData: (): AcademicData[] => {
      const data = localStorage.getItem(STORAGE_KEYS.ACADEMIC_DATA);
      return data ? JSON.parse(data) : [];
    },

    getStudentHistory: (studentId: string): AcademicData[] => {
      return storageService.getAllAcademicData()
        .filter(d => d.studentId === studentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    savePrediction: (prediction: PredictionResult, studentName: string) => {
      const existing = storageService.getAllPredictions();
      const updated = [...existing, prediction];
      localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(updated));

      // TRIGGER RED ALERT IF RISK IS HIGH
      if (prediction.riskLevel === RiskLevel.HIGH) {
        storageService.addNotification({
          title: 'CRITICAL: HIGH RISK DETECTED',
          message: `URGENT: ${studentName} has been flagged as HIGH RISK (Score: ${prediction.performanceScore}). Faculty intervention required.`,
          type: 'RISK_ALERT',
          studentId: prediction.dataId
        });
      }
    },

    getAllPredictions: (): PredictionResult[] => {
      const data = localStorage.getItem(STORAGE_KEYS.PREDICTIONS);
      return data ? JSON.parse(data) : [];
    },

    getPredictionForData: (dataId: string): PredictionResult | undefined => {
      return storageService.getAllPredictions().find(p => p.dataId === dataId);
    },

    getStudentProfiles: (): StudentFullProfile[] => {
      const data = storageService.getAllAcademicData();
      const preds = storageService.getAllPredictions();
      const latestData: Record<string, AcademicData> = {};
      data.forEach(d => {
        if (!latestData[d.studentId] || new Date(d.timestamp) > new Date(latestData[d.studentId].timestamp)) {
          latestData[d.studentId] = d;
        }
      });
      return Object.values(latestData).map(d => {
        const pred = preds.find(p => p.dataId === d.id);
        return { ...d, prediction: pred };
      });
    }
  };
