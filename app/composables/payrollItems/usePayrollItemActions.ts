import type { PayrollItemForm } from '~/types/payrolls/payrollItem'
import type { apiResponse } from '~/types/table'
import { usePayrollItems } from '~/composables/payrollItems/usePayrollItems'
import { handleApiError } from '~/utils/handleApiError'

export function usePayrollItemActions(onSuccess: () => void) {
  const toast = useToast()
  const { updateItem, deleteItem } = usePayrollItems()

  async function submit(editingId: number | null, payload: PayrollItemForm) {
    try {
      if (!editingId) return

      const response: apiResponse<any> = await updateItem(editingId, payload)
      toast.add({ title: response.messageAr, color: 'success' })
      onSuccess()
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  async function remove(id: number) {
    try {
      const response = await deleteItem(id)
      toast.add({ title: response.messageAr, color: 'success' })
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  return { submit, remove }
}
