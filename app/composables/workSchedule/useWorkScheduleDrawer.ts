import { isWorkScheduleRow } from '~/composables/workSchedule/isWorkScheduleRow'
import { emptyWorkScheduleForm, transformScheduleToForm } from '~/types/workSchedule'
import type { WorkScheduleForm } from '~/types/workSchedule'

export function useWorkScheduleDrawer() {
  const isOpen    = ref(false)
  const title     = ref('')
  const editingId = ref<number | null>(null)
  const formModel = reactive<WorkScheduleForm>(emptyWorkScheduleForm())

  const mode = computed<'create' | 'edit'>(() =>
    editingId.value ? 'edit' : 'create'
  )

  function open(payload: { title: string; row?: unknown }) {
    ;(document.activeElement as HTMLElement)?.blur()

    title.value  = payload.title
    isOpen.value = true

    if (payload.row && isWorkScheduleRow(payload.row)) {
      editingId.value = payload.row.id
      Object.assign(formModel, transformScheduleToForm(payload.row))
    } else {
      editingId.value = null
      Object.assign(formModel, emptyWorkScheduleForm())
    }
  }

  function close() {
    isOpen.value = false
    setTimeout(() => {
      editingId.value = null
      Object.assign(formModel, emptyWorkScheduleForm())
    }, 300)
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
