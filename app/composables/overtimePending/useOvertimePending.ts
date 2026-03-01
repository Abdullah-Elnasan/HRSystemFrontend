import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { useOvertimePendingStore } from '~/stores/overtimePending/overtimePending'
import type { OvertimePendingForm } from '~/types/payrolls/overtimePending'

export function useOvertimePending() {
  const store = useOvertimePendingStore()
  const { records, pagination, loading, error } = storeToRefs(store)

  // ─── Pagination & Search State ───────────────────────
  const page     = ref(1)
  const pageSize = ref(10)
  const search   = ref('')

  // ─── AbortController ─────────────────────────────────
  let abortController: AbortController | null = null

  function cancelPreviousRequest() {
    abortController?.abort()
    abortController = new AbortController()
    return abortController.signal
  }

  // ─── Build Params ─────────────────────────────────────
  function buildParams() {
    const params: Record<string, any> = {
      page:     page.value,
      per_page: pageSize.value,
    }

    if (search.value) {
      params['filter[search]'] = search.value
    }

    return params
  }

  // ─── Fetch ────────────────────────────────────────────
  const fetchRecords = (params?: Record<string, any>) => {
    const signal = cancelPreviousRequest()
    return store.fetchRecords(params ?? buildParams(), signal)
  }

  const debouncedFetchRecords = useDebounceFn(fetchRecords, 500)

  // ─── Pagination Setters ───────────────────────────────
  function setPage(p: number) {
    page.value = p
    fetchRecords()
  }

  function setPageSize(s: number) {
    pageSize.value = s
    page.value = 1
    fetchRecords()
  }

  function setSearch(val: string) {
    search.value = val
    page.value = 1
    debouncedFetchRecords()
  }

  // ─── Actions ──────────────────────────────────────────
  const createRecord = (payload: OvertimePendingForm | FormData) =>
    store.createRecord(payload)

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
    createRecord,

    // Utilities
    clearError: store.clearError,
  }
}
