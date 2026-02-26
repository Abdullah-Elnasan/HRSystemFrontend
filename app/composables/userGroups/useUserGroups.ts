import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { useUserGroupStore } from '~/stores/userGroups/userGroups'
import type { UserGroupForm, PermissionAssignForm } from '~/types/userGroups'

export function useUserGroup() {
  const store = useUserGroupStore()
  const { userGroups, pagination, loading, error } = storeToRefs(store)

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
  const fetchUserGroups = (params?: Record<string, any>) => {
    const signal = cancelPreviousRequest()
    return store.fetchUserGroups(params ?? buildParams(), signal)
  }

  const debouncedFetchUserGroups = useDebounceFn(fetchUserGroups, 500)

  // ─── Pagination Setters ───────────────────────────────
  function setPage(p: number) {
    page.value = p
    fetchUserGroups()
  }

  function setPageSize(s: number) {
    pageSize.value = s
    page.value = 1
    fetchUserGroups()
  }

  function setSearch(val: string) {
    search.value = val
    page.value = 1
    debouncedFetchUserGroups()
  }

  // ─── CRUD ─────────────────────────────────────────────
  const fetchUserGroupById = (id: number | string) =>
    store.fetchUserGroupById(id)

  const createUserGroup = (payload: UserGroupForm | FormData) =>
    store.createUserGroup(payload)

  const updateUserGroup = (id: number, payload: Partial<UserGroupForm> | FormData) =>
    store.updateUserGroup(id, payload)

  const deleteUserGroup = (id: number) =>
    store.deleteUserGroup(id)

  // ─── Permissions ──────────────────────────────────────
  const assignPermissions = (payload: PermissionAssignForm) =>
    store.assignPermissions(payload)

  const removePermissions = (payload: PermissionAssignForm) =>
    store.removePermissions(payload)

  return {
    // State
    userGroups,
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
    fetchUserGroups,
    debouncedFetchUserGroups,
    fetchUserGroupById,
    createUserGroup,
    updateUserGroup,
    deleteUserGroup,

    // Permissions
    assignPermissions,
    removePermissions,

    // Utilities
    clearError: store.clearError,
  }
}
