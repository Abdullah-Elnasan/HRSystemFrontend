import type { WorkScheduleAssignmentForm } from '~/types/workScheduleAssignments'
import type { apiResponse } from '~/types/table'
import { useWorkScheduleAssignments } from '~/composables/workScheduleAssignment/useWorkScheduleAssignments'
import { handleApiError } from '~/utils/handleApiError'

export function useWorkScheduleAssignmentActions(onSuccess: () => void) {
  const toast = useToast()
  const { createAssignment, updateAssignment, deleteAssignment } = useWorkScheduleAssignments()

  async function submit(editingId: number | null, formData: WorkScheduleAssignmentForm) {
    try {
      let response: apiResponse<any>

      if (editingId) {
        // عند التعديل: لا نرسل جهة الإسناد
        const { assignable_type, assignable_id, ...rest } = formData
        response = await updateAssignment(editingId, rest)
      } else {
        response = await createAssignment(formData)
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
