import { useWorkSchedulesStore } from '~/stores/workSchedule/workSchedule'
import type { WorkScheduleForm, WorkSchedulePayload } from '~/types/workSchedule'
import { usePaginatedList } from '~/composables/usePaginatedList'

export function useWorkSchedules() {
  const store = useWorkSchedulesStore()
  const toast = useToast()

  const list = usePaginatedList({
    key: 'workSchedules',
    endpoint: '/api/work-schedules/work-schedules',
    store: { setData: store.setWorkSchedules },
  })

  async function fetchWorkSchedules(params?: Record<string, any>) {
    console.log('fetchWorkSchedules called with params:', params)
    try {
      await store.fetchWorkSchedules(params)
    } catch (err: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في جلب جداول العمل',
        color: 'error',
      })
    }
  }

  async function fetchWorkScheduleById(id: number | string) {
    try {
      return await store.fetchWorkScheduleById(id)
    } catch (err: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في جلب جدول العمل',
        color: 'error',
      })
      throw err
    }
  }

  async function createWorkSchedule(payload: WorkSchedulePayload) {
    try {
      return await store.createWorkSchedule(payload)
    } catch (err: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في إنشاء جدول العمل',
        color: 'error',
      })
      throw err
    }
  }

  async function updateWorkSchedule(
    id: number,
    payload: Partial<WorkScheduleForm> | FormData
  ) {
    try {
      return await store.updateWorkSchedule(id, payload)
    } catch (err: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في تعديل جدول العمل',
        color: 'error',
      })
      throw err
    }
  }

  async function deleteWorkSchedule(id: number) {
    try {
      await store.deleteWorkSchedule(id)
    } catch (err: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في حذف جدول العمل',
        color: 'error',
      })
      throw err
    }
  }

  return {
    ...list,

    data: computed(() => store.workSchedules),
    pagination: computed(() => store.pagination),
    loading: computed(() => store.loading),
    error: computed(() => store.error),

    fetchWorkSchedules,
    fetchWorkScheduleById,
    createWorkSchedule,
    updateWorkSchedule,
    deleteWorkSchedule,
    clearError: store.clearError,
  }
}
