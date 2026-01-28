// server/api/employees.get.ts
import { proxyFetch } from '../../utils/proxyFetch'

export default defineEventHandler(async (event) => {
  const res = await proxyFetch(event, '/departments')
  console.log('res departments.get.ts:');
  console.log(res);
  return res;
})
