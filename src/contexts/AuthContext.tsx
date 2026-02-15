import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole, AttendanceRecord } from '@/lib/types';
import { todayStr } from '@/lib/constants';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  users: User[];
  records: AttendanceRecord[];
  login: (email: string, password: string) => Promise<User>;
  signup: (data: Omit<User, 'id' | 'role'>) => Promise<User>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  upsertRecord: (record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  getRecordsForUser: (userId: string) => AttendanceRecord[];
  getTodayRecord: () => AttendanceRecord | undefined;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecords = useCallback(async () => {
    if (!user) return;
    try {
      // If admin, fetch all records? Or just user records?
      // The original context logic implied having access to all records for filtering
      // But fetching ALL records might be heavy. 
      // Admin dashboard needs all records.
      // Let's implement logic: if admin -> fetch all (or by filtered endpoint).
      // For now, let's just fetch all records if admin, and my records if user.

      if (user.role === 'admin') {
        // We don't have a specific endpoint to get ALL records for ALL users efficiently in the context state without checks
        // But let's assume /attendance/all returns everything
        const { data } = await api.get('/attendance/all');
        setRecords(data);
      } else {
        const { data } = await api.get('/attendance/my');
        setRecords(data);
      }

    } catch (error) {
      console.error('Failed to fetch records', error);
    }
  }, [user]);

  const fetchAllUsers = useCallback(async () => {
    if (user?.role === 'admin') {
      try {
        const { data } = await api.get('/users');
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    } else if (user) {
      setUsers([user]);
    }
  }, [user]);

  // Initial check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [fetchUserData]);

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchRecords();
      fetchAllUsers();
    } else {
      setRecords([]);
      setUsers([]);
    }
  }, [user, fetchRecords, fetchAllUsers]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }, []);

  const signup = useCallback(async (data: Omit<User, 'id' | 'role'>): Promise<User> => {
    try {
      const { data: responseData } = await api.post('/auth/register', data);
      localStorage.setItem('token', responseData.token);
      setUser(responseData);
      return responseData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const { data } = await api.put(`/users/${user.id}`, updates);
      setUser(data);
      // If admin updating self, refresh users list
      if (user.role === 'admin') fetchAllUsers();
    } catch (error) {
      console.error('Failed to update profile', error);
      throw error;
    }
  }, [user, fetchAllUsers]);

  const upsertRecord = useCallback(async (record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await api.post('/attendance', record);
      await fetchRecords(); // Refresh records
    } catch (error) {
      console.error('Failed to upsert record', error);
      throw error;
    }
  }, [fetchRecords]);

  const getRecordsForUser = useCallback((userId: string) => {
    // Since API returns number IDs but frontend uses string/number loose, we cast
    return records.filter(r => String(r.userId) === String(userId));
  }, [records]);

  const getTodayRecord = useCallback(() => {
    if (!user) return undefined;
    const today = todayStr();
    return records.find(r => {
      // Handle normalized date comparison (ignore time part if present)
      const recordDate = typeof r.date === 'string' ? r.date.split('T')[0] : r.date;
      return String(r.userId) === String(user.id) && recordDate === today;
    });
  }, [user, records]);

  return (
    <AuthContext.Provider value={{ user, users, records, login, signup, logout, updateProfile, upsertRecord, getRecordsForUser, getTodayRecord }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
