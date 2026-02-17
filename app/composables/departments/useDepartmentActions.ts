import type { DepartmentForm, DepartmentApiResponse } from '~/types/deparment'
import { useDepartments } from '~/composables/departments/useDepartments'
import { handleApiError } from '~/utils/handleApiError'

export function useDepartmentActions(onSuccess: () => void) {
  const toast = useToast()
  const { createDepartment, updateDepartment, deleteDepartment } = useDepartments()

  // ─── Submit (Create / Update) ────────────────────────────
  async function submit(editingId: number | null, payload: DepartmentForm) {
    try {
      let response: DepartmentApiResponse<any>

      if (editingId) {
        response = await updateDepartment(editingId, payload)
      } else {
        response = await createDepartment(payload)
      }

      toast.add({ title: response.messageAr, color: 'success' })
      onSuccess()
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  // ─── Delete ──────────────────────────────────────────────
  async function remove(id: number) {
    try {
      const response = await deleteDepartment(id)
      toast.add({ title: response.messageAr, color: 'success' })
    } catch (err) {
      handleApiError(err, toast)
    }
  }

  return { submit, remove }
}
