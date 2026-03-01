<script setup lang="ts">
import { generateColumns } from '~/utils/generateColumns'
import type { OvertimePending, OvertimePendingForm } from '~/types/payrolls/overtimePending'
import { useOvertimePending } from '~/composables/overtimePending/useOvertimePending'
import { useOvertimePendingDrawer } from '~/composables/overtimePending/useOvertimePendingDrawer'
import { useOvertimePendingActions } from '~/composables/overtimePending/useOvertimePendingActions'

const UButton = resolveComponent('UButton')

definePageMeta({
  layout: 'dashboard',
  title:  'إدارة الوقت الإضافي المعلق',
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
} = useOvertimePending()

/* ================== Drawer ================== */
const drawer = useOvertimePendingDrawer()

/* ================== Form Ref ================== */
const formRef = ref<{ submit: () => void } | null>(null)

/* ================== Actions ================== */
const { submit } = useOvertimePendingActions(drawer.close)

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

const enhancedRecords = computed(() => records.value ?? [])

const columns = computed(() =>
  enhancedRecords.value.length
    ? generateColumns<any>(
        enhancedRecords.value,
        {
          labels: {
            employee_name:        'الموظف',
            suggested_date_from:  'من تاريخ',
            suggested_date_to:    'إلى تاريخ',
            actual_minutes:       'الدقائق',
            last_settlement_date: 'آخر اعتماد',
            action:               'العمليات',
          },
          exclude: ['employee_id', 'department_id'],
          columns: {
            employee_name:        { filterable: true },
            suggested_date_from:  { type: 'date' },
            suggested_date_to:    { type: 'date' },
            last_settlement_date: { type: 'date' },
            action:               { hideable: false },
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
const onSubmit = (_value: Partial<OvertimePendingForm>) =>
  submit({ ...drawer.formModel })

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
      edit:        { label: 'اعتماد', icon: 'i-lucide-pen' },
      delete:      false,
      displayMode: 'inline',
    }"
    title-btn-create="إضافة وقت إضافي"
    title-btn-icon="lucide:clock-alert"
    title-btn-edit="اعتماد وقت إضافي"
    @update:page="setPage"
    @update:page-size="setPageSize"
    @update:sorting="sorting = $event"
    @update:global-filter="setSearch"
    @update:column-filters="columnFilters = $event"
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
            name="solar:pen-new-round-linear"
            class="size-5"
          />
        </div>

        <!-- Form -->
        <FormsPayrollOvertimePendingForm
          ref="formRef"
          v-model="drawer.formModel"
          :mode="drawer.mode.value"
          class="min-w-150 items-start"
          @submit="onSubmit"
        />
      </template>

      <template #footer>
        <UButton
          label="اعتماد"
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
