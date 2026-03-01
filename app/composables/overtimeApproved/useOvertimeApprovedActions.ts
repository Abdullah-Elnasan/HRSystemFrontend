import type { OvertimeApprovedForm, OvertimeApprovedApiResponse } from '~/types/payrolls/overtimeApproved'
import { useOvertimeApproved } from '~/composables/overtimeApproved/useOvertimeApproved'
import { handleApiError } from '~/utils/handleApiError'

export function useOvertimeApprovedActions(onSuccess: () => void) {
  const toast = useToast()
  const { updateRecord, deleteRecord } = useOvertimeApproved()

  async function submit(editingId: number | null, payload: OvertimeApprovedForm) {
    try {
      if (!editingId) return

      const response: OvertimeApprovedApiResponse<any> = await updateRecord(editingId, payload)
      toast.add({ title: response.messageAr, color: 'success' })
      onSuccess()
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  async function remove(id: number) {
    try {
      const response = await deleteRecord(id)
      toast.add({ title: response.messageAr, color: 'success' })
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  return { submit, remove }
}
