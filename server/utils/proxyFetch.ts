// server/utils/proxyFetch.ts
import { apiFetch } from './apiFetch'
import { H3Event, getQuery, createError } from 'h3'

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

  return await apiFetch(endpoint, { query })
}
