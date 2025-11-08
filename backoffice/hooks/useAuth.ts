import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Hook personnalisé pour accéder au contexte d'authentification
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
 *
 * if (isAuthenticated && isAdmin) {
 *   return <div>Bonjour Admin {user?.username}</div>
 * }
 * ```
 */
export function useAuth() {
  return useAuthContext();
}
