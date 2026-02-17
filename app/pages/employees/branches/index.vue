<script setup lang="ts">
import { generateColumns } from "~/utils/generateColumns";
import type { Branch, BranchForm } from "~/types/branch";
import { emptyBranchForm } from "~/types/branch";
import { isBranchRow } from "~/composables/branches/isBranchRow";
import { useBranches } from "~/composables/branches/useBranshes";

const UButton = resolveComponent("UButton");

definePageMeta({
  layout: "dashboard",
  title: "إدارة الأفرع",
  keepalive: false,
});

/* ================== Composable ================== */
const {
  branches,
  pagination,
  loading,
  error,
  fetchBranches,
  debouncedFetchBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} = useBranches();

const toast = useToast();

/* ================== State ================== */
const open = ref(false);
const titleDrower = ref("");
const page = ref(1);
const pageSize = ref(10);
const search = ref("");
const firstLoad = ref(true);

/* ================== Computed ================== */
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

const meta = {
  class: {
    tr: (row: any) =>
      "bg-white dark:bg-gray-900 shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow",
  },
};

/* ================== Columns ================== */
const columns = computed(() =>
  branches.value.length
    ? generateColumns<Branch>(
        branches.value,
        {
          labels: {
            name_ar: "الاسم",
            description_ar: "الوصف",
            location_ar: "الموقع",
            current_work_schedule: 'نظام الدوام الحالي',
            upcoming_work_schedule: 'نظام الدوام القادم',
            payroll_system: 'نظام الرواتب',
            employees_count: "عدد الموظفين",
            active_employees_count: "عدد الموظفين النشطين",
            action: "العمليات",
          },
          exclude: [
            "name_en",
            "description_en",
            "location_en",
            "created_at",
            "updated_at",
          ],
          columns: {
            name_ar: { filterable: true },
            description_ar: { hidden: true },
            location_ar: { hidden: true },
            action: { hideable: false },
            current_work_schedule: { type: "object", valueKey: "name_ar" },
            upcoming_work_schedule: { type: "object", valueKey: "name_ar" },
            payroll_system: { type: "object", valueKey: "name" },
          },
        },
        UButton
      )
    : []
);

/* ================== Fetch Data ================== */
const loadBranches = async () => {
  try {
    await fetchBranches({
      page: page.value,
      per_page: pageSize.value,
      filter: search.value ? { search: search.value } : undefined,
    });
  } catch (err: any) {
    // تجاهل أخطاء الإلغاء
    if (err?.name !== 'AbortError') {
      console.error('Error loading branches:', err);
    }
  }
};

// Debounced version للبحث فقط
const loadBranchesDebounced = async () => {
  try {
    await debouncedFetchBranches({
      page: page.value,
      per_page: pageSize.value,
      filter: search.value ? { search: search.value } : undefined,
    });
  } catch (err: any) {
    if (err?.name !== 'AbortError') {
      console.error('Error loading branches:', err);
    }
  }
};

/* ================== Effects ================== */
watch(
  branches,
  (val) => {
    if (val.length) firstLoad.value = false;
  },
  { immediate: true }
);

// Watch للصفحة والحجم - تحميل فوري
watch([page, pageSize], () => {
  loadBranches();
});

// Watch للبحث - تحميل مع debounce
watch(search, () => {
  page.value = 1; // إعادة للصفحة الأولى
  loadBranchesDebounced();
});

// التحميل الأولي
onMounted(() => {
  loadBranches();
});

/* ================== Handlers ================== */
const onPageChange = (p: number) => {
  page.value = p;
};

const onPageSizeChange = (s: number) => {
  pageSize.value = s;
  page.value = 1;
};

const onSearchGlobal = (val: string) => {
  search.value = val;
};

const onSortingChange = (val: any[]) => {
  sorting.value = val;
};

const onColumnFiltersChange = (val: any[]) => {
  columnFilters.value = val;
};

/* ================== Form Management ================== */
const editingId = ref<number | null>(null);
const mode = computed(() => (editingId.value ? "edit" : "create"));
const formModel = reactive<BranchForm>(emptyBranchForm());

const openDrower = (payload: { title: string; row?: unknown }) => {
  (document.activeElement as HTMLElement)?.blur();
  open.value = !open.value;
  titleDrower.value = payload.title;

  if (payload.row && isBranchRow(payload.row)) {
    editingId.value = payload.row.id;
    Object.assign(formModel, {
      name_ar: payload.row.name_ar,
      name_en: payload.row.name_en,
      description_ar: payload.row.description_ar || "",
      description_en: payload.row.description_en || "",
      location_ar: payload.row.location_ar || "",
      location_en: payload.row.location_en || "",
    });
  } else {
    editingId.value = null;
    Object.assign(formModel, emptyBranchForm());
  }
};

const formRef = ref<{ submit: () => void } | null>(null);

const onSubmit = async (value: BranchForm) => {
  try {
    if (editingId.value) {
      await updateBranch(editingId.value, value);
    } else {
      await createBranch(value);
    }
    open.value = false;
  } catch (error) {
    console.error("Submit error:", error);
  }
};

const onDeleteBranchHandler = async (id: number) => {
  try {
    await deleteBranch(id);
  } catch (error) {
    console.error("Delete error:", error);
  }
};
</script>

<template>
  <!-- Loading أول تحميل فقط -->
  <div
    v-if="firstLoad && loading"
    class="flex justify-center items-center py-20"
  >
    <span class="text-muted text-lg">جارٍ التحميل...</span>
  </div>

  <AppTable
    v-else
    :columns="columns"
    :data="branches"
    :total="safePagination.total"
    :page="page"
    :actions="{
      view: false,
      copy: false,
      edit: { label: 'تعديل' },
      delete: true,
    }"
    :page-sizes="pageSizes"
    :page-size="pageSize"
    :loading="loading"
    :meta="meta"
    :sorting="sorting"
    :global-filter="search"
    :column-filters="columnFilters"
    :btn-create="true"
    title-btn-create="إضافة فرع"
    title-btn-icon="material-symbols:group-add-outline-rounded"
    title-btn-edit="تعديل فرع"
    @update:page="onPageChange"
    @update:page-size="onPageSizeChange"
    @update:sorting="onSortingChange"
    @update:global-filter="onSearchGlobal"
    @update:column-filters="onColumnFiltersChange"
    @delete:row="onDeleteBranchHandler"
    @drower:open="openDrower"
    @update:data="openDrower"
  />

  <ClientOnly>
    <UDrawer
      v-model:open="open"
      :description="`إدارة الأفرع`"
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
          <FormsBranchForm
            ref="formRef"
            v-model="formModel"
            :mode="mode"
            @submit="onSubmit"
            class="min-w-150 items-start"
            :columns="1"
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
