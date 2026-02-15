export type UserRole = 'admin' | 'intern';
export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface Company {
  id: number;
  name: string;
}

export interface User {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  companyId: number | null;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  status: AttendanceStatus;
  morningStart?: string;
  morningEnd?: string;
  afternoonStart?: string;
  afternoonEnd?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
