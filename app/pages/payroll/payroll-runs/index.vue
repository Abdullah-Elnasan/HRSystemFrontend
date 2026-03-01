<script setup lang="ts">
import { generateColumns } from '~/utils/generateColumns'
import type { PayrollRun, PayrollRunForm } from '~/types/payrolls/payrollRun'
import { usePayrollRuns } from '~/composables/payrollRuns/usePayrollRuns'
import { isPayrollRunRow } from '~/composables/payrollRuns/isPayrollRunRow'
import { handleApiError } from '~/utils/handleApiError'

const UButton = resolveComponent('UButton')
const router  = useRouter()
const toast   = useToast()

definePageMeta({
  layout: 'dashboard',
  title:  'إدارة دورات الرواتب',
  keepalive: false,
})

/* ================== Data ================== */
const {
  runs,
  pagination,
  loading,
  page,
  pageSize,
  search,
  setPage,
  setPageSize,
  setSearch,
  fetchRuns,
  aprooveRun,
} = usePayrollRuns()

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
  draft:      'مسودة',
  processing: 'قيد المعالجة',
  approved:   'معتمد',
  paid:       'مدفوع',
  cancelled:  'ملغي',
}

// ─── Enhanced Data ────────────────────────────────────
const enhancedRuns = computed(() =>
  runs.value?.map(run => ({
    ...run,
    status_label: statusLabels[run.status] ?? run.status,
  })) ?? []
)

const columns = computed(() =>
  enhancedRuns.value.length
    ? generateColumns<any>(
        enhancedRuns.value,
        {
          labels: {
            period_start:          'بداية الفترة',
            period_end:            'نهاية الفترة',
            status_label:          'الحالة',
            approved_by:           'معتمد من (ID)',
            approved_by_name:      'اسم المعتمد',
            payroll_run_name:      'اسم الدورة',
            is_ready_for_approval: 'إمكانية الاعتماد',
            approved_at:           'تاريخ الاعتماد',
            action:                'العمليات',
          },
          exclude: ['approved_by', 'status', 'created_at', 'updated_at'],
          columns: {
            period_start:     { type: 'date' },
            period_end:       { type: 'date' },
            status_label:     { filterable: true },
            approved_by_name: { filterable: true },
            approved_at:      { type: 'date' },
            action:           { hideable: false },
          },
        },
        UButton
      )
    : []
)

/* ================== Lifecycle ================== */
onMounted(() => fetchRuns())

watch(
  runs,
  (val) => { if (val?.length) firstLoad.value = false },
  { immediate: true }
)

/* ================== Handlers ================== */
async function onUpdateData(payload: { title: string; row?: unknown }) {
  if (!payload.row || !isPayrollRunRow(payload.row)) return

  try {
    const form: PayrollRunForm = {
      period_start: payload.row.period_start,
      period_end:   payload.row.period_end,
    }
    const response = await aprooveRun(form)
    toast.add({ title: response.messageAr, color: 'success' })
  } catch (err) {
    handleApiError(err, toast)
  }
}

function goToRun(row: { id: number }) {
  router.push(`/payroll/payroll-runs/${row.id}`)
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
    :data="enhancedRuns"
    :total="safePagination.total"
    :page="page"
    :page-sizes="PAGE_SIZES"
    :page-size="pageSize"
    :loading="loading"
    :meta="tableMeta"
    :sorting="sorting"
    :global-filter="search"
    :column-filters="columnFilters"
    :row-clickable="true"
    :on-row-click="goToRun"
    :actions="{
      view:        false,
      copy:        false,
      edit:        { label: 'اعتماد', icon: 'i-lucide-pen' },
      delete:      false,
      displayMode: 'inline',
    }"
    title-btn-create="إضافة دورة رواتب"
    title-btn-icon="lucide:calendar-range"
    title-btn-edit="تعديل دورة رواتب"
    @update:page="setPage"
    @update:page-size="setPageSize"
    @update:sorting="sorting = $event"
    @update:global-filter="setSearch"
    @update:column-filters="columnFilters = $event"
    @update:data="onUpdateData"
  />
</template>

<style scoped>
.ring-default { --tw-ring-color: #00dc82 !important; }
</style>
