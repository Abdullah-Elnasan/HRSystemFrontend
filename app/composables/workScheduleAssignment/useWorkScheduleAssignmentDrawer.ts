import { isWorkScheduleAssignmentRow } from '~/composables/workScheduleAssignment/isWorkScheduleAssignmentRow'
import { emptyWorkScheduleAssignmentForm } from '~/types/workScheduleAssignments'
import type { WorkScheduleAssignmentForm } from '~/types/workScheduleAssignments'

export function useWorkScheduleAssignmentDrawer() {
  const isOpen    = ref(false)
  const title     = ref('')
  const editingId = ref<number | null>(null)
  const formModel = reactive<WorkScheduleAssignmentForm>(emptyWorkScheduleAssignmentForm())

  const mode = computed<'create' | 'edit'>(() =>
    editingId.value ? 'edit' : 'create'
  )

  function open(payload: { title: string; row?: unknown }) {
    ;(document.activeElement as HTMLElement)?.blur()

    title.value  = payload.title
    isOpen.value = true

    if (payload.row && isWorkScheduleAssignmentRow(payload.row)) {
      editingId.value = payload.row.id
      Object.assign(formModel, {
        assignable_type:  payload.row.assignable.type,
        assignable_id:    payload.row.assignable.id,
        work_schedule_id: payload.row.work_schedule.id,
        starts_at:        payload.row.starts_at ?? null,
        ends_at:          payload.row.ends_at   ?? null,
      })
    } else {
      editingId.value = null
      Object.assign(formModel, emptyWorkScheduleAssignmentForm())
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
