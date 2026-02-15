/**
 * Client-side API client for authenticated requests
 * Handles credentials and CSRF tokens for Laravel Sanctum SPA
 */

/**
 * Get CSRF token from cookie
 * Laravel Sanctum stores CSRF token in XSRF-TOKEN cookie
 */
function getCsrfToken(): string | null {
  console.log('apiClient getCsrfToken')
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
}

/**
 * Client-side fetch wrapper with Sanctum SPA support
 * Includes credentials and CSRF token automatically
 */
export async function apiClient<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    query?: Record<string, any>
    body?: any
    headers?: Record<string, string>
    skipAuth?: boolean // Skip auth headers for public endpoints
  } = {}
): Promise<T> {
  const config = useRuntimeConfig()

  console.log('apiClient apiClient')

  // Build URL
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${config.public.apiBase || ''}${endpoint}`

  // Build query string
  let queryString = ''
  if (options.query) {
    const params = new URLSearchParams()
    for (const key in options.query) {
      const value = options.query[key]
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          for (const subKey in value) {
            params.append(`${key}[${subKey}]`, String(value[subKey]))
          }
        } else {
          params.append(key, String(value))
        }
      }
    }
    queryString = params.toString()
  }

  const fullUrl = queryString ? `${url}?${queryString}` : url

  // Prepare headers
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  }

  // Add CSRF token for state-changing requests
  if (!options.skipAuth && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')) {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = csrfToken
    }
  }

  // Determine content type
  const isFormData = options.body instanceof FormData
  if (!isFormData && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const response = await $fetch<T>(fullUrl, {
      method: options.method || 'GET',
      body: options.body,
      headers,
      credentials: 'include', // Required for Sanctum SPA cookies
    })

    return response
  } catch (error: any) {
    // Handle 401 (Unauthenticated) - redirect to login
    if (error?.statusCode === 401 && !options.skipAuth) {
      const router = useRouter()
      const route = useRoute()
      await router.push({
        path: '/login',
        query: {
          returnUrl: route.fullPath,
        },
      })
    }

    // Handle 419 (CSRF token mismatch) - refresh token and retry once
    if (error?.statusCode === 419 && !options.skipAuth) {
      const { useAuthStore } = await import('~/stores/auth/auth')
      const authStore = useAuthStore()
      await authStore.fetchCsrfToken()

      // Retry once with new CSRF token
      const csrfToken = getCsrfToken()
      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken
      }

      return $fetch<T>(fullUrl, {
        method: options.method || 'GET',
        body: options.body,
        headers,
        credentials: 'include',
      })
    }

    throw error
  }
}

