'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api/realApi';
import { setAuthToken, removeAuthToken, logout as apiLogout, getErrorMessage } from '@sipzy/shared/lib/api/apiClient';

// User type for frontend
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatarUrl?: string;
  bio?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier le token au chargement de l'application
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const verifiedUser = await api.auth.verifyToken();
          setUser(verifiedUser);
          // S'assurer que le cookie est aussi défini
          document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 jours
        } else {
          // Si pas de token en localStorage, nettoyer le cookie aussi
          document.cookie = 'authToken=; path=/; max-age=0';
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        // Nettoyer TOUS les tokens (localStorage + cookie)
        removeAuthToken();
        document.cookie = 'authToken=; path=/; max-age=0';
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await api.auth.login({ email, password });
      setUser(result.user);
      setAuthToken(result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Stocker aussi dans un cookie pour le middleware
      document.cookie = `authToken=${result.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 jours
    } catch (error) {
      const message = getErrorMessage(error);
      throw new Error(message);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const result = await api.auth.register(data);
      setUser(result.user);
      setAuthToken(result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Stocker aussi dans un cookie pour le middleware
      document.cookie = `authToken=${result.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 jours
    } catch (error) {
      const message = getErrorMessage(error);
      throw new Error(message);
    }
  };

  const logout = async () => {
    setUser(null);

    // Call API logout (includes removeAuthToken)
    await apiLogout();

    // Supprimer aussi le cookie
    document.cookie = 'authToken=; path=/; max-age=0';

    // Rediriger vers la page d'accueil
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (user) {
        const result = await api.users.updateProfile({
          username: data.username,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
        });
        setUser(result);
        localStorage.setItem('user', JSON.stringify(result));
      }
    } catch (error) {
      const message = getErrorMessage(error);
      throw new Error(message);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
