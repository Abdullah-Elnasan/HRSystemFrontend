// ~/server/utils/createPostFormHandler.ts
import { readFormData } from 'h3'
import { apiFetch } from './apiFetch'

export function createPostFormHandler(endpoint: string) {
  return defineEventHandler(async (event) => {
    const formData = await readFormData(event)
    console.log(formData)

    try {
      return await apiFetch(endpoint, {
        method: 'POST',
        body: formData,
      })
    } catch (error: any) {
      /**
       * Laravel validation error (422)
       */
      if (error?.data?.errors) {
        throw createError({
          statusCode: 422,
          statusMessage:
            error.data.messageAr ??
            error.data.messageEn ??
            'Validation error',
          data: {
            errors: error.data.errors,
          },
        })
      }

      /**
       * Fallback
       */
      throw createError({
        statusCode: 500,
        statusMessage: 'Unexpected server error',
      })
    }
  })
}
