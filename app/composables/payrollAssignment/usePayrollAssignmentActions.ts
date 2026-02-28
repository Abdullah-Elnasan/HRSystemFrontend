import type { PayrollAssignmentForm } from '~/types/payrollAssignments'
import type {apiResponse} from '~/types/table';
import { usePayrollAssignments } from '~/composables/payrollAssignment/usePayrollAssignments'
import { handleApiError } from '~/utils/handleApiError'

export function usePayrollAssignmentActions(onSuccess: () => void) {
  const toast = useToast()
  const { createAssignment, updateAssignment, deleteAssignment } = usePayrollAssignments()

  async function submit(editingId: number | null, payload: PayrollAssignmentForm) {
    try {
      let response: apiResponse<any>

      if (editingId) {
        // حذف الحقول غير القابلة للتعديل
        const { assignable_type, assignable_id, ...editPayload } = payload
        response = await updateAssignment(editingId, editPayload)
      } else {
        response = await createAssignment(payload)
      }

      toast.add({ title: response.messageAr, color: 'success' })
      onSuccess()
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  async function remove(id: number) {
    try {
      const response = await deleteAssignment(id)
      toast.add({ title: response.messageAr, color: 'success' })
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  return { submit, remove }
}
