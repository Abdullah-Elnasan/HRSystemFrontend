import { isDepartmentRow } from '~/composables/departments/isDepartmentRow'
import { emptyDepartmentForm } from '~/types/deparment'
import type { DepartmentForm } from '~/types/deparment'

export function useDepartmentDrawer() {
  const isOpen    = ref(false)
  const title     = ref('')
  const editingId = ref<number | null>(null)
  const formModel = reactive<DepartmentForm>(emptyDepartmentForm())

  const mode = computed<'create' | 'edit'>(() =>
    editingId.value ? 'edit' : 'create'
  )

  function open(payload: { title: string; row?: unknown }) {
    ;(document.activeElement as HTMLElement)?.blur()

    title.value  = payload.title
    isOpen.value = true

    if (payload.row && isDepartmentRow(payload.row)) {
      editingId.value = payload.row.id
      Object.assign(formModel, {
        name_ar:        payload.row.name_ar,
        name_en:        payload.row.name_en,
        description_ar: payload.row.description_ar ?? '',
        description_en: payload.row.description_en ?? '',
      })
    } else {
      editingId.value = null
      Object.assign(formModel, emptyDepartmentForm())
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
