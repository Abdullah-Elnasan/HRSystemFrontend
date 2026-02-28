import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { useAttendanceEmployeeStore } from '~/stores/attendances/attendancesEmployee'
import dayjs from 'dayjs'

export function useAttendancesEmployee(options?: {
  employeeId?: number
  dateFrom?:   string
  dateTo?:     string
}) {
  const store = useAttendanceEmployeeStore()
  const { records, pagination, loading, error } = storeToRefs(store)

  // ─── Pagination & Search State ───────────────────────
  const page     = ref(1)
  const pageSize = ref(10)
  const search   = ref('')

  // ─── Default Filters ──────────────────────────────────
  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD')
  const endOfMonth   = dayjs().endOf('month').format('YYYY-MM-DD')

  const activeFilters = reactive<Record<string, any>>({
    'filter[employee_id]': options?.employeeId,
    'filter[date_from]':   options?.dateFrom ?? startOfMonth,
    'filter[date_to]':     options?.dateTo   ?? endOfMonth,
  })

  // ─── AbortController ─────────────────────────────────
  let abortController: AbortController | null = null

  function cancelPreviousRequest() {
    abortController?.abort()
    abortController = new AbortController()
    return abortController.signal
  }

  // ─── Build Params ─────────────────────────────────────
  function buildParams(extra?: Record<string, any>) {
    const params: Record<string, any> = {
      page:     page.value,
      per_page: pageSize.value,
      ...activeFilters,
    }

    if (search.value) {
      params['filter[search]'] = search.value
    }

    if (extra) {
      Object.entries(extra).forEach(([key, val]) => {
        if (val === null || val === undefined) {
          delete params[key]
        } else {
          params[key] = val
        }
      })
    }

    return params
  }

  // ─── Fetch ────────────────────────────────────────────
  const fetchRecords = (params?: Record<string, any>) => {
    const signal = cancelPreviousRequest()
    return store.fetchRecords(params ?? buildParams(), signal)
  }

  const debouncedFetchRecords = useDebounceFn(fetchRecords, 500)

  // ─── Refetch مع فلاتر جديدة ───────────────────────────
  function refetch(newFilters: Record<string, any>) {
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === null || val === undefined) {
        delete activeFilters[key]
      } else {
        activeFilters[key] = val
      }
    })
    page.value = 1
    return fetchRecords(buildParams())
  }

  // ─── Pagination Setters ───────────────────────────────
  function setPage(p: number) {
    page.value = p
    fetchRecords(buildParams())
  }

  function setPageSize(s: number) {
    pageSize.value = s
    page.value = 1
    fetchRecords(buildParams())
  }

  function setSearch(val: string) {
    search.value = val
    page.value = 1
    debouncedFetchRecords(buildParams())
  }

  return {
    // State
    records,
    pagination,
    loading,
    error,

    // Pagination
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,

    // Actions
    fetchRecords,
    debouncedFetchRecords,
    refetch,

    // Utilities
    clearError: store.clearError,
  }
}
