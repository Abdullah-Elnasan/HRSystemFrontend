<script setup lang="ts">
import { generateColumns } from '~/utils/generateColumns'
import type { PayrollItem, PayrollItemForm } from '~/types/payrolls/payrollItem'
import { usePayrollItems } from '~/composables/payrollItems/usePayrollItems'
import { usePayrollItemDrawer } from '~/composables/payrollItems/usePayrollItemDrawer'
import { usePayrollItemActions } from '~/composables/payrollItems/usePayrollItemActions'

const UButton = resolveComponent('UButton')

definePageMeta({
  layout: 'dashboard',
  title:  'إدارة سجلات الرواتب',
  keepalive: false,
})

/* ================== Data ================== */
const {
  items,
  pagination,
  loading,
  page,
  pageSize,
  search,
  setPage,
  setPageSize,
  setSearch,
  fetchItems,
} = usePayrollItems()

/* ================== Drawer ================== */
const drawer = usePayrollItemDrawer()

/* ================== Form Ref ================== */
const formRef = ref<{ submit: () => void } | null>(null)

/* ================== Actions ================== */
const { submit, remove } = usePayrollItemActions(drawer.close)

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

// ─── Enhanced Data ────────────────────────────────────
const enhancedItems = computed(() =>
  items.value?.map(item => ({
    ...item,
    employee_name: item.employee.full_name,
  })) ?? []
)

const columns = computed(() =>
  enhancedItems.value.length
    ? generateColumns<any>(
        enhancedItems.value,
        {
          labels: {
            payroll_run_name:  'دورة الرواتب',
            id:                'ID',
            employee_name:     'الموظف',
            period_start:      'بداية الفترة',
            period_end:        'نهاية الفترة',
            base_amount:       'المبلغ الأساسي',
            status:            'حالة الاعتماد',
            overtime_amount:   'مبلغ العمل الإضافي',
            currency:          'العملة',
            manual_adjustment: 'التعديل اليدوي',
            adjustment_note:   'ملاحظة التعديل',
            total_amount:      'المبلغ الإجمالي',
            action:            'العمليات',
          },
          exclude: [
            'payroll_run_id', 'payroll_run', 'employee',
            'updated_at', 'created_at', 'employee_id',
          ],
          columns: {
            payroll_run_name:  { filterable: true },
            employee_name:     { filterable: true },
            period_start:      { type: 'date' },
            period_end:        { type: 'date' },
            base_amount:       { type: 'number' },
            overtime_amount:   { type: 'number' },
            currency:          { filterable: true },
            manual_adjustment: { type: 'number' },
            adjustment_note:   { hidden: true },
            total_amount:      { type: 'number' },
            action:            { hideable: false },
          },
        },
        UButton
      )
    : []
)

/* ================== Lifecycle ================== */
onMounted(() => fetchItems())

watch(
  items,
  (val) => { if (val?.length) firstLoad.value = false },
  { immediate: true }
)

/* ================== Handlers ================== */
const onSubmit = (_value: Partial<PayrollItemForm>) =>
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
    :data="enhancedItems"
    :total="safePagination.total"
    :page="page"
    :page-sizes="PAGE_SIZES"
    :page-size="pageSize"
    :loading="loading"
    :meta="tableMeta"
    :sorting="sorting"
    :global-filter="search"
    :column-filters="columnFilters"
    :actions="{ copy: false, view: false, delete: false, edit: { label: 'منح أو خصم يدوي' }, displayMode: 'inline' }"
    :btn-create="false"
    title-btn-create="إضافة سجل راتب"
    title-btn-icon="lucide:receipt-text"
    title-btn-edit="تعديل سجل راتب"
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
        <FormsPayrollItemsForm
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
