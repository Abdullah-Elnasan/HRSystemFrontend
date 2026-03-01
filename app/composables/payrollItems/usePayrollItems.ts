import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { usePayrollItemsStore } from '~/stores/payrollItems/payrollItems'
import type { PayrollItemForm } from '~/types/payrolls/payrollItem'

export function usePayrollItems(payrollRunId?: string | string[]) {
  const store = usePayrollItemsStore()
  const { items, pagination, loading, error } = storeToRefs(store)

  // ─── Dynamic Endpoint ─────────────────────────────────
  const endpoint = payrollRunId
    ? `api/payroll-runs/${payrollRunId}`
    : 'api/payroll-items'

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
  const fetchItems = (params?: Record<string, any>) => {
    const signal = cancelPreviousRequest()
    return store.fetchItems(params ?? buildParams(), signal, endpoint)
  }

  const debouncedFetchItems = useDebounceFn(fetchItems, 500)

  // ─── Pagination Setters ───────────────────────────────
  function setPage(p: number) {
    page.value = p
    fetchItems()
  }

  function setPageSize(s: number) {
    pageSize.value = s
    page.value = 1
    fetchItems()
  }

  function setSearch(val: string) {
    search.value = val
    page.value = 1
    debouncedFetchItems()
  }

  // ─── CRUD ─────────────────────────────────────────────
  const fetchItemById = (id: number | string) =>
    store.fetchItemById(id)

  const updateItem = (id: number, payload: Partial<PayrollItemForm> | FormData) =>
    store.updateItem(id, payload)

  const deleteItem = (id: number) =>
    store.deleteItem(id)

  return {
    // State
    items,
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
    fetchItems,
    debouncedFetchItems,
    fetchItemById,
    updateItem,
    deleteItem,

    // Utilities
    clearError: store.clearError,
  }
}
