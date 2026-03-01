import { isOvertimeApprovedRow } from '~/composables/overtimeApproved/isOvertimeApprovedRow'
import { emptyOvertimeApprovedForm } from '~/types/payrolls/overtimeApproved'
import type { OvertimeApprovedForm } from '~/types/payrolls/overtimeApproved'

export function useOvertimeApprovedDrawer() {
  const isOpen    = ref(false)
  const title     = ref('')
  const editingId = ref<number | null>(null)
  const formModel = reactive<OvertimeApprovedForm>(emptyOvertimeApprovedForm())

  const mode = computed<'create' | 'edit'>(() =>
    editingId.value ? 'edit' : 'create'
  )

  function open(payload: { title: string; row?: unknown }) {
    ;(document.activeElement as HTMLElement)?.blur()

    title.value  = payload.title
    isOpen.value = true

    if (payload.row && isOvertimeApprovedRow(payload.row)) {
      editingId.value = payload.row.id
      Object.assign(formModel, {
        employee_name:    payload.row.employee.name,
        approved_minutes: payload.row.approved_minutes,
        rate_multiplier:  payload.row.rate_multiplier,
      })
    } else {
      editingId.value = null
      Object.assign(formModel, emptyOvertimeApprovedForm())
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
