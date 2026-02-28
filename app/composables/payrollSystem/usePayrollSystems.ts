import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { usePayrollSystemsStore } from '~/stores/payrollSystem/payrollSystem'
import type { PayrollSystemForm } from '~/types/payrollSystem'

export function usePayrollSystems() {
  const store = usePayrollSystemsStore()
  const { payrollSystems, pagination, loading, error } = storeToRefs(store)

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
  const fetchPayrollSystems = (params?: Record<string, any>) => {
    const signal = cancelPreviousRequest()
    return store.fetchPayrollSystems(params ?? buildParams(), signal)
  }

  const debouncedFetchPayrollSystems = useDebounceFn(fetchPayrollSystems, 500)

  // ─── Pagination Setters ───────────────────────────────
  function setPage(p: number) {
    page.value = p
    fetchPayrollSystems()
  }

  function setPageSize(s: number) {
    pageSize.value = s
    page.value = 1
    fetchPayrollSystems()
  }

  function setSearch(val: string) {
    search.value = val
    page.value = 1
    debouncedFetchPayrollSystems()
  }

  // ─── CRUD ─────────────────────────────────────────────
  const fetchPayrollSystemById = (id: number | string) =>
    store.fetchPayrollSystemById(id)

  const createPayrollSystem = (payload: PayrollSystemForm | FormData) =>
    store.createPayrollSystem(payload)

  const updatePayrollSystem = (id: number, payload: Partial<PayrollSystemForm> | FormData) =>
    store.updatePayrollSystem(id, payload)

  const deletePayrollSystem = (id: number) =>
    store.deletePayrollSystem(id)

  return {
    // State
    payrollSystems,
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
    fetchPayrollSystems,
    debouncedFetchPayrollSystems,
    fetchPayrollSystemById,
    createPayrollSystem,
    updatePayrollSystem,
    deletePayrollSystem,

    // Utilities
    clearError: store.clearError,
  }
}
