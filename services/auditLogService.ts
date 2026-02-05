
import { AuditLog, User } from '../types';

const STORAGE_KEY = 'ai_student_audit_logs';

export const auditLogService = {
  getLogs: (): AuditLog[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  logAction: (admin: User, action: string, targetId: string, targetName: string) => {
    const logs = auditLogService.getLogs();
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      adminId: admin.id,
      adminName: admin.name,
      action,
      targetId,
      targetName,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newLog, ...logs].slice(0, 100)));
  }
};
