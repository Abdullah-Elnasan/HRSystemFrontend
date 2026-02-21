<script setup lang="ts">
import { generateColumns } from "~/utils/generateColumns";
import { watchDebounced, useDebounceFn } from "@vueuse/core";
import type { AttendanceForm } from "~/types/attendance";
import { useAttendance } from "~/composables/attendances/useAttendance";
import { useAttendanceDrawer } from "~/composables/attendances/useAttendanceDrawer";
import { useAttendanceActions } from "~/composables/attendances/useAttendanceActions";
import dayjs from "dayjs";

const UButton = resolveComponent("UButton");

definePageMeta({
  layout: "dashboard",
  title: "إدارة الحضور",
  keepalive: false,
});

/* ================== Date & Advanced Filters ================== */
const dateFrom = ref(dayjs().startOf("month").format("YYYY-MM-DD"));
const dateTo = ref(dayjs().endOf("month").format("YYYY-MM-DD"));
const selectedBranch = ref<number | null>(null);
const selectedStatus = ref<string | null>(null);

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
} = useAttendance({
  dateFrom: dateFrom.value,
  dateTo: dateTo.value,
});

/* ================== Drawer ================== */
const drawer = useAttendanceDrawer();

/* ================== Form Ref ================== */
const formRef = ref<{ submit: () => void } | null>(null);

/* ================== Actions ================== */
const { submit, remove } = useAttendanceActions(drawer.close);

/* ================== Table ================== */
const PAGE_SIZES: number[] = [10, 50, 100];
const config = useRuntimeConfig();
const { $api } = useNuxtApp();
const firstLoad = ref(true);
const sorting = ref<any[]>([]);
const columnFilters = ref<any[]>([]);

const safePagination = computed(() => ({
  total: pagination.value?.total ?? 0,
  per_page: pagination.value?.per_page ?? pageSize.value,
  current_page: pagination.value?.current_page ?? page.value,
  last_page: pagination.value?.last_page ?? 1,
}));

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  absent: "غائب",
  incomplete: "مكتمل",
};

const statusOptions = [
  { label: "الكل", value: null },
  { label: "حاضر", value: "present" },
  { label: "غائب", value: "absent" },
  { label: "مكتمل", value: "incomplete" },
];

const tableMeta = {
  class: {
    tr: () =>
      "bg-white dark:bg-gray-900 shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow",
  },
};

// ─── Enhanced Records ─────────────────────────────────
const enhancedRecords = computed(
  () =>
    records.value?.map((r) => ({
      ...r,
      status_label: statusLabels[r.status] ?? r.status,
      status_label_re: statusLabels[r.attendance_status] ?? r.attendance_status,
    })) ?? [],
);

console.log("Enhanced Records:", records.value);
const columns = computed(() =>
  enhancedRecords.value.length
    ? generateColumns<any>(
        enhancedRecords.value,
        {
          labels: {
            employee: "الموظف",
            date: "التاريخ",
            device_id: "الجهاز",
            check_in_time: "وقت الدخول",
            check_out_time: "وقت الخروج",
            required_time: "الساعات المطلوبة",
            work_time: "ساعات العمل الفعلية",
            is_late: "دخول متأخر",
            late_time: "مدة التأخير",
            is_early_leave: "خروج مبكر",
            early_leave_time: "مدة الخروج المبكر",
            overtime_time: "ساعات العمل الإضافي",
            undertime_time: "ساعات التقصير",
            status_label_re: "حالة الحضور",
            status_label: "حالة السجل",
            action: "العمليات",
          },
          exclude: [
            "status",
            "created_at",
            "updated_at",
            "attendance_status",
            "check_in",
            "check_out",
            "early_leave_minutes",
            "late_minutes",
            "overtime_minutes",
            "undertime_minutes",
            "work_minutes",
            "required_minutes",
          ],
          columns: {
            employee: {
              type: "object",
              valueKey: "full_name",
              filterable: true,
            },
            date: { type: "date" },
            undertime_time: { type: "number" },
            status_label: { filterable: true },
            action: { hideable: false },
          },
        },
        UButton,
      )
    : [],
);

/* ================== Branches Search ================== */
const branchSearchQuery = ref("");
const branchesLoading = ref(false);
const branches = ref<Array<{ label: string; value: number | null }>>([
  { label: "كل الفروع", value: null },
]);

const searchBranches = useDebounceFn(async (query: string) => {
  branchesLoading.value = true;
  try {
    const res: any = await $api(`${config.public.apiBase}/api/branches`, {
      params: { "filter[search]": query, per_page: 20 },
    });
    branches.value = [
      { label: "كل الفروع", value: null },
      ...(res?.data ?? []).map((b: any) => ({
        label: b.name_ar || b.name,
        value: b.id,
      })),
    ];
  } catch (error) {
    console.error("Error searching branches:", error);
  } finally {
    branchesLoading.value = false;
  }
}, 300);

const selectedBranchObj = computed({
  get: (): { label: string; value: number | null } | undefined =>
    branches.value.find((b) => b.value === selectedBranch.value),
  set: (val: { label: string; value: number | null } | undefined) => {
    selectedBranch.value = val?.value ?? null;
  },
});

/* ================== Lifecycle ================== */
onMounted(() => {
  (searchBranches(""), fetchRecords());
});

watch(
  records,
  (val) => {
    if (val?.length) firstLoad.value = false;
  },
  { immediate: true },
);

watch(branchSearchQuery, (q) => searchBranches(q));

// ─── Watch الفلاتر ────────────────────────────────────
watchDebounced(
  [dateFrom, dateTo, selectedBranch, selectedStatus],
  ([newFrom, newTo, branch, status]) => {
    const filters: Record<string, any> = {};

    if (newFrom && dayjs(newFrom).isValid())
      filters["filter[date_from]"] = newFrom;
    if (newTo && dayjs(newTo).isValid()) filters["filter[date_to]"] = newTo;
    if (branch !== null) filters["filter[branch_id]"] = branch;
    if (status !== null) filters["filter[status]"] = status;

    refetch(filters);
  },
  { debounce: 500 },
);

/* ================== Quick Date Filters ================== */
function setDateRange(range: "today" | "week" | "month" | "year") {
  const map = {
    today: [dayjs(), dayjs()] as const,
    week: [dayjs().startOf("week"), dayjs().endOf("week")] as const,
    month: [dayjs().startOf("month"), dayjs().endOf("month")] as const,
    year: [dayjs().startOf("year"), dayjs().endOf("year")] as const,
  };
  const [from, to] = map[range];
  dateFrom.value = from.format("YYYY-MM-DD");
  dateTo.value = to.format("YYYY-MM-DD");
}

// async function resetFilters() {
//   dateFrom.value = dayjs().startOf("month").format("YYYY-MM-DD");
//   dateTo.value = dayjs().endOf("month").format("YYYY-MM-DD");
//   selectedBranch.value = null;
//   selectedStatus.value = null;
//   branchSearchQuery.value = "";

//   await nextTick();
//   refetch({
//     "filter[date_from]": dateFrom.value,
//     "filter[date_to]": dateTo.value,
//   });
// }

const resetFilters = async () => {
  dateFrom.value = dayjs().startOf("month").format("YYYY-MM-DD");
  dateTo.value = dayjs().endOf("month").format("YYYY-MM-DD");
  selectedBranch.value = null;
  selectedStatus.value = null;
  branchSearchQuery.value = "";
  const filters: Record<string, any> = {};
  filters["filter[date_from]"] = dateFrom.value;
  ((filters["filter[date_to]"] = dateTo.value),
    (filters["filter[branch_id]"] = selectedBranch.value),
    (filters["filter[status]"] = selectedStatus.value = null),
    (filters["filter[search]"] = branchSearchQuery.value),
    // ✅ انتظار التحديث ثم إعادة الجلب
    await nextTick());
  await refetch(filters);
};

/* ================== Handlers ================== */
const onSubmit = (_value: Partial<AttendanceForm>) =>
  submit(drawer.editingId.value, { ...drawer.formModel });

function submitForm() {
  formRef.value?.submit();
}
</script>

<template>
  <!-- أول تحميل -->
  <div
    v-if="firstLoad && loading"
    class="flex items-center justify-center py-20"
  >
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
    :btn-create="true"
    title-btn-create="إضافة سجل حضور"
    title-btn-icon="lucide:calendar-check"
    title-btn-edit="تعديل سجل حضور"
    @update:page="setPage"
    @update:page-size="setPageSize"
    @update:sorting="sorting = $event"
    @update:global-filter="setSearch"
    @update:column-filters="columnFilters = $event"
    @delete:row="remove"
    @drower:open="drawer.open"
    @update:data="drawer.open"
  >
    <template #toolbar-prepend>
      <div class="flex flex-wrap gap-2 items-center">
        <!-- أزرار الفترات السريعة -->
        <div class="flex gap-1">
          <UButton
            label="الشهر"
            size="sm"
            variant="outline"
            color="neutral"
            @click="setDateRange('month')"
          />
          <UButton
            label="السنة"
            size="sm"
            variant="outline"
            color="neutral"
            @click="setDateRange('year')"
          />
        </div>

        <div class="h-8 w-px bg-gray-300" />

        <!-- من / إلى -->
        <div class="flex gap-2 items-center">
          <label class="text-sm text-muted font-medium">من:</label>
          <UInput type="date" v-model="dateFrom" class="w-24" size="sm" />
        </div>
        <div class="flex gap-2 items-center">
          <label class="text-sm text-muted font-medium">إلى:</label>
          <UInput type="date" v-model="dateTo" class="w-24" size="sm" />
        </div>

        <div class="h-8 w-px bg-gray-300" />

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

        <!-- فلتر الحالة -->
        <div class="flex gap-2 items-center">
          <label class="text-sm text-muted font-medium">الحالة:</label>
          <USelect
            v-model="selectedStatus"
            :items="statusOptions"
            placeholder="اختر الحالة"
            class="w-20"
            size="sm"
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

  <!-- Drawer -->
  <ClientOnly>
    <UDrawer
      v-model:open="drawer.isOpen.value"
      direction="left"
      :title="drawer.title.value"
      :ui="{
        body: 'drower space-y-5 pt-0',
        header: 'hidden',
        title: 'text-primary',
        overlay: 'bg-green-400/30',
        content:
          'shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] ps-2',
      }"
    >
      <template #body>
        <!-- Header -->
        <div class="flex items-center justify-end gap-2">
          <h2 class="text-highlighted font-semibold">
            {{ drawer.title.value }}
          </h2>
          <UIcon
            :name="
              drawer.mode.value === 'edit'
                ? 'solar:pen-new-round-linear'
                : 'ic:baseline-control-point-duplicate'
            "
            class="size-5"
          />
        </div>

        <!-- Form -->
        <FormsAttendancesForm
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
.ring-default {
  --tw-ring-color: #00dc82 !important;
}
</style>
