// import type { FetchListOptions } from '~/types/api'


// export async function fetchList<T>(options: FetchListOptions): Promise<T> {
//   const { endpoint, page = 1, perPage = 10, search, signal } = options

//   const query: Record<string, any> = {
//     ...(page > 1 ? { page } : {}),
//     per_page: perPage,
//     ...(search ? { 'filter[search]': search } : {}),
//   }

//   const res = await $fetch<T>(endpoint, {
//     query,
//     signal,
//   })

//   return res
// }

// ~/service/useAsyncData.ts
import type { FetchListOptions } from '~/types/api'

export async function fetchList<T>(options: FetchListOptions): Promise<T> {
  const {
    endpoint,
    page = 1,
    perPage = 10,
    search,
    filters,
    signal,
  } = options

  const query: Record<string, any> = {
    ...(page > 1 ? { page } : {}),
    per_page: perPage,
    ...(search ? { 'filter[search]': search } : {}),
    ...(filters ?? {}),
  }

const res = await $fetch<T>(endpoint, {
  query,
  signal,
  credentials: 'include',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
})

  return res
}
