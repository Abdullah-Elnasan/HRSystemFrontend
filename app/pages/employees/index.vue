<script setup lang="ts">
import { generateColumns } from '~/utils/generateColumns'
import type { Employee, EmployeeForm } from '~/types/employee'
import { useEmployees } from '~/composables/employee/useEmployees'
import { useEmployeeDrawer } from '~/composables/employee/useEmployeeDrawer'
import { useEmployeeActions } from '~/composables/employee/useEmployeeActions'

const UButton = resolveComponent('UButton')
const router  = useRouter()

definePageMeta({
  layout: 'dashboard',
  title: 'إدارة الموظفين',
  keepalive: false,
})

/* ================== Data ================== */
const {
  employees,
  pagination,
  loading,
  page,
  pageSize,
  search,
  setPage,
  setPageSize,
  setSearch,
  fetchEmployees,
} = useEmployees()

/* ================== Drawer ================== */
const drawer = useEmployeeDrawer()

/* ================== Form Ref ================== */
const formRef = ref<{ submit: () => void } | null>(null)

/* ================== Actions ================== */
const { submit, remove } = useEmployeeActions(drawer.close)

/* ================== Table ================== */
const PAGE_SIZES: number[] = [10, 50, 100]

const firstLoad     = ref(true)
const sorting       = ref<any[]>([])
const columnFilters = ref<any[]>([])

const safePagination = computed(() => ({
  total:        pagination.value?.total        ?? 0,
  per_page:     pagination.value?.per_page     ?? pageSize.value,
  current_page: pagination.value?.current_page ?? page.value,
  last_page:    pagination.value?.last_page    ?? 1,
}))

const statusMap: Record<string, { label: string; color: string }> = {
  active:   { label: 'نشط',      color: 'success' },
  inactive: { label: 'غير نشط',  color: 'error'   },
}

const tableMeta = {
  class: {
    tr: (row: any) =>
      row.original.status === 'inactive'
        ? 'bg-error/10'
        : 'bg-white dark:bg-gray-900 shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow',
  },
}

const columns = computed(() =>
  employees.value?.length
    ? generateColumns<Employee>(
        employees.value,
        {
          labels: {
            full_name:              'الاسم',
            email:                  'البريد الإلكتروني',
            status:                 'الحالة',
            branch:                 'الفرع',
            department:             'القسم',
            action:                 'العمليات',
            pin:                    'الرقم التعريفي',
            user_group:             'مجموعة المستخدمين',
            current_work_schedule:  'نظام الدوام الحالي',
            upcoming_work_schedule: 'نظام الدوام القادم',
            payroll_system:         'نظام الراتب',
          },
          exclude: [
            'national_id', 'position', 'image',
            'created_at', 'updated_at', 'first_name', 'last_name',
          ],
          columns: {
            email:                  { filterable: true, hidden: true },
            full_name:              { filterable: true, cell: ({ row }) => `${row.first_name} ${row.last_name}` },
            status:                 { type: 'status', cell: ({ getValue }) => getValue() },
            phone:                  { hidden: true },
            branch:                 { type: 'object', valueKey: 'name_ar' },
            current_work_schedule:  { type: 'object', valueKey: 'name_ar' },
            upcoming_work_schedule: { type: 'object', valueKey: 'name_ar' },
            payroll_system:         { type: 'object', valueKey: 'name'   },
            department:             { type: 'object', valueKey: 'name_ar' },
            user_group:             { type: 'object', valueKey: 'name_ar' },
            birth_date:             { hidden: true },
            action:                 { hideable: false },
          },
        },
        UButton
      )
    : []
)

/* ================== Lifecycle ================== */
onMounted(() => fetchEmployees())

watch(
  employees,
  (val) => { if (val?.length) firstLoad.value = false },
  { immediate: true }
)

/* ================== Handlers ================== */
const onSubmit = (_value: Partial<EmployeeForm>) =>
  submit(drawer.editingId.value, { ...drawer.formModel })

function submitForm() {
  formRef.value?.submit()
}

function goToAttendances(row: { id: number }) {
  router.push(`/attendances/${row.id}`)
}
</script>

<template>
  <!-- أول تحميل -->
  <div v-if="firstLoad && loading" class="flex items-center justify-center py-20">
    <span class="text-muted text-lg">جارٍ التحميل...</span>
  </div>

  <!-- الجدول -->
  <AppTable
    v-else
    :columns="columns"
    :data="employees ?? []"
    :total="safePagination.total"
    :page="page"
    :page-sizes="PAGE_SIZES"
    :page-size="pageSize"
    :loading="loading"
    :status-map="statusMap"
    :meta="tableMeta"
    :sorting="sorting"
    :global-filter="search"
    :column-filters="columnFilters"
    :btn-create="true"
    :row-clickable="true"
    :on-row-click="goToAttendances"
    title-btn-create="إضافة موظف"
    title-btn-icon="material-symbols:group-add-outline-rounded"
    title-btn-edit="تعديل موظف"
    @update:page="setPage"
    @update:page-size="setPageSize"
    @update:sorting="sorting = $event"
    @update:global-filter="setSearch"
    @update:column-filters="columnFilters = $event"
    @delete:row="remove"
    @drower:open="drawer.open"
    @update:data="drawer.open"
  />

  <!-- Drawer -->
  <ClientOnly>
    <UDrawer
      v-model:open="drawer.isOpen.value"
      direction="left"
      :title="drawer.title.value"
      :ui="{
        body:    'drower space-y-5 pt-0',
        header:  'hidden',
        title:   'text-primary',
        overlay: 'bg-green-400/30',
        content: 'shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] ps-2',
      }"
    >
      <template #body>
        <!-- Header -->
        <div class="flex items-center justify-end gap-2">
          <h2 class="text-highlighted font-semibold">{{ drawer.title.value }}</h2>
          <UIcon
            :name="drawer.mode.value === 'edit'
              ? 'solar:pen-new-round-linear'
              : 'ic:baseline-control-point-duplicate'"
            class="size-5"
          />
        </div>

        <!-- Form -->
        <FormsEmployeeForm
          ref="formRef"
          v-model="drawer.formModel"
          :mode="drawer.mode.value"
          :columns="2"
          class="min-w-150 items-start"
          @submit="onSubmit"
        />
      </template>

      <template #footer>
        <UButton
          label="إرسال"
          color="neutral"
          class="justify-center"
          @click="submitForm()"
        />
        <UButton
          label="إغلاق"
          color="neutral"
          variant="outline"
          class="justify-center"
          @click="drawer.close()"
        />
      </template>
    </UDrawer>
  </ClientOnly>
</template>

<style scoped>
.ring-default { --tw-ring-color: #00dc82 !important; }
</style>
