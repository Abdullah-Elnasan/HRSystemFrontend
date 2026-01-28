import { apiFetch } from '../../utils/apiFetch'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Department id is required',
    })
  }

  return await apiFetch(`/departments/${id}`, {
    method: 'DELETE',
  })
})
