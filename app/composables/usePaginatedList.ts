import { useDebouncedRef } from '~/composables/useDebouncedRef'
import { updateQuery } from '~/composables/useQueryUpdater'
import { fetchList } from '~/service/useAsyncData'

type Pagination = {
  total: number
  per_page: number
  current_page: number
  last_page: number
}

type ListStore<T> = {
  setData(payload: { data: T[]; pagination: Pagination }): void
}

type UsePaginatedListOptions<T, R> = {
  key: string
  endpoint: string
  store: ListStore<T>
  mapResponse?: (res: R) => { data: T[]; pagination: Pagination }
}

export function usePaginatedList<T, R>({
  key,
  endpoint,
  store,
  mapResponse,
}: UsePaginatedListOptions<T, R>) {
  const route = useRoute()
  const router = useRouter()

  /* -------- State -------- */
  const page = computed(() => Number(route.query.page ?? 1))
  const pageSize = computed(() => Number(route.query.per_page ?? 10))
  const search = ref(String(route.query.search ?? ''))
  const debouncedSearch = useDebouncedRef(search, 400)
  const controller = ref<AbortController | null>(null)

  /* -------- Async -------- */
  const asyncKey = computed(
    () =>
      `${key}-${route.fullPath}-${page.value}-${pageSize.value}-${debouncedSearch.value}`
  )

  const { pending, refresh } = useAsyncData(
    asyncKey,
    async () => {
      controller.value?.abort()
      controller.value = new AbortController()

      const res = await fetchList<R>({
        endpoint,
        page: page.value,
        perPage: pageSize.value,
        search: search.value,
        signal: controller.value.signal,
      })

      const payload = mapResponse
        ? mapResponse(res)
        : (res as unknown as { data: T[]; pagination: Pagination })

      store.setData(payload)

      return res
    },
    { immediate: true, server: false }
  )

  watch([page, pageSize, debouncedSearch], () => refresh());


  /* -------- Query helpers -------- */
  function setPage(p: number) {
    updateQuery(router, route, { page: p > 0 ? p : undefined })
  }

  function setPageSize(size: number) {
    updateQuery(router, route, { per_page: size, page: undefined })
  }

  function setSearch(val: string) {
    search.value = val
    updateQuery(router, route, { search: val || undefined, page: undefined })
  }

  return {
    page,
    pageSize,
    search,
    pending,
    refresh,
    setPage,
    setPageSize,
    setSearch,
  }
}
