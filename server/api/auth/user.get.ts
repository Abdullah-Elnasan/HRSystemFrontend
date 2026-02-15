import { apiFetch } from '../../utils/apiFetch'

export default defineEventHandler(async (event) => {
  try {
    console.log('user.get.ts')

    // Call Laravel authenticated user endpoint
    const response = await apiFetch('/auth/me', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    return {
      data: response,
    }
  } catch (error: any) {
    // Handle 401 (unauthenticated)
    if (error?.statusCode === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthenticated',
        data: error?.data,
      })
    }

    throw createError({
      statusCode: error?.statusCode ?? 500,
      statusMessage: error?.statusMessage ?? 'Failed to fetch user',
      data: error?.data,
    })
  }
})

