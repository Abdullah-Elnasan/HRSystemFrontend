// ~/composables/work-schedule-assignments/useWorkScheduleAssignments.ts
import { useWorkScheduleAssignmentsStore } from '~/stores/workScheduleAssignments/workScheduleAssignment'
import type { WorkScheduleAssignmentForm } from '~/types/workScheduleAssignments'
import { usePaginatedList } from '~/composables/usePaginatedList'

export function useWorkScheduleAssignments() {
  const store = useWorkScheduleAssignmentsStore()
  const toast = useToast()

  /* ================== Paginated List ================== */
  const list = usePaginatedList({
    key: 'work-schedule-assignments',
    endpoint: '/api/work-schedule-assignments/work-schedule-assignments',
    store: {
      setData: store.setAssignments,
    },
  })

  /* ================== Fetch ================== */
  async function fetchAssignments(params?: Record<string, any>) {
    try {
      await store.fetchAssignments(params)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في جلب الإسنادات',
        color: 'error',
      })
    }
  }

  async function fetchAssignmentById(id: number | string) {
    try {
      return await store.fetchAssignmentById(id)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في جلب الإسناد',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Create ================== */
  async function createAssignment(payload: Partial<WorkScheduleAssignmentForm>) {
    try {
      return await store.createAssignment(payload)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في إنشاء الإسناد',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Update ================== */
  async function updateAssignment(id: number, payload: Partial<WorkScheduleAssignmentForm>) {
    try {
      return await store.updateAssignment(id, payload)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في تعديل الإسناد',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Delete ================== */
  async function deleteAssignment(id: number) {
    try {
      await store.deleteAssignment(id)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في حذف الإسناد',
        color: 'error',
      })
      throw error
    }
  }

  return {
    // من usePaginatedList
    ...list,

    // State
    data: computed(() => store.assignments),
    pagination: computed(() => store.pagination),
    loading: computed(() => store.loading),
    error: computed(() => store.error),

    // Actions
    fetchAssignments,
    fetchAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,

    // Utilities
    clearError: store.clearError,
  }
}
