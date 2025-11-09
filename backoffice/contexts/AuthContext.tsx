'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api/realApi';
import { setAuthToken, removeAuthToken, logout as apiLogout, getErrorMessage } from '@sipzy/shared/lib/api/apiClient';

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

interface LoginData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
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

          // Vérifier que l'utilisateur a le rôle ADMIN
          if (verifiedUser.role !== 'ADMIN') {
            throw new Error('Accès refusé: Vous devez être administrateur');
          }

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

  const login = async ({ email, password }: LoginData) => {
    try {
      const result = await api.auth.login({ email, password });

      // Vérifier que l'utilisateur a le rôle ADMIN
      if (result.user.role !== 'ADMIN') {
        throw new Error('Accès refusé: Vous devez être administrateur pour accéder au backoffice');
      }

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

    // Rediriger vers la page de login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (user && data.username) {
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
    isAdmin: user?.role === 'ADMIN',
    isLoading,
    login,
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
