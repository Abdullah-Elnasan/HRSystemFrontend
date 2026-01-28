// server/api/employees.get.ts
import { proxyFetch } from '../../utils/proxyFetch'

export default defineEventHandler(async (event) => {
  const res = await proxyFetch(event, '/branches');
  console.log('res branches.get.ts:');
  console.log(res);
  return res;
})
