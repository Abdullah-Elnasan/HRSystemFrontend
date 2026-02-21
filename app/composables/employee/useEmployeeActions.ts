import type { EmployeeForm } from '~/types/employee'
import type { apiResponse } from '~/types/table'
import { useEmployees } from '~/composables/employee/useEmployees'
import { handleApiError } from '~/utils/handleApiError'

export function useEmployeeActions(onSuccess: () => void) {
  const toast = useToast()
  const { createEmployee, updateEmployee, deleteEmployee } = useEmployees()

  async function submit(editingId: number | null, payload: EmployeeForm) {
    try {
      let response: apiResponse<any>

      if (editingId) {
        response = await updateEmployee(editingId, payload)
      } else {
        response = await createEmployee(payload)
      }

      toast.add({ title: response.messageAr, color: 'success' })
      onSuccess()
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  async function remove(id: number) {
    try {
      const response = await deleteEmployee(id)
      toast.add({ title: response.messageAr, color: 'success' })
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  return { submit, remove }
}
