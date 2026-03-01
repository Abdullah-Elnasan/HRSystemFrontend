<script setup lang="ts">
import { generateColumns } from '~/utils/generateColumns'
import type { OvertimeApproved, OvertimeApprovedForm } from '~/types/payrolls/overtimeApproved'
import { useOvertimeApproved } from '~/composables/overtimeApproved/useOvertimeApproved'
import { useOvertimeApprovedDrawer } from '~/composables/overtimeApproved/useOvertimeApprovedDrawer'
import { useOvertimeApprovedActions } from '~/composables/overtimeApproved/useOvertimeApprovedActions'

const UButton = resolveComponent('UButton')

definePageMeta({
  layout: 'dashboard',
  title:  'إدارة الوقت الإضافي المعتمد',
  keepalive: false,
})

/* ================== Data ================== */
const {
  records,
  pagination,
  loading,
  page,
  pageSize,
  search,
  setPage,
  setPageSize,
  setSearch,
  fetchRecords,
} = useOvertimeApproved()

/* ================== Drawer ================== */
const drawer = useOvertimeApprovedDrawer()

/* ================== Form Ref ================== */
const formRef = ref<{ submit: () => void } | null>(null)

/* ================== Actions ================== */
const { submit, remove } = useOvertimeApprovedActions(drawer.close)

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

const tableMeta = {
  class: {
    tr: () => 'bg-white dark:bg-gray-900 shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow',
  },
}

const statusLabels: Record<string, string> = {
  approved: 'معتمد',
  rejected: 'مرفوض',
}

// ─── Enhanced Data ────────────────────────────────────
const enhancedRecords = computed(() =>
  records.value?.map(r => ({
    ...r,
    employee_name:    r.employee.name,
    date_from:        r.period.from,
    date_to:          r.period.to,
    approved_by_name: r.approved_by.name,
    payroll_run_name: r.payroll?.name ?? '—',
    status_label:     statusLabels[r.status] ?? r.status,
  })) ?? []
)

const columns = computed(() =>
  enhancedRecords.value.length
    ? generateColumns<any>(
        enhancedRecords.value,
        {
          labels: {
            employee_name:         'الموظف',
            date_from:             'من تاريخ',
            date_to:               'إلى تاريخ',
            approved_minutes_time: 'الدقائق المعتمدة',
            rate_multiplier:       'معامل السعر',
            approved_by_name:      'معتمد من',
            status_label:          'الحالة',
            is_paid:               'حالة الدفع',
            payroll_run_name:      'دورة الرواتب',
            action:                'العمليات',
          },
          exclude: [
            'employee', 'created_at', 'payroll_run', 'payroll',
            'period', 'approved_by', 'status', 'approved_minutes',
          ],
          columns: {
            employee_name:    { filterable: true },
            date_from:        { type: 'date' },
            date_to:          { type: 'date' },
            rate_multiplier:  { type: 'number' },
            status_label:     { filterable: true },
            payroll_run_name: { filterable: true },
            action:           { hideable: false },
          },
        },
        UButton
      )
    : []
)

/* ================== Lifecycle ================== */
onMounted(() => fetchRecords())

watch(
  records,
  (val) => { if (val?.length) firstLoad.value = false },
  { immediate: true }
)

/* ================== Handlers ================== */
const onSubmit = (_value: Partial<OvertimeApprovedForm>) =>
  submit(drawer.editingId.value, { ...drawer.formModel })

function submitForm() {
  formRef.value?.submit()
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
    :data="enhancedRecords"
    :total="safePagination.total"
    :page="page"
    :page-sizes="PAGE_SIZES"
    :page-size="pageSize"
    :loading="loading"
    :meta="tableMeta"
    :sorting="sorting"
    :global-filter="search"
    :column-filters="columnFilters"
    :actions="{
      view:        false,
      copy:        false,
      edit:        { label: 'تعديل', icon: 'i-lucide-pen' },
      delete:      true,
      displayMode: 'dropdown',
    }"
    :btn-create="false"
    title-btn-create="إضافة وقت إضافي"
    title-btn-icon="lucide:clock-alert"
    title-btn-edit="تعديل وقت إضافي"
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
        <FormsPayrollOvertimeApprovedForm
          ref="formRef"
          v-model="drawer.formModel"
          :mode="drawer.mode.value"
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
