import { apiFetch } from './apiFetch'
import { H3Event, getQuery, createError, getHeaders } from 'h3'

export async function proxyFetch(
  event: H3Event,
  endpoint: string,
) {
  if (!endpoint) {
    throw createError({
      statusCode: 400,
      statusMessage: 'endpoint is required'
    })
  }

  const query = getQuery(event)
  const headers = getHeaders(event)

  // Logging للتحقق
  console.log(`[proxyFetch] Endpoint: ${endpoint}, Query:`, query);
  console.log(`[proxyFetch] Request URL:`, event.node.req.url);

  // إضافة timestamp أو unique identifier لمنع الكاش
  const uniqueHeaders = {
    ...headers,
    'X-Request-ID': `${endpoint}-${Date.now()}-${Math.random()}`,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  }

  const result = await apiFetch(endpoint, {
    query,
    headers: uniqueHeaders
  })

  // Logging للتحقق من البيانات
  if (typeof result === 'object' && result !== null && 'data' in result) {
    const data = (result as any).data;
    const dataLength = Array.isArray(data) ? data.length : 'N/A';
    const firstItem = Array.isArray(data) && data.length > 0
      ? { id: data[0].id, name_ar: data[0].name_ar, name_en: data[0].name_en }
      : 'N/A';
    console.log(`[proxyFetch] Response for ${endpoint}:`, {
      dataLength,
      firstItem,
      endpoint
    });
  } else {
    console.log(`[proxyFetch] Response for ${endpoint}:`, JSON.stringify(result).substring(0, 100));
  }

  return result;
}
