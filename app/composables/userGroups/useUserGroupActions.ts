import type { UserGroupForm } from '~/types/userGroups'
import type { apiResponse } from '~/types/table'
import { useUserGroup } from '~/composables/userGroups/useUserGroups'
import { handleApiError } from '~/utils/handleApiError'

export function useUserGroupActions(onSuccess: () => void) {
  const toast = useToast()
  const { createUserGroup, updateUserGroup, deleteUserGroup } = useUserGroup()

  async function submit(editingId: number | null, payload: UserGroupForm) {
    try {
      let response: apiResponse<any>

      if (editingId) {
        response = await updateUserGroup(editingId, payload)
      } else {
        response = await createUserGroup(payload)
      }

      toast.add({ title: response.messageAr, color: 'success' })
      onSuccess()
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  async function remove(id: number) {
    try {
      const response = await deleteUserGroup(id)
      toast.add({ title: response.messageAr, color: 'success' })
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  return { submit, remove }
}
