// server/api/branches.get.ts
import { proxyFetch } from '../../utils/proxyFetch'

export default defineEventHandler(async (event) => {
  const res = await proxyFetch(event, '/branches');
  return res;
})
