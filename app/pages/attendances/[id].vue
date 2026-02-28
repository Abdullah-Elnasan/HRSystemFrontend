<script setup lang="ts">
import { generateColumns } from '~/utils/generateColumns'
import { watchDebounced } from '@vueuse/core'
import type { Attendance } from '~/types/attendance'
import { useAttendancesEmployee } from '~/composables/attendances/useAttendnacesEmployee'
import dayjs from 'dayjs'

const UButton = resolveComponent('UButton')

definePageMeta({
  layout: 'dashboard',
  title:  'سجلات حضور الموظف',
})

/* ================== Route ================== */
const route      = useRoute()
const employeeId = Number(route.params.id)

/* ================== Date Filters ================== */
const dateFrom = ref(dayjs().startOf('month').format('YYYY-MM-DD'))
const dateTo   = ref(dayjs().endOf('month').format('YYYY-MM-DD'))

/* ================== Data ================== */
const {
  records,
  pagination,
  loading,
  page,
  pageSize,
  setPage,
  setPageSize,
  fetchRecords,
  refetch,
} = useAttendancesEmployee({
  employeeId,
  dateFrom: dateFrom.value,
  dateTo:   dateTo.value,
})

/* ================== Table ================== */
const PAGE_SIZES: number[] = [10, 50, 100]

const firstLoad = ref(true)

const safePagination = computed(() => ({
  total: pagination.value?.total ?? 0,
}))

const statusLabels: Record<string, string> = {
  present:     'حاضر',
  absent:      'غائب',
  late:        'متأخر',
  early_leave: 'مغادرة مبكرة',
  half_day:    'نصف يوم',
  incomplete:  'غير مكتمل',
}

// ─── Enhanced Records ─────────────────────────────────
const enhancedRecords = computed(() =>
  records.value?.map(r => ({
    ...r,
    status_label:    statusLabels[r.status]            ?? r.status,
    status_label_re: statusLabels[r.attendance_status] ?? r.attendance_status,
  })) ?? []
)

const columns = computed(() =>
  enhancedRecords.value.length
    ? generateColumns<any>(
        enhancedRecords.value,
        {
          labels: {
            employee:         'الموظف',
            date:             'التاريخ',
            device_id:        'الجهاز',
            check_in_time:    'وقت الدخول',
            check_out_time:   'وقت الخروج',
            required_time:    'الساعات المطلوبة',
            work_time:        'ساعات العمل الفعلية',
            is_late:          'دخول متأخر',
            late_time:        'مدة التأخير',
            is_early_leave:   'خروج مبكر',
            early_leave_time: 'مدة الخروج المبكر',
            overtime_time:    'ساعات العمل الإضافي',
            undertime_time:   'ساعات التقصير',
            status_label_re:  'حالة الحضور',
            status_label:     'حالة السجل',
            action:           'العمليات',
          },
          exclude: [
            'status', 'created_at', 'updated_at', 'attendance_status',
            'check_in', 'check_out', 'early_leave_minutes', 'late_minutes',
            'overtime_minutes', 'undertime_minutes', 'work_minutes', 'required_minutes',
          ],
          columns: {
            employee:       { type: 'object', valueKey: 'full_name', filterable: true },
            date:           { type: 'date' },
            undertime_time: { type: 'number' },
            status_label:   { filterable: true },
            action:         { hideable: false },
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

// ─── Watch فلاتر التاريخ ──────────────────────────────
watchDebounced(
  [dateFrom, dateTo],
  ([newFrom, newTo]) => {
    if (newFrom && newTo && dayjs(newFrom).isValid() && dayjs(newTo).isValid()) {
      refetch({
        'filter[date_from]': newFrom,
        'filter[date_to]':   newTo,
      })
    }
  },
  { debounce: 500 }
)

/* ================== Quick Date Filters ================== */
function setDateRange(range: 'today' | 'week' | 'month' | 'year') {
  const map = {
    today: [dayjs(),                 dayjs()                ] as const,
    week:  [dayjs().startOf('week'), dayjs().endOf('week')  ] as const,
    month: [dayjs().startOf('month'),dayjs().endOf('month') ] as const,
    year:  [dayjs().startOf('year'), dayjs().endOf('year')  ] as const,
  }
  const [from, to] = map[range]
  dateFrom.value = from.format('YYYY-MM-DD')
  dateTo.value   = to.format('YYYY-MM-DD')
}
</script>

<template>
  <!-- أول تحميل -->
  <div v-if="firstLoad && loading" class="flex items-center justify-center py-20">
    <span class="text-muted text-lg">جارٍ التحميل...</span>
  </div>

  <AppTable
    v-else
    :columns="columns"
    :data="enhancedRecords"
    :total="safePagination.total"
    :page="page"
    :search-table="false"
    :page-sizes="PAGE_SIZES"
    :page-size="pageSize"
    :loading="loading"
    :btn-create="false"
    title-btn-create=""
    title-btn-icon=""
    title-btn-edit=""
    @update:page="setPage"
    @update:page-size="setPageSize"
  >
    <template #toolbar-prepend>
      <div class="flex gap-2 items-center flex-wrap">
        <!-- أزرار سريعة -->
        <UButton label="اليوم"       size="sm" variant="outline" color="neutral" @click="setDateRange('today')" />
        <UButton label="هذا الأسبوع" size="sm" variant="outline" color="neutral" @click="setDateRange('week')"  />
        <UButton label="هذا الشهر"   size="sm" variant="outline" color="neutral" @click="setDateRange('month')" />
        <UButton label="هذا العام"   size="sm" variant="outline" color="neutral" @click="setDateRange('year')"  />

        <div class="h-8 w-px bg-gray-300" />

        <!-- فلاتر التاريخ -->
        <div class="flex gap-2 items-center">
          <label class="text-sm text-muted">من:</label>
          <UInput type="date" v-model="dateFrom" class="w-40" />
        </div>
        <div class="flex gap-2 items-center">
          <label class="text-sm text-muted">إلى:</label>
          <UInput type="date" v-model="dateTo" class="w-40" />
        </div>
      </div>
    </template>
  </AppTable>
</template>
