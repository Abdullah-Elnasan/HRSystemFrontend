import type { PayrollSystemForm } from '~/types/payrollSystem'
import type {apiResponse} from '~/types/table';
import { usePayrollSystems } from '~/composables/payrollSystem/usePayrollSystems'
import { handleApiError } from '~/utils/handleApiError'

export function usePayrollSystemActions(onSuccess: () => void) {
  const toast = useToast()
  const { createPayrollSystem, updatePayrollSystem, deletePayrollSystem } = usePayrollSystems()

  async function submit(editingId: number | null, payload: PayrollSystemForm) {
    try {
      let response: apiResponse<any>

      if (editingId) {
        response = await updatePayrollSystem(editingId, payload)
      } else {
        response = await createPayrollSystem(payload)
      }

      toast.add({ title: response.messageAr, color: 'success' })
      onSuccess()
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  async function remove(id: number) {
    try {
      const response = await deletePayrollSystem(id)
      toast.add({ title: response.messageAr, color: 'success' })
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  return { submit, remove }
}
