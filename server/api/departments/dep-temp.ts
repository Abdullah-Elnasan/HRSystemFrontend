// server/api/departments/departments.get.ts
import { getQuery, setHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  // تعطيل الكاش لهذا الـ handler
  setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')

  const config = useRuntimeConfig()
  const query = getQuery(event)

  // بناء query parameters
  const params = new URLSearchParams()

  // إضافة query parameters من الطلب
  if (query && typeof query === 'object') {
    for (const key in query) {
      const value = (query as any)[key]
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        for (const subKey in value) {
          params.append(`${key}[${subKey}]`, String(value[subKey]))
        }
      } else if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    }
  }

  // إضافة unique parameters لمنع الكاش
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  params.append('_t', timestamp.toString())
  params.append('_r', random)
  params.append('_endpoint', 'departments')

  const url = `${config.public.apiBase}/departments?${params.toString()}`

  console.log(`[departments.get] ========== DEPARTMENTS REQUEST ==========`)
  console.log(`[departments.get] Full URL: ${url}`)
  console.log(`[departments.get] Endpoint: /departments`)
  console.log(`[departments.get] Timestamp: ${timestamp}`)

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'X-Request-ID': `departments-${timestamp}-${random}`,
      'X-Endpoint': 'departments',
    }

    // إضافة Authorization إذا كان موجوداً
    if (config.apiToken) {
      headers['Authorization'] = `Bearer ${config.apiToken}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw createError({
        statusCode: response.status,
        statusMessage: errorData?.message ?? 'Failed to fetch departments',
        data: errorData,
      })
    }

    const result = await response.json()

    console.log(`[departments.get] ========== DEPARTMENTS RESPONSE ==========`)
    console.log(`[departments.get] Data length: ${result?.data?.length ?? 0}`)
    if (result?.data?.[0]) {
      console.log(`[departments.get] First item:`, {
        id: result.data[0].id,
        name_ar: result.data[0].name_ar,
        name_en: result.data[0].name_en,
      })
    }
    console.log(`[departments.get] Full URL was: ${url}`)
    console.log(`[departments.get] ==========================================`)

    return result
  } catch (error: any) {
    console.error(`[departments.get] Error:`, error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error?.message ?? 'Failed to fetch departments',
      data: error,
    })
  }
})
