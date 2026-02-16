import { useEmployeesStore } from '~/stores/employee/employee'
import type { EmployeeForm } from '~/types/employee'
import { usePaginatedList } from '~/composables/usePaginatedList'

export function useEmployees() {
  const store = useEmployeesStore()
  const toast = useToast()

  /* ================== Paginated List (for backward compatibility) ================== */
  const list = usePaginatedList({
    key: 'employees',
    endpoint: 'https://time.telecode.tech/api/employees',
    store: {
      setData: store.setEmployees,
    },
  })

  /* ================== Fetch ================== */
  async function fetchEmployees(params?: Record<string, any>) {
    try {
      await store.fetchEmployees(params)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في جلب الموظفين',
        color: 'error',
      })
    }
  }

  async function fetchEmployeeById(id: number | string) {
    try {
      return await store.fetchEmployeeById(id)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في جلب الموظف',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Create ================== */
  async function createEmployee(payload: EmployeeForm | FormData) {
    try {
      return await store.createEmployee(payload)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في إنشاء الموظف',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Update ================== */
  async function updateEmployee(id: number, payload: Partial<EmployeeForm> | FormData) {
    try {
      return await store.updateEmployee(id, payload)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في تعديل الموظف',
        color: 'error',
      })
      throw error
    }
  }

  /* ================== Delete ================== */
  async function deleteEmployee(id: number) {
    try {
      await store.deleteEmployee(id)
    } catch (error: any) {
      toast.add({
        title: 'خطأ',
        description: store.error ?? 'فشل في حذف الموظف',
        color: 'error',
      })
      throw error
    }
  }

  return {
    ...list,
    data: computed(() => store.employees),
    pagination: computed(() => store.pagination),
    loading: computed(() => store.loading),
    error: computed(() => store.error),
    fetchEmployees,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    clearError: store.clearError,
  }
}
