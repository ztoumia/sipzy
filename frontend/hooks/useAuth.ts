import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Hook personnalisé pour accéder au contexte d'authentification
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * if (isAuthenticated) {
 *   return <div>Bonjour {user?.username}</div>
 * }
 * ```
 */
export function useAuth() {
  return useAuthContext();
}
