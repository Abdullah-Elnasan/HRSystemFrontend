import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { usePermissionsStore } from '~/stores/permissions/permissions'

export function usePermissions() {
  const store = usePermissionsStore()
  const { permissions, pagination, loading, error } = storeToRefs(store)

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
  const fetchPermissions = (params?: Record<string, any>) => {
    const signal = cancelPreviousRequest()
    return store.fetchPermissions(params ?? buildParams(), signal)
  }

  const debouncedFetchPermissions = useDebounceFn(fetchPermissions, 500)

  // ─── Pagination Setters ───────────────────────────────
  function setPage(p: number) {
    page.value = p
    fetchPermissions()
  }

  function setPageSize(s: number) {
    pageSize.value = s
    page.value = 1
    fetchPermissions()
  }

  function setSearch(val: string) {
    search.value = val
    page.value = 1
    debouncedFetchPermissions()
  }

  // ─── Fetch By Id ──────────────────────────────────────
  const fetchPermissionById = (id: number | string) =>
    store.fetchPermissionById(id)

  return {
    // State
    permissions,
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
    fetchPermissions,
    debouncedFetchPermissions,
    fetchPermissionById,

    // Utilities
    clearError: store.clearError,
  }
}
