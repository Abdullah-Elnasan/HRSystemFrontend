import { useDepartmentsStore } from '~/stores/departments/departments'
import type { DepartmentForm } from '~/types/deparment'
import { usePaginatedList } from '~/composables/usePaginatedList'

export function useDepartments() {
  const store = useDepartmentsStore()
  const toast = useToast()

  /* ================== Paginated List (for backward compatibility) ================== */
  const list = usePaginatedList({
    key: 'departments',
    endpoint: '/api/departments/departments',
    store: {
      setData: store.setDepartments,
    },
  })

  /* ================== Fetch ================== */
  async function fetchDepartments(params?: Record<string, any>) {
    try {
      await store.fetchDepartments(params)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في جلب الأقسام',
        color: 'error',
      })
    }
  }

  async function fetchDepartmentById(id: number | string) {
    try {
      return await store.fetchDepartmentById(id)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في جلب القسم',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Create ================== */
  async function createDepartment(payload: DepartmentForm | FormData) {
    try {
      return await store.createDepartment(payload)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في إنشاء القسم',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Update ================== */
  async function updateDepartment(id: number, payload: Partial<DepartmentForm> | FormData) {
    try {
      return await store.updateDepartment(id, payload)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في تعديل القسم',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Delete ================== */
  async function deleteDepartment(id: number) {
    try {
      await store.deleteDepartment(id)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في حذف القسم',
        color: 'error',
      })
      throw error
    }
  }

  return {
    ...list,
    data: computed(() => store.departments),
    pagination: computed(() => store.pagination),
    loading: computed(() => store.loading),
    error: computed(() => store.error),
    fetchDepartments,
    fetchDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    clearError: store.clearError,
  }
}
