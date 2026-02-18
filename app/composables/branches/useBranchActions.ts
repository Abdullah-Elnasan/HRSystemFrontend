import type { BranchForm } from '~/types/branch'
import type { apiResponse } from '~/types/table'
import { useBranches } from '~/composables/branches/useBranshes'
import { handleApiError } from '~/utils/handleApiError'

export function useBranchActions(onSuccess: () => void) {
  const toast = useToast()
  const { createBranch, updateBranch, deleteBranch } = useBranches()

  async function submit(editingId: number | null, payload: BranchForm) {
    try {
      let response: apiResponse<any>

      if (editingId) {
        response = await updateBranch(editingId, payload)
      } else {
        response = await createBranch(payload)
      }

      toast.add({ title: response.messageAr, color: 'success' })
      onSuccess()
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  async function remove(id: number) {
    try {
      const response = await deleteBranch(id)
      toast.add({ title: response.messageAr, color: 'success' })
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  return { submit, remove }
}
