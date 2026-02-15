// // ~/server/utils/createJsonPostHandler.ts
// import { readBody } from 'h3'
// import { apiFetch } from './apiFetch'

// export function createJsonPostHandler(endpoint: string) {
//   return defineEventHandler(async (event) => {
//     try {
//       const body = await readBody(event)
//       console.log('Request body:', body)

//       return await apiFetch(endpoint, {
//         method: 'POST',
//         body: body,
//       })
//     } catch (error: any) {
//       console.error('Error in createJsonPostHandler:', error)

//       // استخراج البيانات من الخطأ
//       const errorData = error?.data || {}
//       const statusCode = error?.statusCode || error?.status || 500

//       /**
//        * Laravel validation error (422)
//        */
//       if (statusCode === 422 && errorData?.errors) {
//         throw createError({
//           statusCode: 422,
//           statusMessage: errorData.messageAr ?? errorData.messageEn ?? 'Validation error',
//           data: errorData,
//         })
//       }

//       /**
//        * أي خطأ آخر - مرر البيانات كاملة
//        */
//       throw createError({
//         statusCode,
//         statusMessage: errorData.messageAr ?? errorData.messageEn ?? error?.message ?? 'Unexpected server error',
//         data: errorData,
//       })
//     }
//   })
// }


// ~/server/utils/createJsonHandler.ts
import { readBody } from 'h3'
import { apiFetch } from './apiFetch'

export function createJsonHandler(endpoint: string, method: 'POST' | 'DELETE' | 'PUT' | 'PATCH' = 'POST') {
  return defineEventHandler(async (event) => {
    try {
      const body = await readBody(event)
      console.log(`${method} Request body:`, body)

      return await apiFetch(endpoint, {
        method,
        body: body,
      })
    } catch (error: any) {
      console.error(`Error in ${method} handler:`, error)

      const errorData = error?.data || {}
      const statusCode = error?.statusCode || error?.status || 500

      if (statusCode === 422 && errorData?.errors) {
        throw createError({
          statusCode: 422,
          statusMessage: errorData.messageAr ?? errorData.messageEn ?? 'Validation error',
          data: errorData,
        })
      }

      throw createError({
        statusCode,
        statusMessage: errorData.messageAr ?? errorData.messageEn ?? error?.message ?? 'Unexpected server error',
        data: errorData,
      })
    }
  })
}

