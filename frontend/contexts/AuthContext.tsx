'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api/realApi';
import { setAuthToken, removeAuthToken, getErrorMessage } from '@/lib/api/apiClient';
import type { UserResponse } from '@/lib/types/api';

// Map UserResponse to frontend User type
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
        }
      } catch (error) {
        console.error('Error verifying token:', error);
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
      const result = await authApi.register(data);
      if (result) {
        setUser(result.user);
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));

        // Stocker aussi dans un cookie pour le middleware
        document.cookie = `auth_token=${result.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 jours
      } else {
        throw new Error('Un compte avec cet email ou nom d\'utilisateur existe déjà');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');

    // Supprimer aussi le cookie
    document.cookie = 'auth_token=; path=/; max-age=0';

    // Rediriger vers la page d'accueil
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      // En production, ce serait un appel API réel
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du profil');
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
