import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { useWorkSchedulesStore } from '~/stores/workSchedule/workSchedule'
import type { WorkSchedulePayload } from '~/types/workSchedule'

export function useWorkSchedules() {
  const store = useWorkSchedulesStore()
  const { workSchedules, pagination, loading, error } = storeToRefs(store)

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
  const fetchWorkSchedules = (params?: Record<string, any>) => {
    const signal = cancelPreviousRequest()
    return store.fetchWorkSchedules(params ?? buildParams(), signal)
  }

  const debouncedFetchWorkSchedules = useDebounceFn(fetchWorkSchedules, 500)

  // ─── Pagination Setters ───────────────────────────────
  function setPage(p: number) {
    page.value = p
    fetchWorkSchedules()
  }

  function setPageSize(s: number) {
    pageSize.value = s
    page.value = 1
    fetchWorkSchedules()
  }

  function setSearch(val: string) {
    search.value = val
    page.value = 1
    debouncedFetchWorkSchedules()
  }

  // ─── CRUD ─────────────────────────────────────────────
  const fetchWorkScheduleById = (id: number | string) =>
    store.fetchWorkScheduleById(id)

  const createWorkSchedule = (payload: WorkSchedulePayload) =>
    store.createWorkSchedule(payload)

  const updateWorkSchedule = (id: number, payload: Partial<WorkSchedulePayload> | FormData) =>
    store.updateWorkSchedule(id, payload)

  const deleteWorkSchedule = (id: number) =>
    store.deleteWorkSchedule(id)

  return {
    // State
    workSchedules,
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
    fetchWorkSchedules,
    debouncedFetchWorkSchedules,
    fetchWorkScheduleById,
    createWorkSchedule,
    updateWorkSchedule,
    deleteWorkSchedule,

    // Utilities
    clearError: store.clearError,
  }
}
