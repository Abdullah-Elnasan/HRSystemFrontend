import { useAuthStore } from '~/stores/auth/auth'
import type { LoginForm, User } from '~/types/auth'

/**
 * Composable for authentication
 * Provides convenient access to auth store
 */
export function useAuth() {
  const authStore = useAuthStore()
  const toast = useToast()
  return {
    // State
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    loading: computed(() => authStore.loading),
    error: computed(() => authStore.error),

    // Actions
    login: (credentials: LoginForm) => authStore.login(credentials, toast),
    logout: () => authStore.logout(),
    fetchUser: () => authStore.fetchUser(),
    checkAuth: () => authStore.checkAuth(),
    fetchCsrfToken: () => authStore.fetchCsrfToken(),
    clearAuth: () => authStore.clearAuth(),
  }
}

