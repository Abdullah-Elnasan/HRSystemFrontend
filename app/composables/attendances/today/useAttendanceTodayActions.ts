import type { apiResponse } from '~/types/table'
import { useAttendanceToday } from '~/composables/attendances/today/useAttendancesToday'
import { handleApiError } from '~/utils/handleApiError'

export function useAttendanceTodayActions() {
  const toast = useToast()
  const { deleteRecord } = useAttendanceToday()

  async function remove(id: number) {
    try {
      const response = await deleteRecord(id)
      toast.add({ title: response.messageAr, color: 'success' })
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  return { remove }
}
