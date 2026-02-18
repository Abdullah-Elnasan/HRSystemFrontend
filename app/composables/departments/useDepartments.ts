// E:\Nuxt\HR-System-Frontend\app\composables\departments\useDepartments.ts
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { useDepartmentsStore } from '~/stores/departments/departments'
import type { DepartmentForm, DepartmentFilters } from '~/types/deparment'

export function useDepartments() {
  const store = useDepartmentsStore()
  const { departments, pagination, loading, error } = storeToRefs(store)

  // ─── Pagination & Search State ───────────────────────
  const page = ref(1)
  const pageSize = ref(10)
  const search = ref('')

  // ─── AbortController ─────────────────────────────────
  let abortController: AbortController | null = null

  function cancelPreviousRequest() {
    abortController?.abort()
    abortController = new AbortController()
    return abortController.signal
  }

  // ─── Build Params من DepartmentFilters ───────────────
  function buildParams() {
    const params: Record<string, any> = {
      page: page.value,
      per_page: pageSize.value,
    }

    if (search.value) {
      params['filter[search]'] = search.value
    }

    return params
  }

  // ─── Fetch ────────────────────────────────────────────
  const fetchDepartments = (params?: DepartmentFilters) => {
    const signal = cancelPreviousRequest()
    return store.fetchDepartments(params ?? buildParams(), signal)
  }

  const debouncedFetchDepartments = useDebounceFn(fetchDepartments, 500)

  // ─── Pagination Setters ───────────────────────────────
  function setPage(p: number) {
    page.value = p
    fetchDepartments()
  }

  function setPageSize(s: number) {
    pageSize.value = s
    page.value = 1
    fetchDepartments()
  }

  function setSearch(val: string) {
    search.value = val
    page.value = 1
    debouncedFetchDepartments()
  }

  // ─── CRUD ─────────────────────────────────────────────
  const fetchDepartmentById = (id: number | string) =>
    store.fetchDepartmentById(id)

  const createDepartment = (payload: DepartmentForm | FormData) =>
    store.createDepartment(payload)

  const updateDepartment = (id: number, payload: Partial<DepartmentForm> | FormData) =>
    store.updateDepartment(id, payload)

  const deleteDepartment = (id: number) =>
    store.deleteDepartment(id)

  return {
    // State
    departments,
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
    fetchDepartments,
    debouncedFetchDepartments,
    fetchDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,

    // Utilities
    clearError: store.clearError,
  }
}
