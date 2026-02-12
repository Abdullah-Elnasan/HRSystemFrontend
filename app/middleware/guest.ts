import { useAuthStore } from '~/stores/auth/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Check if user is authenticated (async check to ensure state is loaded)
  // First check if user is already in store
  if (authStore.isAuthenticated) {
    // Redirect to dashboard
    return navigateTo('/')
  }

  // If user is not in store, check authentication status
  // This handles the case when page is refreshed and store is empty
  try {
    const isAuth = await authStore.checkAuth()
    if (isAuth) {
      // User is authenticated, redirect to dashboard
      return navigateTo('/')
    }
  } catch (error) {
    // If check fails, allow access (user is not authenticated)
    // This prevents blocking legitimate guest access
  }
})

