// ~/composables/permissions/usePermissions.ts
import { usePermissionsStore } from '~/stores/permissions/permissions'
import type { PermissionForm } from '~/types/permission'
import { usePaginatedList } from '~/composables/usePaginatedList'

export function usePermissions() {
  const store = usePermissionsStore()
  const toast = useToast()

  /* ================== Paginated List ================== */
  const list = usePaginatedList({
    key: 'permissions',
    endpoint: '/api/permissions',
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

  /* ================== Create ================== */
  async function createPermission(payload: PermissionForm) {
    try {
      return await store.createPermission(payload)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في إنشاء الصلاحية',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Update ================== */
  async function updatePermission(id: number, payload: Partial<PermissionForm>) {
    try {
      return await store.updatePermission(id, payload)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في تعديل الصلاحية',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Delete ================== */
  async function deletePermission(id: number) {
    try {
      await store.deletePermission(id)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في حذف الصلاحية',
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
    createPermission,
    updatePermission,
    deletePermission,

    // Utilities
    clearError: store.clearError,
  }
}
