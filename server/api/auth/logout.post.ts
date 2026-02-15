import { apiFetch } from '../../utils/apiFetch'

export default defineEventHandler(async (event) => {
  try {
    console.log('logout.post.ts')

    // Call Laravel logout endpoint
    const response = await apiFetch('/logout', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })

    return {
      success: true,
      message: 'Logged out successfully',
      messageAr: 'تم تسجيل الخروج بنجاح',
      data: response,
    }
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode ?? 500,
      statusMessage: error?.statusMessage ?? 'Logout failed',
      data: error?.data,
    })
  }
})

