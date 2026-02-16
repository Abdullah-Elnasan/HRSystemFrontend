<script setup lang="ts">
import { generateColumns } from "~/utils/generateColumns";
import type { PayrollSystem, PayrollSystemForm } from "~/types/payrollSystem";
import { emptyPayrollSystemForm } from "~/types/payrollSystem";
import { isPayrollSystemRow } from "~/composables/payrollSystem/isPayrollSystemRow";
import { usePayrollSystems } from "~/composables/payrollSystem/usePayrollSystems";

const UButton = resolveComponent("UButton");

definePageMeta({
  layout: "dashboard",
  title: "إدارة أنظمة الرواتب",
  keepalive: false,
});

/* ================== Composable ================== */
const {
  data,
  pagination,
  pending,
  page,
  pageSize,
  search,
  setPage,
  setPageSize,
  setSearch,
  deletePayrollSystem,
  createPayrollSystem,
  updatePayrollSystem,
} = usePayrollSystems();

const open = ref(false);
const titleDrower = ref("");

/* ================== Computed ================== */
const payrollSystems = computed<PayrollSystem[]>(() => data.value ?? []);

const safePagination = computed(() => ({
  total: pagination.value?.total ?? 0,
  per_page: pagination.value?.per_page ?? pageSize.value,
  current_page: pagination.value?.current_page ?? page.value,
  last_page: pagination.value?.last_page ?? 1,
}));

/* ================== Table State ================== */
const pageSizes = [10, 50, 100];
const sorting = ref<any[]>([]);
const columnFilters = ref<any[]>([]);
const firstLoad = ref(true);

const meta = {
  class: {
    tr: (row: any) =>
      "bg-white dark:bg-gray-900 shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow",
  },
};

/* ================== Enhanced Data ================== */
const enhancedPayrollSystems = computed(() =>
  payrollSystems.value.map((system) => ({
    ...system,
    salary_type_label: system.salary_type === "monthly" ? "شهري" : "بالساعة",
    status_label: system.is_active ? "نشط" : "غير نشط",
    deduct_label: system.deduct_missing_time ? "نعم" : "لا",
  }))
);

/* ================== Columns ================== */
const columns = computed(() =>
  enhancedPayrollSystems.value.length
    ? generateColumns<any>(
        enhancedPayrollSystems.value,
        {
          labels: {
            name: "الاسم",
            salary_type_label: "نوع الراتب",
            monthly_salary: "الراتب الشهري",
            hourly_rate: "الأجر بالساعة",
            overtime_base_rate: "معامل الوقت الإضافي",
            deduct_label: "خصم الوقت المفقود",
            status_label: "الحالة",
            currency: "العملة",
            action: "العمليات",
          },
          exclude: [
            "salary_type",
            "deduct_missing_time",
            "is_active",
            "created_at",
            "updated_at",
          ],
          columns: {
            name: { filterable: true },
            salary_type_label: { filterable: true },
            monthly_salary: { type: "number" },
            hourly_rate: { type: "number" },
            overtime_base_rate: { type: "number" },
            status_label: { filterable: true },
            currency: { filterable: true },
            action: { hideable: false },
          },
        },
        UButton
      )
    : []
);

/* ================== Effects ================== */
watch(
  payrollSystems,
  (val) => {
    if (val.length) firstLoad.value = false;
  },
  { immediate: true }
);

/* ================== Handlers ================== */
const onPageChange = (p: number) => setPage(p);
const onPageSizeChange = (s: number) => setPageSize(s);
const onSearchGlobal = (val: string) => setSearch(val);
const onSortingChange = (val: any[]) => (sorting.value = val);
const onColumnFiltersChange = (val: any[]) => (columnFilters.value = val);

/* ================== Form Management ================== */
const editingId = ref<number | null>(null);
const mode = computed(() => (editingId.value ? "edit" : "create"));
const formModel = reactive<PayrollSystemForm>(emptyPayrollSystemForm());

const openDrower = (payload: { title: string; row?: unknown }) => {
  (document.activeElement as HTMLElement)?.blur();
  open.value = !open.value;
  titleDrower.value = payload.title;

  if (payload.row && isPayrollSystemRow(payload.row)) {
    editingId.value = payload.row.id;
    Object.assign(formModel, {
      name: payload.row.name,
      salary_type: payload.row.salary_type,
      monthly_salary: payload.row.monthly_salary,
      hourly_rate: payload.row.hourly_rate,
      overtime_base_rate: payload.row.overtime_base_rate,
      deduct_missing_time: payload.row.deduct_missing_time,
      is_active: payload.row.is_active,
      currency: payload.row.currency,
    });
  } else {
    editingId.value = null;
    Object.assign(formModel, emptyPayrollSystemForm());
  }
};

const formRef = ref<{ submit: () => void } | null>(null);

const onSubmit = async (value: PayrollSystemForm) => {
  try {
    if (editingId.value) {
      await updatePayrollSystem(editingId.value, value);
    } else {
      await createPayrollSystem(value);
    }
    open.value = false;
  } catch (error) {
    console.error("Submit error:", error);
  }
};

const onDeletePayrollSystemHandler = async (id: number) => {
  await deletePayrollSystem(id);
};
</script>

<template>
  <!-- Loading أول تحميل فقط -->
  <div
    v-if="firstLoad && pending"
    class="flex justify-center items-center py-20"
  >
    <span class="text-muted text-lg">جارٍ التحميل...</span>
  </div>

  <AppTable
    v-else
    :columns="columns"
    :data="enhancedPayrollSystems"
    :total="safePagination.total"
    :page="page"
    :page-sizes="pageSizes"
    :page-size="pageSize"
    :loading="pending"
    :meta="meta"
    :sorting="sorting"
    :global-filter="search"
    :column-filters="columnFilters"
    title-btn-create="إضافة نظام رواتب"
    title-btn-icon="lucide:wallet"
    title-btn-edit="تعديل نظام رواتب"
    @update:page="onPageChange"
    @update:page-size="onPageSizeChange"
    @update:sorting="onSortingChange"
    @update:global-filter="onSearchGlobal"
    @update:column-filters="onColumnFiltersChange"
    @delete:row="onDeletePayrollSystemHandler"
    @drower:open="openDrower"
    @update:data="openDrower"
  />

  <ClientOnly>
    <UDrawer
      v-model:open="open"
      :description="`إدارة أنظمة الرواتب`"
      direction="left"
      :title="titleDrower"
      :ui="{
        body: 'drower space-y-5 pt-0',
        header: 'hidden',
        title: 'text-primary',
        container: 'px-4 gap-y-10 drower',
        overlay: 'bg-green-400/30',
        content:
          'shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] ps-2',
      }"
    >
      <template #body>
        <div class="flex items-center justify-end gap-2">
          <h2 class="text-highlighted font-semibold">{{ titleDrower }}</h2>

          <UIcon
            v-if="editingId"
            name="solar:pen-new-round-linear"
            class="size-5"
          />
          <UIcon
            v-else
            name="ic:baseline-control-point-duplicate"
            class="size-5"
          />
        </div>

        <ClientOnly>
          <FormsPayrollSystemForm
            ref="formRef"
            v-model="formModel"
            :mode="mode"
            @submit="onSubmit"
            class="min-w-150 items-start"
          />
        </ClientOnly>
      </template>

      <template #footer>
        <UButton
          label="إرسال"
          color="neutral"
          class="justify-center"
          @click="formRef?.submit()"
        />

        <UButton
          label="إغلاق"
          color="neutral"
          variant="outline"
          class="justify-center"
          @click="open = false"
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
