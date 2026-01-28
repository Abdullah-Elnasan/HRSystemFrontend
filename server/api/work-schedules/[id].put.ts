import { apiFetch } from '../../utils/apiFetch'
import { readFormData, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'work-schedules ID is required',
    })
  }

  const formData = await readFormData(event)
  console.log(formData)
  return apiFetch(`/work-schedules/${id}`, {
    method: 'PUT',
    body: formData,
  })
})
