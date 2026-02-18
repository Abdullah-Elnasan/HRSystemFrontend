import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { useBranchesStore } from '~/stores/branches/branches'
import type { BranchForm } from '~/types/branch'

export function useBranches() {
  const store = useBranchesStore()
  const { branches, pagination, loading, error } = storeToRefs(store)

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
  const fetchBranches = (params?: Record<string, any>) => {
    const signal = cancelPreviousRequest()
    return store.fetchBranches(params ?? buildParams(), signal)
  }

  const debouncedFetchBranches = useDebounceFn(fetchBranches, 500)

  // ─── Pagination Setters ───────────────────────────────
  function setPage(p: number) {
    page.value = p
    fetchBranches()
  }

  function setPageSize(s: number) {
    pageSize.value = s
    page.value = 1
    fetchBranches()
  }

  function setSearch(val: string) {
    search.value = val
    page.value = 1
    debouncedFetchBranches()
  }

  // ─── CRUD ─────────────────────────────────────────────
  const fetchBranchById = (id: number | string) =>
    store.fetchBranchById(id)

  const createBranch = (payload: BranchForm | FormData) =>
    store.createBranch(payload)

  const updateBranch = (id: number, payload: Partial<BranchForm> | FormData) =>
    store.updateBranch(id, payload)

  const deleteBranch = (id: number) =>
    store.deleteBranch(id)

  return {
    // State
    branches,
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
    fetchBranches,
    debouncedFetchBranches,
    fetchBranchById,
    createBranch,
    updateBranch,
    deleteBranch,

    // Utilities
    clearError: store.clearError,
  }
}
