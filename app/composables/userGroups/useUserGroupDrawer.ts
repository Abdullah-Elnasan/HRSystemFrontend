import { isUserGroupRow } from '~/composables/userGroups/isUserGroupRow'
import { emptyUserGroupForm } from '~/types/userGroups'
import type { UserGroupForm } from '~/types/userGroups'

export function useUserGroupDrawer() {
  const isOpen    = ref(false)
  const title     = ref('')
  const editingId = ref<number | null>(null)
  const formModel = reactive<UserGroupForm>(emptyUserGroupForm())

  const mode = computed<'create' | 'edit'>(() =>
    editingId.value ? 'edit' : 'create'
  )

  function open(payload: { title: string; row?: unknown }) {
    ;(document.activeElement as HTMLElement)?.blur()

    title.value  = payload.title
    isOpen.value = true

    if (payload.row && isUserGroupRow(payload.row)) {
      editingId.value = payload.row.id
      Object.assign(formModel, {
        name_ar:        payload.row.name_ar,
        name_en:        payload.row.name_en,
        description_ar: payload.row.description_ar ?? '',
        description_en: payload.row.description_en ?? '',
      })
    } else {
      editingId.value = null
      Object.assign(formModel, emptyUserGroupForm())
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
