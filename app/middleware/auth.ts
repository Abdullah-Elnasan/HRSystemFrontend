import { useAuthStore } from '~/stores/auth/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Check if route requires authentication (opt-in: only protect routes with auth: true)
  const requiresAuth = to.meta.auth === true

  // If route requires auth and user is not authenticated
  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login with return URL
    return navigateTo({
      path: '/login',
      query: {
        returnUrl: to.fullPath,
      },
    })
  }
})

