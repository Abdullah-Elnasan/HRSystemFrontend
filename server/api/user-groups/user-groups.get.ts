// server/api/employees.get.ts
import { proxyFetch } from '../../utils/proxyFetch'

export default defineEventHandler(async (event) => {
  return proxyFetch(event, '/user-groups')
})


