"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '../lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  tenantId: string;
  tenantName?: string;
  availableTenants?: {
    tenantId: string;
    tenantName: string;
    roleId: string;
    roleName: string;
  }[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (pathname !== '/login' && pathname !== '/' && !pathname.startsWith('/pwa') && !pathname.startsWith('/portal')) {
      router.push('/login');
    }
    setLoading(false);
  }, [pathname, router]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.email === 'admin@nebulapayrolls.com') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (user) {
          logout();
          alert('Tu sesión ha expirado por inactividad (10 minutos).');
        }
      }, 10 * 60 * 1000); // 10 minutes
    };

    if (user && process.env.NODE_ENV === 'production') {
      resetTimer();
      const events = ['mousemove', 'keydown', 'scroll', 'click'];
      events.forEach(event => window.addEventListener(event, resetTimer));
      
      return () => {
        clearTimeout(timeoutId);
        events.forEach(event => window.removeEventListener(event, resetTimer));
      };
    }
  }, [user]); // Re-attach when user state changes



  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
