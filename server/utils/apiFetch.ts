// // export async function apiFetch<T>(
// //   endpoint: string,
// //   options: {
// //     method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
// //     query?: Record<string, any>
// //     body?: any
// //     headers?: Record<string, string>
// //   } = {}
// // ): Promise<T> {
// //   const config = useRuntimeConfig()

// //   const params = new URLSearchParams()

// //   if (options.query) {
// //     for (const key in options.query) {
// //       const value = options.query[key]

// //       if (typeof value === 'object' && value !== null) {
// //         for (const subKey in value) {
// //           params.append(`${key}[${subKey}]`, value[subKey])
// //         }
// //       } else if (value !== undefined && value !== null) {
// //         params.append(key, String(value))
// //       }
// //     }
// //   }

// //   const url =
// //     params.toString().length > 0
// //       ? `${config.public.apiBase}${endpoint}?${params}`
// //       : `${config.public.apiBase}${endpoint}`

// //   try {
// //     return await $fetch<T>(url, {
// //       method: options.method ?? 'GET',
// //       body: options.body,
// //       headers: {
// //         Accept: 'application/json',
// //         Authorization: `Bearer ${config.apiToken}`,
// //         ...options.headers,
// //       },
// //       timeout: 10_000,
// //     })
// //   } catch (error: any) {
// //     throw createError({
// //       statusCode: error?.response?.status ?? 500,
// //       statusMessage:
// //         error?.response?._data?.message ??
// //         error?.message ??
// //         'Server error',
// //       data: error?.response?._data,
// //     })
// //   }
// // }

// // utils/apiFetch.ts
// export async function apiFetch<T>(
//   endpoint: string,
//   options: {
//     method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
//     query?: Record<string, any>
//     body?: any
//     headers?: Record<string, string>
//   } = {}
// ): Promise<T> {
//   const config = useRuntimeConfig()

//   const params = new URLSearchParams()

//   if (options.query) {
//     for (const key in options.query) {
//       const value = options.query[key]

//       if (typeof value === 'object' && value !== null) {
//         for (const subKey in value) {
//           params.append(`${key}[${subKey}]`, String(value[subKey]))
//         }
//       } else if (value !== undefined && value !== null) {
//         params.append(key, String(value))
//       }
//     }
//   }

//   const url =
//     params.toString()
//       ? `${config.public.apiBase}${endpoint}?${params}`
//       : `${config.public.apiBase}${endpoint}`

//   const isFormData = options.body instanceof FormData

//   try {
//     return await $fetch<T>(url, {
//       method: options.method ?? 'GET',
//       body: options.body,
//       headers: {
//         Accept: 'application/json',
//         Authorization: `Bearer ${config.apiToken}`,
//         ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
//         ...options.headers,
//       },
//       timeout: 10_000,
//     })
//   } catch (error: any) {
//     const data = error?.response?._data
//     console.log(data)
//     throw createError({
//       statusCode: error?.response?.status ?? 500,
//       statusMessage:
//         error?.response?._data?.message ??
//         error?.message ??
//         'Server error',
//       data: error?.response?._data,
//     })
//   }
// }


export async function apiFetch<T>(
  endpoint: string,

  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    query?: Record<string, any>
    body?: any
    headers?: Record<string, string>
  } = {}
): Promise<T> {
  const config = useRuntimeConfig()

  // ---------- Query params ----------
  const params = new URLSearchParams()

  console.log('dsffffffffffffffff')
  if (options.query) {
    for (const key in options.query) {
      const value = options.query[key]

      if (typeof value === 'object' && value !== null) {
        for (const subKey in value) {
          params.append(`${key}[${subKey}]`, String(value[subKey]))

        }
      } else if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    }
  }

  const url = params.toString()
    ? `${config.public.apiBase}/api${endpoint}?${params}`
    : `${config.public.apiBase}/api${endpoint}`

  console.log("API Fetch URL:", url);
  // ---------- FormData handling ----------
  const isFormData = options.body instanceof FormData
  let method = options.method ?? 'GET'


  if (isFormData && (method === 'PUT' || method === 'PATCH')) {
    options.body.append('_method', method)
    method = 'POST'
  }



  try {
    // Determine if this is an auth endpoint (should use credentials instead of Bearer token)
    const isAuthEndpoint = endpoint.includes('/login') ||
      endpoint.includes('/logout') ||
      endpoint.includes('/api/user') ||
      endpoint.includes('/sanctum/csrf-cookie')

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    }

    // Use Bearer token for non-auth endpoints, credentials for auth endpoints
    if (!isAuthEndpoint && config.public.apiToken) {
      headers.Authorization = `Bearer ${config.public.apiToken}`
    }

    const res = await $fetch<T>(url, {
      method,
      body: options.body,
      headers,
      // Include credentials for Sanctum SPA authentication
      credentials: isAuthEndpoint ? 'include' : undefined,
      timeout: 10_000,
    })
    // console.log('res')
    // console.log(res)
    return res
  } catch (error: any) {

    // console.log('error')
    // console.log(error?.response?._data)
    throw createError({
      statusCode: error?.response?.status ?? 500,
      statusMessage:
        error?.response?._data?.message ??
        error?.message ??
        'Server error',
      data: error?.response?._data,
    })
  }
}
