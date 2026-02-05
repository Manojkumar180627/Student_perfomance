
export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  registerNo?: string;
  department?: string;
  password?: string;
  registrationDate?: string;
}

export interface AcademicData {
  id: string;
  studentId: string;
  studentName: string;
  attendance: number;
  internalMarks: number;
  assignmentScore: number;
  timestamp: string;
}

export interface PredictionResult {
  id: string;
  dataId: string;
  riskLevel: RiskLevel;
  riskScore: number;
  performanceScore: number;
  summary: string;
  recommendations: string[];
}

export interface StudentFullProfile extends AcademicData {
  prediction?: PredictionResult;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'REGISTRATION' | 'RISK_ALERT' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  linkTab?: 'OVERVIEW' | 'REGISTRATIONS';
  studentId?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetId: string;
  targetName: string;
  timestamp: string;
}

export interface UserFeedback {
  id: string;
  studentId: string;
  studentName: string;
  message: string;
  timestamp: string;
}
