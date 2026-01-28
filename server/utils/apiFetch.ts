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
    ? `${config.public.apiBase}${endpoint}?${params}`
    : `${config.public.apiBase}${endpoint}`

    console.log("API Fetch URL:", url);
  // ---------- FormData handling ----------
  const isFormData = options.body instanceof FormData
  let method = options.method ?? 'GET'

  console.log(options.body);

  // ⭐ الحل الأساسي لمشكلة Laravel
  if (isFormData && (method === 'PUT' || method === 'PATCH')) {
    options.body.append('_method', method)
    method = 'POST'
  }



  try {
    const res = await $fetch<T>(url, {
      method,
      body: options.body,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${config.apiToken}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      timeout: 10_000,
    });
    return  res;
  } catch (error: any) {
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
