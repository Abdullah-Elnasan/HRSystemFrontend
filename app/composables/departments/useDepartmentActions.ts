// E:\Nuxt\HR-System-Frontend\app\composables\departments\useDepartmentActions.ts
import type { DepartmentForm } from '~/types/deparment'
import type { apiResponse } from '~/types/table'
import { useDepartments } from '~/composables/departments/useDepartments'
import { handleApiError } from '~/utils/handleApiError'

export function useDepartmentActions(onSuccess: () => void) {
  const toast = useToast()
  const { createDepartment, updateDepartment, deleteDepartment } = useDepartments()

  // ─── Submit (Create / Update) ────────────────────────────
  async function submit(editingId: number | null, payload: DepartmentForm) {
    try {
      let response: apiResponse<any>

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
