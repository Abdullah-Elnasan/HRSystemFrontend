<script setup lang="ts">
import { generateColumns } from "~/utils/generateColumns";
import type { WorkSchedule, WorkScheduleForm } from "~/types/workSchedule";
import {
  emptyWorkScheduleForm,
  transformFormToPayload,
  transformScheduleToForm,
} from "~/types/workSchedule";
import { isWorkScheduleRow } from "~/composables/workSchedule/isWorkScheduleRow";
import { useWorkSchedules } from "~/composables/workSchedule/useWorkSchedules";

const UButton = resolveComponent("UButton");

definePageMeta({
  layout: "dashboard",
  title: "إدارة جداول العمل",
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
  deleteWorkSchedule,
  createWorkSchedule,
  updateWorkSchedule,
} = useWorkSchedules();

console.log(data)
/* ================== Drawer State ================== */
const open = ref(false);
const titleDrawer = ref("");

/* ================== Computed ================== */
const workSchedules = computed<WorkSchedule[]>(() => data.value ?? []);

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

/* ================== Columns ================== */
const columns = computed(() =>
  workSchedules.value.length
    ? generateColumns<WorkSchedule>(
        workSchedules.value,
        {
          labels: {
            name_ar: "الاسم",
            type: "النوع",
            is_active: "فعال",
            action: "العمليات",
          },
          exclude: [
            "name_en",
            "description_en",
            "description_ar",
            "created_at",
            "updated_at",
            "fixed_rules",
            "flexible_rules",
          ],
          columns: {
            name_ar: { filterable: true },
            type: { filterable: true, type: "status" },
            is_active: { filterable: true, type: "status" },
            action: { hideable: false },
          },
        },
        UButton
      )
    : []
);

/* ================== Effects ================== */
watch(
  workSchedules,
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
const formModel = reactive<WorkScheduleForm>(emptyWorkScheduleForm());

const openDrawer = (payload: { title: string; row?: unknown }) => {
  (document.activeElement as HTMLElement)?.blur();
  open.value = true;
  titleDrawer.value = payload.title;

  if (payload.row && isWorkScheduleRow(payload.row)) {
    // Edit mode: transform backend data to form
    editingId.value = payload.row.id;
    const formData = transformScheduleToForm(payload.row);
    Object.assign(formModel, formData);
  } else {
    // Create mode: reset form
    editingId.value = null;
    Object.assign(formModel, emptyWorkScheduleForm());
  }
};

const closeDrawer = () => {
  open.value = false;
  setTimeout(() => {
    editingId.value = null;
    Object.assign(formModel, emptyWorkScheduleForm());
  }, 300);
};

/* ================== Table Meta ================== */
const meta = {
  class: {
    tr: (row: any) => {
      return row.original.is_active === false
        ? "bg-error/10 shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow"
        : "bg-white dark:bg-gray-900 shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow";
    },
  },
};

/* ================== Status Map ================== */
const statusMap: Record<string, { label: string; color: string }> = {
  fixed: { label: "ثابت", color: "success" },
  flexible: { label: "مرن", color: "info" },
  false: { label: "غير فعال", color: "error" },
  true: { label: "فعال", color: "success" },
};

/* ================== Form Ref ================== */
const formRef = ref<{ submit: () => void } | null>(null);

/* ================== Form Submission ================== */
const onSubmit = async (formData: WorkScheduleForm) => {
  try {
    // Transform form to backend payload
    const payload = transformFormToPayload(formData);

    if (editingId.value) {
      await updateWorkSchedule(editingId.value, payload);
    } else {
      await createWorkSchedule(payload);
    }

    closeDrawer();
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};

/* ================== Delete Handler ================== */
const onDeleteWorkScheduleHandler = async (id: number) => {
  await deleteWorkSchedule(id);
};

const toast = useToast();

/* ================== View Handler (Optional) ================== */
const onViewRow = (id: number) => {
  const schedule = workSchedules.value.find((s) => s.id === id);
  if (schedule) {
    toast.add({
      title: "عرض النظام",
      description: `عرض تفاصيل: ${schedule.name_ar}`,
      icon: "i-lucide-eye",
    });
    // يمكنك هنا فتح modal أو الانتقال لصفحة تفاصيل
  }
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
    :data="workSchedules"
    :total="safePagination.total"
    :page="page"
    :page-sizes="pageSizes"
    :page-size="pageSize"
    :loading="pending"
    :status-map="statusMap"
    :meta="meta"
    :sorting="sorting"
    :global-filter="search"
    :column-filters="columnFilters"
    title-btn-create="إضافة جدول دوام"
    title-btn-icon="material-symbols:group-add-outline-rounded"
    title-btn-edit="تعديل جدول الدوام"
    @update:page="onPageChange"
    @update:page-size="onPageSizeChange"
    @update:sorting="onSortingChange"
    @update:global-filter="onSearchGlobal"
    @update:column-filters="onColumnFiltersChange"
    @delete:row="onDeleteWorkScheduleHandler"
    @view:row="onViewRow"
    @drower:open="openDrawer"
    @update:data="openDrawer"
  />

  <!-- Drawer with Multi-Step Form -->
  <ClientOnly>
    <UDrawer
      v-model:open="open"
      direction="left"
      :title="titleDrawer"
      :ui="{
        body: 'drower space-y-5 pt-0',
        header: 'hidden',
        title: 'text-primary',
        container: 'px-4 gap-y-10 drower',
        overlay: 'bg-primary/10',
        content:
          'shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] ps-2 min-w-200',
      }"
    >
      <template #body>
        <!-- Header -->
        <div class="flex items-center justify-end gap-2">
          <h2 class="text-highlighted font-semibold">{{ titleDrawer }}</h2>

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

        <!-- Multi-Step Form -->
        <ClientOnly>
          <FormsWorkScheduleForm
            ref="formRef"
            v-model="formModel"
            :mode="mode"
            @submit="onSubmit"
          />
        </ClientOnly>
      </template>

      <template #footer>
        <!-- Note: Submit is handled by the form's internal navigation -->
        <UButton
          label="إغلاق"
          color="neutral"
          variant="outline"
          class="justify-center"
          @click="closeDrawer"
        />
      </template>
    </UDrawer>
  </ClientOnly>
</template>
