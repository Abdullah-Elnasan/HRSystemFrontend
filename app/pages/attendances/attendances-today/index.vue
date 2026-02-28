<script setup lang="ts">
import { generateColumns } from '~/utils/generateColumns'
import { useDebounceFn } from '@vueuse/core'
import type { AttendanceToday } from '~/types/attendanceToday'
import { useAttendanceToday } from '~/composables/attendances/today/useAttendancesToday'
import { useAttendanceTodayActions } from '~/composables/attendances/today/useAttendanceTodayActions'

const UButton   = resolveComponent('UButton')
const config    = useRuntimeConfig()
const { $api }  = useNuxtApp()

definePageMeta({
  layout: 'dashboard',
  title:  'حضور اليوم',
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
  refetch,
} = useAttendanceToday()

/* ================== Actions ================== */
const { remove } = useAttendanceTodayActions()

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

const columns = computed(() =>
  records.value?.length
    ? generateColumns<any>(
        records.value,
        {
          labels: {
            employee:            'الموظف',
            work_date:           'تاريخ العمل',
            first_check_in:      'وقت الدخول',
            last_check_out:      'وقت الخروج',
            worked_formatted:    'ساعات العمل',
            current_status:      'الحالة الحالية',
            last_punch_type:     'آخر نوع تسجيل',
            is_late:             'دخول متأخر',
            late_minutes:        'مدة التأخير',
            is_early_leave:      'خروج مبكر',
            early_leave_minutes: 'مدة الخروج المبكر',
            overtime_minutes:    'الوقت الإضافي',
            undertime_minutes:   'وقت التقصير',
            worked_minutes:      'وقت العمل',
            is_incomplete:       'مكتمل',
            action:              'العمليات',
          },
          exclude: ['id', 'is_inside', 'required_minutes', 'created_at', 'updated_at'],
          columns: {
            employee:              { type: 'object', valueKey: 'full_name', filterable: true },
            work_date:             { type: 'date' },
            first_check_in:        { type: 'date' },
            last_check_out:        { type: 'date' },
            current_status_label:  { filterable: true },
            last_punch_type_label: { filterable: true },
            action:                { hideable: false },
          },
        },
        UButton
      )
    : []
)

/* ================== Branch Filter ================== */
const selectedBranch    = ref<number | null>(null)
const branchSearchQuery = ref('')
const branchesLoading   = ref(false)
const branches = ref<Array<{ label: string; value: number | null }>>([
  { label: 'كل الفروع', value: null },
])

const searchBranches = useDebounceFn(async (query: string) => {
  branchesLoading.value = true
  try {
    const res: any = await $api(`${config.public.apiBase}/api/branches`, {
      params: { 'filter[search]': query, per_page: 20 },
    })
    branches.value = [
      { label: 'كل الفروع', value: null },
      ...(res?.data ?? []).map((b: any) => ({
        label: b.name_ar || b.name,
        value: b.id,
      })),
    ]
  } catch (error) {
    console.error('Error searching branches:', error)
  } finally {
    branchesLoading.value = false
  }
}, 300)

const selectedBranchObj = computed({
  get: (): { label: string; value: number | null } | undefined =>
    branches.value.find(b => b.value === selectedBranch.value),
  set: (val: { label: string; value: number | null } | undefined) => {
    selectedBranch.value = val?.value ?? null
  },
})

/* ================== Lifecycle ================== */
onMounted(() => {
  searchBranches('')
  fetchRecords()
})

watch(
  records,
  (val) => { if (val?.length) firstLoad.value = false },
  { immediate: true }
)

watch(branchSearchQuery, (q) => searchBranches(q))

// ─── Watch فلتر الفرع فقط (بدون تاريخ) ──────────────
watch(selectedBranch, (branch) => {
  const filters: Record<string, any> = {}

  if (branch !== null) {
    filters['filter[branch_id]'] = branch
  } else {
    filters['filter[branch_id]'] = null
  }

  refetch(filters)
})

/* ================== Reset Filters ================== */
async function resetFilters() {
  selectedBranch.value    = null
  branchSearchQuery.value = ''

  await nextTick()
  refetch({ 'filter[branch_id]': null })
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
    :data="records ?? []"
    :total="safePagination.total"
    :page="page"
    :page-sizes="PAGE_SIZES"
    :page-size="pageSize"
    :loading="loading"
    :meta="tableMeta"
    :sorting="sorting"
    :global-filter="search"
    :column-filters="columnFilters"
    :btn-create="false"
    :actions="{ copy: false, view: false, edit: false }"
    title-btn-icon="lucide:user-check"
    title-btn-edit="تعديل سجل حضور"
    title-btn-create="إضافة سجل حضور"
    @update:page="setPage"
    @update:page-size="setPageSize"
    @update:sorting="sorting = $event"
    @update:global-filter="setSearch"
    @update:column-filters="columnFilters = $event"
    @delete:row="remove"
  >
    <template #toolbar-prepend>
      <div class="flex flex-wrap gap-2 items-center">

        <!-- فلتر الفرع -->
        <div class="flex gap-2 items-center">
          <label class="text-sm text-muted font-medium">الفرع:</label>
          <USelectMenu
            v-model="selectedBranchObj"
            :items="branches"
            :loading="branchesLoading"
            searchable
            searchable-placeholder="ابحث عن فرع..."
            by="value"
            option-attribute="label"
            placeholder="اختر الفرع"
            class="w-28"
            size="sm"
            trailing-icon="mi:select"
            @update:query="branchSearchQuery = $event"
          />
        </div>

        <!-- إعادة تعيين -->
        <UButton
          icon="i-lucide-x"
          label="إعادة تعيين"
          size="sm"
          variant="ghost"
          color="neutral"
          @click="resetFilters"
        />
      </div>
    </template>
  </AppTable>
</template>

<style scoped>
.ring-default { --tw-ring-color: #00dc82 !important; }
</style>
