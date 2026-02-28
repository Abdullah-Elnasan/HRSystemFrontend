import { isPayrollSystemRow } from '~/composables/payrollSystem/isPayrollSystemRow'
import { emptyPayrollSystemForm } from '~/types/payrollSystem'
import type { PayrollSystemForm } from '~/types/payrollSystem'

export function usePayrollSystemDrawer() {
  const isOpen    = ref(false)
  const title     = ref('')
  const editingId = ref<number | null>(null)
  const formModel = reactive<PayrollSystemForm>(emptyPayrollSystemForm())

  const mode = computed<'create' | 'edit'>(() =>
    editingId.value ? 'edit' : 'create'
  )

  function open(payload: { title: string; row?: unknown }) {
    ;(document.activeElement as HTMLElement)?.blur()

    title.value  = payload.title
    isOpen.value = true

    if (payload.row && isPayrollSystemRow(payload.row)) {
      editingId.value = payload.row.id
      Object.assign(formModel, {
        name:                payload.row.name,
        salary_type:         payload.row.salary_type,
        monthly_salary:      payload.row.monthly_salary,
        hourly_rate:         payload.row.hourly_rate,
        overtime_base_rate:  payload.row.overtime_base_rate,
        deduct_missing_time: payload.row.deduct_missing_time,
        is_active:           payload.row.is_active,
        currency:            payload.row.currency,
      })
    } else {
      editingId.value = null
      Object.assign(formModel, emptyPayrollSystemForm())
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
