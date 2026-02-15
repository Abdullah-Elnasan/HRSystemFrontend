import { readBody } from 'h3'
import { apiFetch } from '../../utils/apiFetch'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('login.post.ts')

    // Validate required fields
    if (!body.email || !body.password) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Email and password are required',
        data: {
          errors: {
            email: body.email ? [] : ['البريد الإلكتروني مطلوب'],
            password: body.password ? [] : ['كلمة المرور مطلوبة'],
          },
        },
      })
    }

    // Call Laravel login endpoint
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: {
        email: body.email,
        password: body.password,
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return response
  } catch (error: any) {
    // Handle Laravel validation errors (422)
    if (error?.statusCode === 422) {
      throw createError({
        statusCode: 422,
        statusMessage: error?.statusMessage ?? 'Validation error',
        data: error?.data,
      })
    }

    // Handle authentication errors (401)
    if (error?.statusCode === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: error?.statusMessage ?? 'Invalid credentials',
        data: error?.data,
      })
    }

    // Handle other errors
    throw createError({
      statusCode: error?.statusCode ?? 500,
      statusMessage: error?.statusMessage ?? 'Login failed',
      data: error?.data,
    })
  }
})

