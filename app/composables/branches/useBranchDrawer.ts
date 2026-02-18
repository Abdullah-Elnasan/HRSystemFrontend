import { isBranchRow } from '~/composables/branches/isBranchRow'
import { emptyBranchForm } from '~/types/branch'
import type { BranchForm } from '~/types/branch'

export function useBranchDrawer() {
  const isOpen    = ref(false)
  const title     = ref('')
  const editingId = ref<number | null>(null)
  const formModel = reactive<BranchForm>(emptyBranchForm())

  const mode = computed<'create' | 'edit'>(() =>
    editingId.value ? 'edit' : 'create'
  )

  function open(payload: { title: string; row?: unknown }) {
    ;(document.activeElement as HTMLElement)?.blur()

    title.value  = payload.title
    isOpen.value = true

    if (payload.row && isBranchRow(payload.row)) {
      editingId.value = payload.row.id
      Object.assign(formModel, {
        name_ar:        payload.row.name_ar,
        name_en:        payload.row.name_en,
        description_ar: payload.row.description_ar ?? '',
        description_en: payload.row.description_en ?? '',
        location_ar:    payload.row.location_ar    ?? '',
        location_en:    payload.row.location_en    ?? '',
      })
    } else {
      editingId.value = null
      Object.assign(formModel, emptyBranchForm())
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
