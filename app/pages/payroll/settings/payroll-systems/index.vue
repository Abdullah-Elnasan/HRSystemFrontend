<script setup lang="ts">
import { generateColumns } from '~/utils/generateColumns'
import type { PayrollSystem, PayrollSystemForm } from '~/types/payrollSystem'
import { usePayrollSystems } from '~/composables/payrollSystem/usePayrollSystems'
import { usePayrollSystemDrawer } from '~/composables/payrollSystem/usePayrollSystemDrawer'
import { usePayrollSystemActions } from '~/composables/payrollSystem/usePayrollSystemActions'

const UButton = resolveComponent('UButton')

definePageMeta({
  layout: 'dashboard',
  title:  'إدارة أنظمة الرواتب',
  keepalive: false,
})

/* ================== Data ================== */
const {
  payrollSystems,
  pagination,
  loading,
  page,
  pageSize,
  search,
  setPage,
  setPageSize,
  setSearch,
  fetchPayrollSystems,
} = usePayrollSystems()

/* ================== Drawer ================== */
const drawer = usePayrollSystemDrawer()

/* ================== Form Ref ================== */
const formRef = ref<{ submit: () => void } | null>(null)

/* ================== Actions ================== */
const { submit, remove } = usePayrollSystemActions(drawer.close)

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
const enhancedPayrollSystems = computed(() =>
  payrollSystems.value?.map(s => ({
    ...s,
    salary_type_label: s.salary_type === 'monthly' ? 'شهري' : 'بالساعة',
    status_label:      s.is_active          ? 'نشط'  : 'غير نشط',
    deduct_label:      s.deduct_missing_time ? 'نعم'  : 'لا',
  })) ?? []
)

const columns = computed(() =>
  enhancedPayrollSystems.value.length
    ? generateColumns<any>(
        enhancedPayrollSystems.value,
        {
          labels: {
            name:               'الاسم',
            salary_type_label:  'نوع الراتب',
            monthly_salary:     'الراتب الشهري',
            hourly_rate:        'الأجر بالساعة',
            overtime_base_rate: 'معامل الوقت الإضافي',
            deduct_label:       'خصم الوقت المفقود',
            status_label:       'الحالة',
            currency:           'العملة',
            action:             'العمليات',
          },
          exclude: [
            'salary_type', 'deduct_missing_time', 'is_active',
            'created_at', 'updated_at',
          ],
          columns: {
            name:               { filterable: true },
            salary_type_label:  { filterable: true },
            monthly_salary:     { type: 'number' },
            hourly_rate:        { type: 'number' },
            overtime_base_rate: { type: 'number' },
            status_label:       { filterable: true },
            currency:           { filterable: true },
            action:             { hideable: false },
          },
        },
        UButton
      )
    : []
)

/* ================== Lifecycle ================== */
onMounted(() => fetchPayrollSystems())

watch(
  payrollSystems,
  (val) => { if (val?.length) firstLoad.value = false },
  { immediate: true }
)

/* ================== Handlers ================== */
const onSubmit = (_value: Partial<PayrollSystemForm>) =>
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
    :data="enhancedPayrollSystems"
    :total="safePagination.total"
    :page="page"
    :page-sizes="PAGE_SIZES"
    :page-size="pageSize"
    :loading="loading"
    :meta="tableMeta"
    :sorting="sorting"
    :global-filter="search"
    :column-filters="columnFilters"
    title-btn-create="إضافة نظام رواتب"
    title-btn-icon="lucide:wallet"
    title-btn-edit="تعديل نظام رواتب"
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
        <FormsPayrollSystemForm
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
