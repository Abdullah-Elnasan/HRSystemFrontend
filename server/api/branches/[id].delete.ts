// server\api\branches\[id].delete.ts
import { apiFetch } from '../../utils/apiFetch'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Branch id is required',
    })
  }

  return await apiFetch(`/branches/${id}`, {
    method: 'DELETE',
  })
})
