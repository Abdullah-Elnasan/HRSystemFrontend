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

//   // ---------- Query params ----------
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

//   const url = params.toString()
//     ? `${config.public.apiBase}${endpoint}?${params}`
//     : `${config.public.apiBase}${endpoint}`

//     console.log("API Fetch URL:", url);
//   // ---------- FormData handling ----------
//   const isFormData = options.body instanceof FormData
//   let method = options.method ?? 'GET'

//   console.log(options.body);

//   // ⭐ الحل الأساسي لمشكلة Laravel
//   if (isFormData && (method === 'PUT' || method === 'PATCH')) {
//     options.body.append('_method', method)
//     method = 'POST'
//   }



//   try {
//     return await $fetch<T>(url, {
//       method,
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

// ... existing code ...

export async function apiFetch2<T>(
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

  // إضافة timestamp فريد ومنع الكاش (فقط للـ GET requests)
  if (!options.method || options.method === 'GET') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const uniqueId = `${timestamp}_${random}_${endpoint.replace(/\//g, '_')}`;
    params.append('_t', timestamp.toString());
    params.append('_r', random);
    params.append('_u', uniqueId); // unique identifier يحتوي على endpoint
  }

  const url = params.toString()
    ? `${config.public.apiBase}${endpoint}?${params}`
    : `${config.public.apiBase}${endpoint}?${params}` // إضافة params دائماً حتى لو كان فارغاً

  console.log(`[apiFetch] Endpoint: ${endpoint}, Full URL: ${url.substring(0, 150)}...`);

  // ---------- FormData handling ----------
  const isFormData = options.body instanceof FormData
  let method = options.method ?? 'GET'

  // ⭐ الحل الأساسي لمشكلة Laravel
  if (isFormData && (method === 'PUT' || method === 'PATCH')) {
    options.body.append('_method', method)
    method = 'POST'
  }

  try {
    // استخدام fetch الأصلي بدلاً من $fetch لتجنب كاش Nuxt
    // إضافة unique headers لمنع أي كاش
    const uniqueHeaders = {
      Accept: 'application/json',
      Authorization: `Bearer ${config.apiToken}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'X-Request-ID': `${endpoint}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      'X-Endpoint': endpoint, // إضافة endpoint في header للتحقق
      ...options.headers,
    };

    const response = await fetch(url, {
      method,
      body: isFormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
      headers: uniqueHeaders,
      cache: 'no-store', // تعطيل الكاش تمامًا
      // إضافة signal جديد لكل request
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw createError({
        statusCode: response.status,
        statusMessage: errorData?.message ?? 'Server error',
        data: errorData,
      })
    }

    return await response.json() as T
  } catch (error: any) {
    // إذا كان الخطأ من createError، أعد إرساله
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error?.message ?? 'Server error',
      data: error,
    })
  }
}
