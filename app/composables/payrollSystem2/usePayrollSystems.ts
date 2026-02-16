// ~/composables/payroll-systems/usePayrollSystems.ts
import { usePayrollSystemsStore } from '~/stores/payrollSystem/payrollSystem'
import type { PayrollSystemForm } from '~/types/payrollSystem'
import { usePaginatedList } from '~/composables/usePaginatedList'

export function usePayrollSystems() {
  const store = usePayrollSystemsStore()
  const toast = useToast()

  /* ================== Paginated List ================== */
  const list = usePaginatedList({
    key: 'payroll-systems',
    endpoint: '/api/payroll-systems/payroll-systems',
    store: {
      setData: store.setPayrollSystems,
    },
  })

  /* ================== Fetch ================== */
  async function fetchPayrollSystems(params?: Record<string, any>) {
    try {
      await store.fetchPayrollSystems(params)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في جلب أنظمة الرواتب',
        color: 'error',
      })
    }
  }

  async function fetchPayrollSystemById(id: number | string) {
    try {
      return await store.fetchPayrollSystemById(id)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في جلب نظام الرواتب',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Create ================== */
  async function createPayrollSystem(payload: PayrollSystemForm) {
    try {
      return await store.createPayrollSystem(payload)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في إنشاء نظام الرواتب',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Update ================== */
  async function updatePayrollSystem(id: number, payload: Partial<PayrollSystemForm>) {
    try {
      return await store.updatePayrollSystem(id, payload)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في تعديل نظام الرواتب',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Delete ================== */
  async function deletePayrollSystem(id: number) {
    try {
      await store.deletePayrollSystem(id)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في حذف نظام الرواتب',
        color: 'error',
      })
      throw error
    }
  }

  return {
    // من usePaginatedList
    ...list,

    // State
    data: computed(() => store.payrollSystems),
    pagination: computed(() => store.pagination),
    loading: computed(() => store.loading),
    error: computed(() => store.error),

    // Actions
    fetchPayrollSystems,
    fetchPayrollSystemById,
    createPayrollSystem,
    updatePayrollSystem,
    deletePayrollSystem,

    // Utilities
    clearError: store.clearError,
  }
}
