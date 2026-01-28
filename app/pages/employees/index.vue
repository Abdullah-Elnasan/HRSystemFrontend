<script setup lang="ts">
import { generateColumns } from "~/utils/generateColumns";
import type { Employee, EmployeeForm } from "~/types/employee";
import { emptyEmployeeForm } from "~/types/employee";
import { useEmployees } from "~/composables/employee/useEmployees";
import { isEmployeeRow } from "~/composables/employee/isEmployeeRow";

const UButton = resolveComponent("UButton");

definePageMeta({
  layout: "dashboard",
  title: "إدارة الموظفين",
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
  deleteEmployee,
  createEmployee,
  updateEmployee,
} = useEmployees();

const open = ref(false);
const titleDrower = ref("");

/* ================== Computed ================== */
const employees = computed<Employee[]>(() => data.value ?? []);

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

/* ================== UI ================== */
const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: "نشط", color: "success" },
  inactive: { label: "غير نشط", color: "error" },
};

const meta = {
  class: {
    tr: (row: any) =>
      row.original.status === "inactive"
        ? "bg-error/10"
        : "bg-white dark:bg-gray-900 shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow",
  },
};

/* ================== Columns ================== */
const columns = computed(() =>
  employees.value.length
    ? generateColumns<Employee>(
        employees.value,
        {
          labels: {
            full_name: "الاسم",
            email: "البريد الإلكتروني",
            status: "الحالة",
            branch: "الفرع",
            department: "القسم",
            action: "العمليات",
            pin: "الرقم التعريفي",
            user_group: "مجموعة المستخدمين",
            current_work_schedule: "نظام الدوام الحالي",
            upcoming_work_schedule: "نظام الدوام القادم",

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
            full_name: {
              filterable: true,
              cell: ({ row }) => `${row.first_name} ${row.last_name}`,
            },
            status: { type: "status", cell: ({ getValue }) => getValue() },
            phone: { hidden: true },
            branch: { type: "object", valueKey: "name_ar" },
            current_work_schedule: { type: "object", valueKey: "name_ar" },
            upcoming_work_schedule: { type: "object", valueKey: "name_ar" },
            department: { type: "object", valueKey: "name_ar" },
            user_group: { type: "object", valueKey: "name_ar" },
            birth_date: { hidden: true },
            action: { hideable: false },
          },
        },
        UButton
      )
    : []
);

/* ================== Effects ================== */
watch(
  employees,
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
const formModel = reactive<EmployeeForm>(emptyEmployeeForm());

const openDrower = (payload: { title: string; row?: unknown }) => {
  (document.activeElement as HTMLElement)?.blur();
  open.value = !open.value;
  titleDrower.value = payload.title;

  if (payload.row && isEmployeeRow(payload.row)) {
    editingId.value = payload.row.id;

    const [first_name, ...rest] = (payload.row.full_name ?? "").split(" ");
    const last_name = rest.join(" ");

    Object.assign(formModel, {
      first_name,
      last_name,
      email: payload.row.email,
      phone: payload.row.phone,
      status: payload.row.status,
      position: payload.row.position,
      national_id: payload.row.national_id,
      pin: payload.row.pin,
      birth_date: payload.row.birth_date,
      branch_id: payload.row.branch?.id ?? 0,
      user_group_id: payload.row.user_group?.id ?? 0,
      department_id: payload.row.department?.id ?? 0,
       image: null,
    });
  } else {
    editingId.value = null;
    Object.assign(formModel, emptyEmployeeForm());
  }
};

const formRef = ref<{ submit: () => void } | null>(null);

const onSubmit = async (value: EmployeeForm) => {
  try {
    if (editingId.value) {
      await updateEmployee(editingId.value, value);
    } else {
      await createEmployee(value);
    }
    open.value = false;
  } catch (error) {
    console.error("Submit error:", error);
  }
};

const onDeleteEmployeeHandler = async (id: number) => {
  await deleteEmployee(id);
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
    :data="employees"
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
    title-btn-create="إضافة موظف"
    title-btn-icon="material-symbols:group-add-outline-rounded"
    title-btn-edit="تعديل موظف"
    @update:page="onPageChange"
    @update:page-size="onPageSizeChange"
    @update:sorting="onSortingChange"
    @update:global-filter="onSearchGlobal"
    @update:column-filters="onColumnFiltersChange"
    @delete:row="onDeleteEmployeeHandler"
    @drower:open="openDrower"
    @update:data="openDrower"
  />

  <ClientOnly>
    <UDrawer
      v-model:open="open"
      :description="`إدارة الموظفين`"
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
          <FormsEmployeeForm
            ref="formRef"
            v-model="formModel"
            :mode="mode"
            @submit="onSubmit"
            class="min-w-150 items-start"
            :columns="2"
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
