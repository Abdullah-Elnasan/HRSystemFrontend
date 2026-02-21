import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { useAttendanceStore } from '~/stores/attendances/attendances'
import type { AttendanceForm } from '~/types/attendance'
import dayjs from 'dayjs'

export function useAttendance(options?: {
  dateFrom?:     string
  dateTo?:       string
  branchId?:     number | null
  departmentId?: number | null
  status?:       string | null
}) {
  const store = useAttendanceStore()
  const { records, pagination, loading, error } = storeToRefs(store)

  // ─── Pagination & Search State ───────────────────────
  const page     = ref(1)
  const pageSize = ref(10)
  const search   = ref('')

  // ─── Default Filters ──────────────────────────────────
  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD')
  const endOfMonth   = dayjs().endOf('month').format('YYYY-MM-DD')

  const activeFilters = reactive<Record<string, any>>({
    'filter[date_from]': options?.dateFrom ?? startOfMonth,
    'filter[date_to]':   options?.dateTo   ?? endOfMonth,
    ...(options?.branchId     ? { 'filter[branch_id]':     options.branchId     } : {}),
    ...(options?.departmentId ? { 'filter[department_id]': options.departmentId } : {}),
    ...(options?.status       ? { 'filter[status]':        options.status       } : {}),
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

  // ─── CRUD ─────────────────────────────────────────────
  const fetchRecordById = (id: number | string) =>
    store.fetchRecordById(id)

  const createRecord = (payload: AttendanceForm | FormData) =>
    store.createRecord(payload)

  const updateRecord = (id: number, payload: Partial<AttendanceForm> | FormData) =>
    store.updateRecord(id, payload)

  const deleteRecord = (id: number) =>
    store.deleteRecord(id)

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
    fetchRecordById,
    createRecord,
    updateRecord,
    deleteRecord,
    refetch,

    // Utilities
    clearError: store.clearError,
  }
}
