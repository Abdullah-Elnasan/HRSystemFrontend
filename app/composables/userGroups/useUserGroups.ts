import { useUserGroupStore } from '~/stores/userGroups/userGroups'
import type { UserGroupForm } from '~/types/userGroups'
import { usePaginatedList } from '~/composables/usePaginatedList'

export function useUserGroup() {
  const store = useUserGroupStore()
  const toast = useToast()

  const list = usePaginatedList({
    key: 'userGroups',
    endpoint: '/api/user-groups/user-groups',
    store: { setData: store.setUserGroups },
  })

  async function fetchUserGroups(params?: Record<string, any>) {
    try {
      await store.fetchUserGroups(params)
    } catch (err: any) {
      toast.add({ title: 'خطأ', description: store.error ?? 'فشل في جلب المجموعات', color: 'error' })
    }
  }

  async function fetchUserGroupById(id: number | string) {
    try {
      return await store.fetchUserGroupById(id)
    } catch (err: any) {
      toast.add({ title: 'خطأ', description: store.error ?? 'فشل في جلب المجموعة', color: 'error' })
      throw err
    }
  }

  async function createUserGroup(payload: UserGroupForm | FormData) {
    try {
      return await store.createUserGroup(payload)
    } catch (err: any) {
      toast.add({ title: 'خطأ', description: store.error ?? 'فشل في إنشاء المجموعة', color: 'error' })
      throw err
    }
  }

  async function updateUserGroup(id: number, payload: Partial<UserGroupForm> | FormData) {
    try {
      return await store.updateUserGroup(id, payload)
    } catch (err: any) {
      toast.add({ title: 'خطأ', description: store.error ?? 'فشل في تعديل المجموعة', color: 'error' })
      throw err
    }
  }

  async function deleteUserGroup(id: number) {
    try {
      await store.deleteUserGroup(id)
    } catch (err: any) {
      toast.add({ title: 'خطأ', description: store.error ?? 'فشل في حذف المجموعة', color: 'error' })
      throw err
    }
  }

  return {
    ...list,
    data: computed(() => store.userGroups),
    pagination: computed(() => store.pagination),
    loading: computed(() => store.loading),
    error: computed(() => store.error),
    fetchUserGroups,
    fetchUserGroupById,
    createUserGroup,
    updateUserGroup,
    deleteUserGroup,
    clearError: store.clearError,
  }
}
