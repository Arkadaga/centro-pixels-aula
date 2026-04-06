'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
  isMedical: boolean;
}

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    email: 'ane@basqueteam.eus',
    name: 'Ane Etxeberria',
    role: 'kirolaria',
    sport: 'Atletismoa',
    athleteType: 'olimpiar',
  },
  {
    id: 'u2',
    email: 'admin@basqueteam.eus',
    name: 'Miren Arrieta',
    role: 'zuzendaritza',
  },
  {
    id: 'u3',
    email: 'mediku@basqueteam.eus',
    name: 'Dr. Koldo Ibarra',
    role: 'medikua',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading] = useState(false);

  const login = (email: string, _password: string): boolean => {
    const found = MOCK_USERS.find((u) => u.email === email);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAdmin: user?.role === 'zuzendaritza',
        isMedical: user?.role === 'medikua',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
