import type { OvertimePendingForm, OvertimePendingApiResponse } from '~/types/payrolls/overtimePending'
import { useOvertimePending } from '~/composables/overtimePending/useOvertimePending'
import { handleApiError } from '~/utils/handleApiError'

export function useOvertimePendingActions(onSuccess: () => void) {
  const toast = useToast()
  const { createRecord } = useOvertimePending()

  async function submit(payload: OvertimePendingForm) {
    try {
      const response: OvertimePendingApiResponse<any> = await createRecord(payload)
      toast.add({ title: response.messageAr, color: 'success' })
      onSuccess()
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  return { submit }
}
