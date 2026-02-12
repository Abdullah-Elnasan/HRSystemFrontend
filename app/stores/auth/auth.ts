import { defineStore } from 'pinia'
import type { User,UserMe, LoginForm, AuthResponse } from '~/types/auth'

/**
 * Get Laravel API base URL
 * For Sanctum SPA, we need to make direct requests to Laravel for cookies to work
 */
function getLaravelApiBase(): string {
  const config = useRuntimeConfig()
  return config.public.apiBase || ''
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserMe | null,
    loading: false,
    error: null as string | null,
    csrfToken: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    getUser: (state) => state.user,
    isLoading: (state) => state.loading,
  },

  actions: {
    /**
     * Get CSRF token from cookie
     */
    getCsrfTokenFromCookie(): string | null {
      if (import.meta.server) return null

      if (typeof document === 'undefined') return null

      const name = 'XSRF-TOKEN='
      const cookies = document.cookie.split(';')

      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]?.trim()
        if (cookie && cookie.indexOf(name) === 0) {
          return decodeURIComponent(cookie.substring(name.length))
        }
      }

      return null
    },

    /**
     * Fetch CSRF token from Laravel Sanctum
     * This must be called before login
     * Makes direct request to Laravel for proper cookie handling
     */
    async fetchCsrfToken() {
      try {
        const apiBase = getLaravelApiBase()
        if (!apiBase) {
          throw new Error('API base URL not configured')
        }

        await $fetch(`${apiBase}/sanctum/csrf-cookie`, {
          method: 'GET',
          credentials: 'include', // Required for cookies
        })
        // CSRF token is set as httpOnly cookie, we don't need to store it
        this.csrfToken = 'set' // Mark as fetched
        return true
      } catch (error: any) {
        console.error('Failed to fetch CSRF token:', error)
        this.error = error?.message ?? 'Failed to fetch CSRF token'
        return false
      }
    },

    /**
     * Login with email and password
     * Makes direct request to Laravel for proper cookie handling
     */
    async login(credentials: LoginForm, toast: any) {
      this.loading = true
      this.error = null


      try {
        // Ensure CSRF token is fetched first
        if (!this.csrfToken) {
          await this.fetchCsrfToken()
        }

        const apiBase = getLaravelApiBase()
        if (!apiBase) {
          throw new Error('API base URL not configured')
        }

        // Get CSRF token from cookie for the request
        const csrfToken = this.getCsrfTokenFromCookie()

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }

        // Include CSRF token in header
        if (csrfToken) {
          headers['X-XSRF-TOKEN'] = csrfToken
        }

        // Laravel login endpoint returns user directly or wrapped in data
        const response = await $fetch<AuthResponse>(`${apiBase}/auth/login`, {
          method: 'POST',
          credentials: 'include',
          body: credentials,
          headers,
        })

        // Handle both response formats: direct user object or wrapped in data
        const user = response.data?.user

        if (user && user.id) {
          this.user = user as UserMe
          this.csrfToken = 'set'

          const message = (response as AuthResponse).messageAr ??
            (response as AuthResponse).message ??
            'تم تسجيل الدخول بنجاح'

          toast.add({
            title: message,
            color: 'success',
          })

          return user
        }

        throw new Error('Invalid response from server')
      } catch (error: any) {
        handleApiError(error, toast)
        this.error = error?.data?.message ?? error?.message ?? 'فشل تسجيل الدخول'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Logout current user
     * Makes direct request to Laravel for proper cookie handling
     */
    async logout() {
      this.loading = true
      this.error = null
      const toast = useToast()

      try {
        const apiBase = getLaravelApiBase()
        if (!apiBase) {
          throw new Error('API base URL not configured')
        }

        const csrfToken = this.getCsrfTokenFromCookie()
        const headers: Record<string, string> = {
          Accept: 'application/json',
        }

        if (csrfToken) {
          headers['X-XSRF-TOKEN'] = csrfToken
        }

        await $fetch(`${apiBase}/auth/logout`, {
          method: 'POST',
          credentials: 'include', // Required for cookies
          headers,
        })

        this.user = null
        this.csrfToken = null

        toast.add({
          title: 'تم تسجيل الخروج بنجاح',
          color: 'success',
        })
      } catch (error: any) {
        handleApiError(error, toast)
        // Clear user even if logout fails
        this.user = null
        this.csrfToken = null
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch current authenticated user
     * Makes direct request to Laravel for proper cookie handling
     */
    async fetchUser() {
      this.loading = true
      this.error = null

      try {
        const apiBase = getLaravelApiBase()
        if (!apiBase) {
          throw new Error('API base URL not configured')
        }

        const response = await $fetch<User>(`${apiBase}/auth/me`, {
          method: 'GET',
          credentials: 'include', // Required for cookies
          headers: {
            Accept: 'application/json',
          },
        })

        // Response is the user object directly from Laravel
        if (response) {
          this.user = response.data
          return response.data
        }

        throw new Error('Invalid response from server')
      } catch (error: any) {
        // If 401, user is not authenticated
        if (error?.statusCode === 401) {
          this.user = null
          this.csrfToken = null
          return null
        }

        this.error = error?.data?.message ?? error?.message ?? 'Failed to fetch user'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Check if user is authenticated
     * Fetches user data if not already loaded
     */
    async checkAuth() {
      if (this.user) {
        return true
      }

      try {
        const user = await this.fetchUser()
        return !!user
      } catch {
        return false
      }
    },

    /**
     * Clear auth state (for testing or manual logout)
     */
    clearAuth() {
      this.user = null
      this.csrfToken = null
      this.error = null
    },
  },
})

