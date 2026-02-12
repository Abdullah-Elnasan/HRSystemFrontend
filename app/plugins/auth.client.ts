import { useAuthStore } from '~/stores/auth/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()

  // Fetch CSRF token on app initialization
  // This is required for Laravel Sanctum SPA authentication
  try {
    await authStore.fetchCsrfToken()
  } catch (error) {
    console.warn('Failed to fetch CSRF token on app init:', error)
  }

  // Check if user is already authenticated (e.g., on page refresh)
  // Check on all pages including login (middleware will handle redirect)
  nuxtApp.hook('app:mounted', async () => {
    if (process.client) {
      try {
        await authStore.checkAuth()
      } catch (error) {
        // Silently fail - user will be redirected by middleware if needed
        console.warn('Auth check failed:', error)
      }
    }
  })
})

