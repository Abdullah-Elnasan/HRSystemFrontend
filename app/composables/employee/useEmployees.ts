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

  // ─── Filters ──────────────────────────────────────────
  const selectedStatus     = ref<string | null>(null)
  const selectedBranch     = ref<number | null>(null)
  const selectedDepartment = ref<number | null>(null)

  const activeFilters = reactive<Record<string, any>>({})

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
  const fetchEmployees = (params?: Record<string, any>) => {
    const signal = cancelPreviousRequest()
    return store.fetchEmployees(params ?? buildParams(), signal)
  }

  const debouncedFetchEmployees = useDebounceFn(fetchEmployees, 500)

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
    return fetchEmployees(buildParams())
  }

  // ─── Pagination Setters ───────────────────────────────
  function setPage(p: number) {
    page.value = p
    fetchEmployees(buildParams())
  }

  function setPageSize(s: number) {
    pageSize.value = s
    page.value = 1
    fetchEmployees(buildParams())
  }

  function setSearch(val: string) {
    search.value = val
    page.value = 1
    debouncedFetchEmployees(buildParams())
  }

  // ─── Filter Setters ───────────────────────────────────
  function setStatus(val: string | null) {
    selectedStatus.value = val
    refetch({ 'filter[status]': val })
  }

  function setBranch(val: number | null) {
    selectedBranch.value = val
    refetch({ 'filter[branch_id]': val })
  }

  function setDepartment(val: number | null) {
    selectedDepartment.value = val
    refetch({ 'filter[department_id]': val })
  }

  function resetFilters() {
    selectedStatus.value     = null
    selectedBranch.value     = null
    selectedDepartment.value = null
    Object.keys(activeFilters).forEach(key => delete activeFilters[key])
    page.value = 1
    return fetchEmployees(buildParams())
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

    // Filters
    selectedStatus,
    selectedBranch,
    selectedDepartment,
    setStatus,
    setBranch,
    setDepartment,
    resetFilters,
    refetch,

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
