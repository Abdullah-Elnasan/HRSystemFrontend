// ~/composables/permissions/usePermissions.ts
import { usePermissionsStore } from '~/stores/permissions/permissions'
import { usePaginatedList } from '~/composables/usePaginatedList'

export function usePermissions() {
  const store = usePermissionsStore()
  const toast = useToast()

  /* ================== Paginated List ================== */
  const list = usePaginatedList({
    key: 'permissions',
    endpoint: '/api/permissions/permissions',
    store: {
      setData: store.setPermissions,
    },
  })

  /* ================== Fetch ================== */
  async function fetchPermissions(params?: Record<string, any>) {
    try {
      await store.fetchPermissions(params)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في جلب الصلاحيات',
        color: 'error',
      })
    }
  }

  async function fetchPermissionById(id: number | string) {
    try {
      return await store.fetchPermissionById(id)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في جلب الصلاحية',
        color: 'error',
      })
      throw error
    }
  }



  return {
    // من usePaginatedList
    ...list,

    // State
    data: computed(() => store.permissions),
    pagination: computed(() => store.pagination),
    loading: computed(() => store.loading),
    error: computed(() => store.error),

    // Actions
    fetchPermissions,
    fetchPermissionById,

    // Utilities
    clearError: store.clearError,
  }
}
