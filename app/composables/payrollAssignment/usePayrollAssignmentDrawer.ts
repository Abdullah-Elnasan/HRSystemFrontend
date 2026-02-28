import { isPayrollAssignmentRow } from '~/composables/payrollAssignment/isPayrollAssignmentRow'
import { emptyPayrollAssignmentForm } from '~/types/payrollAssignments'
import type { PayrollAssignmentForm } from '~/types/payrollAssignments'

export function usePayrollAssignmentDrawer() {
  const isOpen    = ref(false)
  const title     = ref('')
  const editingId = ref<number | null>(null)
  const formModel = reactive<PayrollAssignmentForm>(emptyPayrollAssignmentForm())

  const mode = computed<'create' | 'edit'>(() =>
    editingId.value ? 'edit' : 'create'
  )

  function open(payload: { title: string; row?: unknown }) {
    ;(document.activeElement as HTMLElement)?.blur()

    title.value  = payload.title
    isOpen.value = true

    if (payload.row && isPayrollAssignmentRow(payload.row)) {
      editingId.value = payload.row.id
      Object.assign(formModel, {
        assignable_type:   payload.row.assignable.type,
        assignable_id:     payload.row.assignable.id,
        payroll_system_id: payload.row.payroll_system.id,
        effective_from:    payload.row.effective_from ?? null,
        effective_to:      payload.row.effective_to   ?? null,
      })
    } else {
      editingId.value = null
      Object.assign(formModel, emptyPayrollAssignmentForm())
    }
  }

  function close() {
    isOpen.value = false
  }

  return {
    isOpen,
    title,
    editingId,
    mode,
    formModel,
    open,
    close,
  }
}
