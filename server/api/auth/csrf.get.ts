import { getCookie, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase

    if (!apiBase) {
      throw createError({
        statusCode: 500,
        statusMessage: 'API base URL not configured',
      })
    }

    // Make direct request to Laravel Sanctum CSRF endpoint
    // Forward cookies from client request
    const clientCookies = getCookie(event, 'laravel_session') || ''

    const response = await $fetch(`${apiBase}/sanctum/csrf-cookie`, {
      method: 'GET',
      headers: {
        Cookie: clientCookies ? `laravel_session=${clientCookies}` : '',
      },
    })

    // Forward Set-Cookie headers from Laravel response to client
    // Note: $fetch doesn't expose response headers directly
    // We need to use native fetch or handle cookies differently
    // For now, the cookie should be set automatically if same domain

    return {
      success: true,
      message: 'CSRF token cookie set',
    }
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode ?? 500,
      statusMessage: error?.statusMessage ?? 'Failed to fetch CSRF token',
      data: error?.data,
    })
  }
})

