import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, PatientProfile, DoctorProfile } from '../types';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  patientProfile: PatientProfile | null;
  doctorProfile: DoctorProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: Role) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setPatientProfile(null);
      setDoctorProfile(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.get<{
        user: User;
        patientProfile?: PatientProfile;
        doctorProfile?: DoctorProfile;
      }>('/auth/me');

      setUser(data.user);
      if (data.patientProfile) setPatientProfile(data.patientProfile);
      if (data.doctorProfile) setDoctorProfile(data.doctorProfile);
    } catch (err) {
      console.error('Failed to load current user profile:', err);
      removeAuthToken();
      setUser(null);
      setPatientProfile(null);
      setDoctorProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      setAuthToken(res.token);
      await fetchCurrentUser();
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: any) => {
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: User }>('/auth/register', formData);
      setAuthToken(res.token);
      await fetchCurrentUser();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setPatientProfile(null);
    setDoctorProfile(null);
  };

  // Switch demo account instantly for reviewer convenience
  const switchDemoRole = async (role: Role) => {
    setLoading(true);
    try {
      const demoUsers = await api.get<{ id: string; name: string; email: string; role: Role }[]>('/auth/demo-users');
      const targetUser = demoUsers.find((u) => u.role === role);
      if (targetUser) {
        await login(targetUser.email, 'password123');
      }
    } catch (err) {
      console.error('Demo role switch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patientProfile,
        doctorProfile,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        refreshUserData: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
