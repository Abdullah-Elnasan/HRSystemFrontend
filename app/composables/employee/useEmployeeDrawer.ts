import { isEmployeeRow } from '~/composables/employee/isEmployeeRow'
import { emptyEmployeeForm } from '~/types/employee'
import type { EmployeeForm } from '~/types/employee'

export function useEmployeeDrawer() {
  const isOpen    = ref(false)
  const title     = ref('')
  const editingId = ref<number | null>(null)
  const formModel = reactive<EmployeeForm>(emptyEmployeeForm())

  const mode = computed<'create' | 'edit'>(() =>
    editingId.value ? 'edit' : 'create'
  )

  function open(payload: { title: string; row?: unknown }) {
    ;(document.activeElement as HTMLElement)?.blur()

    title.value  = payload.title
    isOpen.value = true

    if (payload.row && isEmployeeRow(payload.row)) {
      editingId.value = payload.row.id

      const [first_name, ...rest] = (payload.row.full_name ?? '').split(' ')
      const last_name = rest.join(' ')

      Object.assign(formModel, {
        first_name,
        last_name,
        email:        payload.row.email,
        phone:        payload.row.phone,
        status:       payload.row.status,
        position:     payload.row.position,
        national_id:  payload.row.national_id,
        pin:          payload.row.pin,
        birth_date:   payload.row.birth_date,
        branch_id:    payload.row.branch?.id     ?? 0,
        user_group_id:payload.row.user_group?.id ?? 0,
        department_id:payload.row.department?.id ?? 0,
        image:        null,
      })
    } else {
      editingId.value = null
      Object.assign(formModel, emptyEmployeeForm())
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
