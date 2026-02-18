import type { WorkScheduleForm, WorkSchedulePayload } from '~/types/workSchedule'
import type { apiResponse } from '~/types/table'
import { transformFormToPayload } from '~/types/workSchedule'
import { useWorkSchedules } from '~/composables/workSchedule/useWorkSchedules'
import { handleApiError } from '~/utils/handleApiError'

export function useWorkScheduleActions(onSuccess: () => void) {
  const toast = useToast()
  const { createWorkSchedule, updateWorkSchedule, deleteWorkSchedule } = useWorkSchedules()

  async function submit(editingId: number | null, formData: WorkScheduleForm) {
    try {
      const payload = transformFormToPayload(formData)
      let response: apiResponse<any>

      if (editingId) {
        response = await updateWorkSchedule(editingId, payload)
      } else {
        response = await createWorkSchedule(payload)
      }

      toast.add({ title: response.messageAr, color: 'success' })
      onSuccess()
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  async function remove(id: number) {
    try {
      const response = await deleteWorkSchedule(id)
      toast.add({ title: response.messageAr, color: 'success' })
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  return { submit, remove }
}
