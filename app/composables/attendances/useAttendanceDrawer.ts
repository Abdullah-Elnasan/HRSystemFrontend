import { isAttendanceRow } from '~/composables/attendances/isAttendanceRow'
import { emptyAttendanceForm } from '~/types/attendance'
import type { AttendanceForm } from '~/types/attendance'

export function useAttendanceDrawer() {
  const isOpen    = ref(false)
  const title     = ref('')
  const editingId = ref<number | null>(null)
  const formModel = reactive<AttendanceForm>(emptyAttendanceForm())

  const mode = computed<'create' | 'edit'>(() =>
    editingId.value ? 'edit' : 'create'
  )

  function open(payload: { title: string; row?: unknown }) {
    ;(document.activeElement as HTMLElement)?.blur()

    title.value  = payload.title
    isOpen.value = true

    if (payload.row && isAttendanceRow(payload.row)) {
      editingId.value = payload.row.id
      Object.assign(formModel, {
        employee_id:         payload.row.employee.id,
        date:                payload.row.date              ?? null,
        check_in:            payload.row.check_in          ?? null,
        check_out:           payload.row.check_out         ?? null,
        work_minutes:        payload.row.work_minutes,
        required_minutes:    payload.row.required_minutes,
        overtime_minutes:    payload.row.overtime_minutes,
        attendance_status:   payload.row.attendance_status,
        late_minutes:        payload.row.late_minutes,
        early_leave_minutes: payload.row.early_leave_minutes,
        is_late:             payload.row.is_late,
        is_early_leave:      payload.row.is_early_leave,
        status:              payload.row.status,
      })
    } else {
      editingId.value = null
      Object.assign(formModel, emptyAttendanceForm())
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
