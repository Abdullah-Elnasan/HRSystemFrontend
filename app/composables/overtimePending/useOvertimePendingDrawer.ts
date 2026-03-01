import { isOvertimePendingRow } from '~/composables/overtimePending/isOvertimePendingRow'
import { emptyOvertimePendingForm } from '~/types/payrolls/overtimePending'
import type { OvertimePendingForm } from '~/types/payrolls/overtimePending'

export function useOvertimePendingDrawer() {
  const isOpen    = ref(false)
  const title     = ref('')
  const editingId = ref<number | null>(null)
  const formModel = reactive<OvertimePendingForm>(emptyOvertimePendingForm())

  const mode = computed<'create' | 'edit'>(() =>
    editingId.value ? 'edit' : 'create'
  )

  function open(payload: { title: string; row?: unknown }) {
    ;(document.activeElement as HTMLElement)?.blur()

    title.value  = payload.title
    isOpen.value = true

    if (payload.row && isOvertimePendingRow(payload.row)) {
      // هذا النموذج للاعتماد فقط — لا يوجد editingId
      editingId.value = null
      Object.assign(formModel, {
        employee_id:      payload.row.employee_id,
        employee_name:    payload.row.employee_name,
        date_from:        payload.row.suggested_date_from ?? null,
        date_to:          payload.row.suggested_date_to   ?? null,
        approved_minutes: payload.row.approved_minutes,
        rate_multiplier:  payload.row.rate_multiplier,
      })
    } else {
      editingId.value = null
      Object.assign(formModel, emptyOvertimePendingForm())
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
