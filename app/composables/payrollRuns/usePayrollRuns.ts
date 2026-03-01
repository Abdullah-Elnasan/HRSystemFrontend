import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { usePayrollRunsStore } from '~/stores/payrollRuns/payrollRuns'
import type { PayrollRunForm } from '~/types/payrolls/payrollRun'

export function usePayrollRuns() {
  const store = usePayrollRunsStore()
  const { runs, pagination, loading, error } = storeToRefs(store)

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
  const fetchRuns = (params?: Record<string, any>) => {
    const signal = cancelPreviousRequest()
    return store.fetchRuns(params ?? buildParams(), signal)
  }

  const debouncedFetchRuns = useDebounceFn(fetchRuns, 500)

  // ─── Pagination Setters ───────────────────────────────
  function setPage(p: number) {
    page.value = p
    fetchRuns()
  }

  function setPageSize(s: number) {
    pageSize.value = s
    page.value = 1
    fetchRuns()
  }

  function setSearch(val: string) {
    search.value = val
    page.value = 1
    debouncedFetchRuns()
  }

  // ─── Actions ──────────────────────────────────────────
  const fetchRunById = (id: number | string) =>
    store.fetchRunById(id)

  const aprooveRun = (payload: PayrollRunForm | FormData) =>
    store.aprooveRun(payload)

  const updateRun = (id: number, payload: Partial<PayrollRunForm> | FormData) =>
    store.updateRun(id, payload)

  const deleteRun = (id: number) =>
    store.deleteRun(id)

  return {
    // State
    runs,
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
    fetchRuns,
    debouncedFetchRuns,
    fetchRunById,
    aprooveRun,
    updateRun,
    deleteRun,

    // Utilities
    clearError: store.clearError,
  }
}
