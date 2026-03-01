import { isPayrollItemRow } from '~/composables/payrollItems/isPayrollItemRow'
import { emptyPayrollItemForm } from '~/types/payrolls/payrollItem'
import type { PayrollItemForm } from '~/types/payrolls/payrollItem'

export function usePayrollItemDrawer() {
  const isOpen    = ref(false)
  const title     = ref('')
  const editingId = ref<number | null>(null)
  const formModel = reactive<PayrollItemForm>(emptyPayrollItemForm())

  const mode = computed<'create' | 'edit'>(() =>
    editingId.value ? 'edit' : 'create'
  )

  function open(payload: { title: string; row?: unknown }) {
    ;(document.activeElement as HTMLElement)?.blur()

    title.value  = payload.title
    isOpen.value = true

    if (payload.row && isPayrollItemRow(payload.row)) {
      editingId.value = payload.row.id
      Object.assign(formModel, {
        payroll_run_id:    payload.row.payroll_run_id,
        employee_id:       payload.row.employee.id,
        period_start:      payload.row.period_start      ?? null,
        period_end:        payload.row.period_end        ?? null,
        base_amount:       payload.row.base_amount,
        overtime_amount:   payload.row.overtime_amount,
        currency:          payload.row.currency,
        manual_adjustment: payload.row.manual_adjustment,
        adjustment_note:   payload.row.adjustment_note   ?? '',
        total_amount:      payload.row.total_amount,
      })
    } else {
      editingId.value = null
      Object.assign(formModel, emptyPayrollItemForm())
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
