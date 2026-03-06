<script setup lang="ts">
import { generateColumns } from "~/utils/generateColumns";
import { useDebounceFn } from "@vueuse/core";
import type { Employee, EmployeeForm } from "~/types/employee";
import { useEmployees } from "~/composables/employee/useEmployees";
import { useEmployeeDrawer } from "~/composables/employee/useEmployeeDrawer";
import { useEmployeeActions } from "~/composables/employee/useEmployeeActions";

const UButton = resolveComponent("UButton");
const router = useRouter();
const config = useRuntimeConfig();
const { $api } = useNuxtApp();

definePageMeta({
  layout: "dashboard",
  title: "إدارة الموظفين",
  keepalive: false,
});

/* ================== Data ================== */
const {
  employees,
  pagination,
  loading,
  page,
  pageSize,
  search,
  setPage,
  setPageSize,
  setSearch,
  fetchEmployees,
  selectedStatus,
  selectedBranch,
  selectedDepartment,
  setStatus,
  setBranch,
  setDepartment,
  resetFilters,
} = useEmployees();

/* ================== Drawer ================== */
const drawer = useEmployeeDrawer();

/* ================== Form Ref ================== */
const formRef = ref<{ submit: () => void } | null>(null);

/* ================== Actions ================== */
const { submit, remove } = useEmployeeActions(drawer.close);

/* ================== Table ================== */
const PAGE_SIZES: number[] = [10, 50, 100];

const firstLoad = ref(true);
const sorting = ref<any[]>([]);
const columnFilters = ref<any[]>([]);

const safePagination = computed(() => ({
  total: pagination.value?.total ?? 0,
  per_page: pagination.value?.per_page ?? pageSize.value,
  current_page: pagination.value?.current_page ?? page.value,
  last_page: pagination.value?.last_page ?? 1,
}));

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: "نشط", color: "secondary" },
  inactive: { label: "غير نشط", color: "error" },
};

const tableMeta = {
  class: {
    tr: (row: any) =>
      row.full_name !== ""
        ? "bg-red dark:bg-gray-900 shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow text-start"
        : "bg-red dark:bg-gray-900 shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow",
  },
};

const columns = computed(() =>
  employees.value?.length
    ? generateColumns<Employee>(
      employees.value,
      {
        labels: {
          full_name: "الاسم",
          email: "البريد الإلكتروني",
          status: "الحالة",
          branch: "الفرع",
          department: "القسم",
          action: "",
          pin: "الرقم التعريفي",
          phone: "رقم الهاتف",
          user_group: "مجموعة المستخدمين",
          birth_date: "الميلاد",
          current_work_schedule: "نظام الدوام الحالي",
          upcoming_work_schedule: "نظام الدوام القادم",
          payroll_system: "نظام الراتب",
        },
        exclude: [
          "national_id",
          "position",
          "image",
          "created_at",
          "updated_at",
          "first_name",
          "last_name",
        ],
        columns: {
          email: { filterable: true, hidden: true },
          // في employees page
          full_name: {
            filterable: true,
            cell: ({ row }) => `${row.first_name} ${row.last_name}`,
            meta: {
              align: 'start', // custom flag
            },
          },

          status: { type: "status", cell: ({ getValue }) => getValue() },
          phone: { hidden: true },
          branch: { type: "object", valueKey: "name_ar", hidden: true },
          current_work_schedule: { type: "object", valueKey: "name_ar" },
          upcoming_work_schedule: {
            type: "object",
            valueKey: "name_ar",
            hidden: true,
          },
          payroll_system: { type: "object", valueKey: "name" },
          department: { type: "object", valueKey: "name_ar" },
          user_group: { type: "object", valueKey: "name_ar", hidden: true },
          birth_date: { hidden: true },
          action: { hideable: false },
        },
      },
      UButton,
    )
    : [],
);

/* ================== Branch Search ================== */
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
      ...(res?.data ?? []).map((b: any) => ({ label: b.name_ar, value: b.id })),
    ];
  } finally {
    branchesLoading.value = false;
  }
}, 300);

/* ================== Department Search ================== */
const departmentSearchQuery = ref("");
const departmentsLoading = ref(false);
const departments = ref<Array<{ label: string; value: number | null }>>([
  { label: "كل الأقسام", value: null },
]);

const searchDepartments = useDebounceFn(async (query: string) => {
  departmentsLoading.value = true;
  try {
    const res: any = await $api(`${config.public.apiBase}/api/departments`, {
      params: { "filter[search]": query, per_page: 20 },
    });
    departments.value = [
      { label: "كل الأقسام", value: null },
      ...(res?.data ?? []).map((d: any) => ({ label: d.name_ar, value: d.id })),
    ];
  } finally {
    departmentsLoading.value = false;
  }
}, 300);

/* ================== Status Options ================== */
const statusOptions = [
  { label: "الكل", value: null },
  { label: "نشط", value: "active" },
  { label: "غير نشط", value: "inactive" },
];

// ─── Computed v-model Helpers ─────────────────────────
const selectedBranchObj = computed({
  get: () => branches.value.find((b) => b.value === selectedBranch.value),
  set: (val) => setBranch(val?.value ?? null),
});

const selectedDepartmentObj = computed({
  get: () =>
    departments.value.find((d) => d.value === selectedDepartment.value),
  set: (val) => setDepartment(val?.value ?? null),
});

const selectedStatusObj = computed({
  get: () => statusOptions.find((s) => s.value === selectedStatus.value),
  set: (val) => setStatus(val?.value ?? null),
});

/* ================== Lifecycle ================== */
onMounted(() => {
  searchBranches("");
  searchDepartments("");
  fetchEmployees();
});

watch(
  employees,
  (val) => {
    if (val?.length) firstLoad.value = false;
  },
  { immediate: true },
);

watch(branchSearchQuery, (q) => searchBranches(q));
watch(departmentSearchQuery, (q) => searchDepartments(q));

/* ================== Handlers ================== */
const onSubmit = (_value: Partial<EmployeeForm>) =>
  submit(drawer.editingId.value, { ...drawer.formModel });

function submitForm() {
  formRef.value?.submit();
}

function goToAttendances(row: { id: number }) {
  router.push(`/attendances/${row.id}`);
}

async function handleResetFilters() {
  branchSearchQuery.value = "";
  departmentSearchQuery.value = "";
  await nextTick();
  resetFilters();
}
</script>

<template>
  <!-- أول تحميل -->
  <div v-if="firstLoad && loading" class="flex items-center justify-center py-20">
    <span class="text-muted text-lg">جارٍ التحميل...</span>
  </div>

  <!-- الجدول -->
  <AppTable v-else :columns="columns" :data="employees ?? []" :total="safePagination.total" :actions="{ view: false }"
    :page="page" :page-sizes="PAGE_SIZES" :page-size="pageSize" :loading="loading" :status-map="statusMap"
    :meta="tableMeta" :sorting="sorting" :global-filter="search" :column-filters="columnFilters" :btn-create="true"
    :row-clickable="true" :on-row-click="goToAttendances" title-btn-create="إضافة موظف"
    title-btn-icon="material-symbols:group-add-outline-rounded" title-btn-edit="تعديل موظف" @update:page="setPage"
    @update:page-size="setPageSize" @update:sorting="sorting = $event" @update:global-filter="setSearch"
    @update:column-filters="columnFilters = $event" @delete:row="remove" @drower:open="drawer.open"
    @update:data="drawer.open">
    <template #toolbar-prepend>
      <div class="flex flex-wrap gap-2 items-center">
        <!-- فلتر الحالة -->
        <div class="flex gap-2 items-center">
          <label class="text-sm text-muted font-medium">الحالة:</label>
          <USelectMenu v-model="selectedStatusObj" :items="statusOptions" by="value" option-attribute="label"
            placeholder="كل الحالات" class="w-28" size="sm" trailing-icon="mi:select" />
        </div>

        <!-- فلتر الفرع -->
        <div class="flex gap-2 items-center">
          <label class="text-sm text-muted font-medium">الفرع:</label>
          <USelectMenu v-model="selectedBranchObj" :items="branches" :loading="branchesLoading" searchable
            searchable-placeholder="ابحث عن فرع..." by="value" option-attribute="label" placeholder="كل الفروع"
            class="w-32" size="sm" trailing-icon="mi:select" @update:query="branchSearchQuery = $event" />
        </div>

        <!-- فلتر القسم -->
        <div class="flex gap-2 items-center">
          <label class="text-sm text-muted font-medium">القسم:</label>
          <USelectMenu v-model="selectedDepartmentObj" :items="departments" :loading="departmentsLoading" searchable
            searchable-placeholder="ابحث عن قسم..." by="value" option-attribute="label" placeholder="كل الأقسام"
            class="w-32" size="sm" trailing-icon="mi:select" @update:query="departmentSearchQuery = $event" />
        </div>

        <!-- إعادة تعيين -->
        <UButton icon="i-lucide-x" label="إعادة تعيين" size="sm" variant="ghost" color="neutral"
          @click="handleResetFilters" />
      </div>
    </template>
  </AppTable>

  <!-- Drawer -->
  <ClientOnly>
    <UDrawer v-model:open="drawer.isOpen.value" direction="left" :title="drawer.title.value" :ui="{
      body: 'drower space-y-5 pt-0',
      header: 'hidden',
      title: 'text-primary',
      overlay: 'bg-green-400/30',
      content:
        'shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] ps-2',
    }">
      <template #body>
        <div class="flex items-center justify-end gap-2">
          <h2 class=" font-semibold text-secondary">
            {{ drawer.title.value }}
          </h2>
          <UIcon :name="drawer.mode.value === 'edit'
              ? 'solar:pen-new-round-linear'
              : 'ic:baseline-control-point-duplicate'
            " class="size-5 text-primary"  />
        </div>

        <FormsEmployeeForm ref="formRef" v-model="drawer.formModel" :mode="drawer.mode.value" :columns="2"
          class="min-w-150 items-start" @submit="onSubmit" />
      </template>

      <template #footer>
        <UButton label="إرسال" color="primary" class="justify-center" @click="submitForm()" />
        <UButton label="إغلاق" color="neutral" variant="outline" class="justify-center" @click="drawer.close()" />
      </template>
    </UDrawer>
  </ClientOnly>
</template>

<style scoped>
.ring-default {
  --tw-ring-color: #00dc82 !important;
}
</style>
