import type { AttendanceForm, AttendanceApiResponse } from '~/types/attendance'
import { useAttendance } from '~/composables/attendances/useAttendance'
import { handleApiError } from '~/utils/handleApiError'

export function useAttendanceActions(onSuccess: () => void) {
  const toast = useToast()
  const { createRecord, updateRecord, deleteRecord } = useAttendance()

  async function submit(editingId: number | null, payload: AttendanceForm) {
    try {
      let response: AttendanceApiResponse<any>

      if (editingId) {
        response = await updateRecord(editingId, payload)
      } else {
        response = await createRecord(payload)
      }

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
