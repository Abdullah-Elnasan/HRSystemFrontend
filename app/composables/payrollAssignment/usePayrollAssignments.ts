import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { usePayrollAssignmentsStore } from '~/stores/payrollAssignments/payrollAssignments'
import type { PayrollAssignmentForm } from '~/types/payrollAssignments'

export function usePayrollAssignments() {
  const store = usePayrollAssignmentsStore()
  const { assignments, pagination, loading, error } = storeToRefs(store)

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
  const fetchAssignments = (params?: Record<string, any>) => {
    const signal = cancelPreviousRequest()
    return store.fetchAssignments(params ?? buildParams(), signal)
  }

  const debouncedFetchAssignments = useDebounceFn(fetchAssignments, 500)

  // ─── Pagination Setters ───────────────────────────────
  function setPage(p: number) {
    page.value = p
    fetchAssignments()
  }

  function setPageSize(s: number) {
    pageSize.value = s
    page.value = 1
    fetchAssignments()
  }

  function setSearch(val: string) {
    search.value = val
    page.value = 1
    debouncedFetchAssignments()
  }

  // ─── CRUD ─────────────────────────────────────────────
  const fetchAssignmentById = (id: number | string) =>
    store.fetchAssignmentById(id)

  const createAssignment = (payload: PayrollAssignmentForm | FormData) =>
    store.createAssignment(payload)

  const updateAssignment = (id: number, payload: Partial<PayrollAssignmentForm> | FormData) =>
    store.updateAssignment(id, payload)

  const deleteAssignment = (id: number) =>
    store.deleteAssignment(id)

  return {
    // State
    assignments,
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
    fetchAssignments,
    debouncedFetchAssignments,
    fetchAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,

    // Utilities
    clearError: store.clearError,
  }
}
