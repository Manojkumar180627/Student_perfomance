
import React from 'react';
import { User, UserRole, UserStatus } from './types';

export const COLORS = {
  LOW: 'text-emerald-700 bg-emerald-50 border-emerald-200 ring-emerald-500/10',
  MEDIUM: 'text-amber-700 bg-amber-50 border-amber-200 ring-emerald-500/10',
  HIGH: 'text-rose-700 bg-rose-50 border-rose-200 ring-rose-500/10',
};

// Explicitly define MOCK_STUDENTS as User[] with passwords for demo access
export const MOCK_STUDENTS: User[] = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'john@student.com', 
    role: UserRole.STUDENT, 
    status: UserStatus.APPROVED,
    password: 'student123',
    registerNo: 'REG-2024-001', 
    department: 'Computer Science' 
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    email: 'jane@student.com', 
    role: UserRole.STUDENT, 
    status: UserStatus.APPROVED,
    password: 'student123',
    registerNo: 'REG-2024-002', 
    department: 'Data Science' 
  },
  { 
    id: '3', 
    name: 'Dr. Sarah Wilson', 
    email: 'admin@faculty.com', 
    role: UserRole.ADMIN, 
    status: UserStatus.APPROVED,
    password: 'admin123',
    department: 'Faculty of Engineering' 
  },
];
