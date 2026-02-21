import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { useEmployeesStore } from '~/stores/employee/employee'
import type { EmployeeForm } from '~/types/employee'

export function useEmployees() {
  const store = useEmployeesStore()
  const { employees, pagination, loading, error } = storeToRefs(store)

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
  const fetchEmployees = (params?: Record<string, any>) => {
    const signal = cancelPreviousRequest()
    return store.fetchEmployees(params ?? buildParams(), signal)
  }

  const debouncedFetchEmployees = useDebounceFn(fetchEmployees, 500)

  // ─── Pagination Setters ───────────────────────────────
  function setPage(p: number) {
    page.value = p
    fetchEmployees()
  }

  function setPageSize(s: number) {
    pageSize.value = s
    page.value = 1
    fetchEmployees()
  }

  function setSearch(val: string) {
    search.value = val
    page.value = 1
    debouncedFetchEmployees()
  }

  // ─── CRUD ─────────────────────────────────────────────
  const fetchEmployeeById = (id: number | string) =>
    store.fetchEmployeeById(id)

  const createEmployee = (payload: EmployeeForm | FormData) =>
    store.createEmployee(payload)

  const updateEmployee = (id: number, payload: Partial<EmployeeForm> | FormData) =>
    store.updateEmployee(id, payload)

  const deleteEmployee = (id: number) =>
    store.deleteEmployee(id)

  return {
    // State
    employees,
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
    fetchEmployees,
    debouncedFetchEmployees,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,

    // Utilities
    clearError: store.clearError,
  }
}
