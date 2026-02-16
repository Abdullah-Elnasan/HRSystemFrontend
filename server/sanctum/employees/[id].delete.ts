import { apiFetch } from '../../utils/apiFetch'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Employee ID is required',
    })
  }

  return await apiFetch(`/employees/${id}`, {
    method: 'DELETE',
  })
})
