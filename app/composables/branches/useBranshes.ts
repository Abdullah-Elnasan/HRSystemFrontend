// composables/branches/useBranches.ts
import { useBranchesStore } from '~/stores/branches/branches'
import type { BranchForm } from '~/types/branch'
import { usePaginatedList } from '~/composables/usePaginatedList'

export function useBranches() {
  const store = useBranchesStore()
  const toast = useToast()

  /* ================== Paginated List (for backward compatibility) ================== */
  const list = usePaginatedList({
    key: 'branches',
    endpoint: '/api/branches/branches',
    store: {
      setData: store.setBranches,
    },
  })

  /* ================== Fetch ================== */
  async function fetchBranches(params?: Record<string, any>) {
    try {
      await store.fetchBranches(params)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في جلب الفروع',
        color: 'error',
      })
    }
  }

  async function fetchBranchById(id: number | string) {
    try {
      return await store.fetchBranchById(id)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في جلب الفرع',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Create ================== */
  async function createBranch(payload: BranchForm) {
    try {
      return await store.createBranch(payload)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في إنشاء الفرع',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Update ================== */
  async function updateBranch(id: number, payload: Partial<BranchForm>) {
    try {
      return await store.updateBranch(id, payload)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في تعديل الفرع',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Delete ================== */
  async function deleteBranch(id: number) {
    try {
      await store.deleteBranch(id)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في حذف الفرع',
        color: 'error',
      })
      throw error
    }
  }

  return {
    // من usePaginatedList (للتوافق مع الكود القديم)
    ...list,

    // State
    data: computed(() => store.branches),
    pagination: computed(() => store.pagination),
    loading: computed(() => store.loading),
    error: computed(() => store.error),

    // Actions
    fetchBranches,
    fetchBranchById,
    createBranch,
    updateBranch,
    deleteBranch,

    // Utilities
    clearError: store.clearError,
  }
}
