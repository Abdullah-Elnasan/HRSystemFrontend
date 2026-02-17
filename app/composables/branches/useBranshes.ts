// composables/branches/useBranches.ts
import { storeToRefs } from 'pinia'
import { useBranchesStore } from '~/stores/branches/branches'
import type { BranchForm } from '~/types/branch'
import { useDebounceFn } from '@vueuse/core' // إذا كنت تستخدم VueUse

export function useBranches() {
  const store = useBranchesStore()

  // استخدام storeToRefs للحفاظ على الـ reactivity
  const { branches, pagination, loading, error } = storeToRefs(store)

  // AbortController للإلغاء
  let abortController: AbortController | null = null

  /* ================== Fetch مع إلغاء الطلبات السابقة ================== */
  const fetchBranches = async (params?: Record<string, any>) => {
    // إلغاء الطلب السابق إن وجد
    if (abortController) {
      abortController.abort()
    }

    // إنشاء controller جديد
    abortController = new AbortController()

    return store.fetchBranches(params, abortController.signal)
  }

  // Debounced version للبحث
  const debouncedFetchBranches = useDebounceFn(
    (params?: Record<string, any>) => fetchBranches(params),
    500 // تأخير 500ms
  )

  const fetchBranchById = (id: number | string) =>
    store.fetchBranchById(id)

  const createBranch = (payload: BranchForm) =>
    store.createBranch(payload)

  const updateBranch = (id: number, payload: Partial<BranchForm>) =>
    store.updateBranch(id, payload)

  const deleteBranch = (id: number) =>
    store.deleteBranch(id)

  return {
    // State - reactive refs
    branches,
    pagination,
    loading,
    error,

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
