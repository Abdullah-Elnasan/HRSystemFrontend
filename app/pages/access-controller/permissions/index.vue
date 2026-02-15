<script setup lang="ts">
import { generateColumns } from "~/utils/generateColumns";
import type {  Permission, PermissionForm } from "~/types/permission";
import { emptyPermissionForm } from "~/types/permission";
import { isPermissionRow } from "~/composables/permissions/isPermissionRow";
import { usePermissions } from "~/composables/permissions/usePermissions";

const UButton = resolveComponent("UButton");

definePageMeta({
  layout: "dashboard",
  title: "إدارة الصلاحيات",
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
  deletePermission,
  createPermission,
  updatePermission,
} = usePermissions();

const open = ref(false);
const titleDrower = ref("");

/* ================== Computed ================== */
const permissions = computed<Permission[]>(() => data.value ?? []);

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
const enhancedPermissions = computed(() =>
  permissions.value.map((permission) => ({
    ...permission,
    permission_group_name: permission.permission_group.name_ar,
  }))
);

/* ================== Columns ================== */
const columns = computed(() =>
  enhancedPermissions.value.length
    ? generateColumns<any>(
        enhancedPermissions.value,
        {
          labels: {
            code: "الكود",
            name_ar: "الاسم (عربي)",
            name_en: "الاسم (إنجليزي)",
            description_ar: "الوصف (عربي)",
            description_en: "الوصف (إنجليزي)",
            permission_group_name: "مجموعة الصلاحيات",
            action: "العمليات",
          },
          exclude: [
            "id",
            "permission_group",
            "created_at",
            "updated_at",
          ],
          columns: {
            code: { filterable: true },
            name_ar: { filterable: true },
            name_en: { filterable: true },
            description_ar: { hidden: true },
            description_en: { hidden: true },
            permission_group_name: { filterable: true },
            action: { hideable: false },
          },
        },
        UButton
      )
    : []
);

/* ================== Effects ================== */
watch(
  permissions,
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
const formModel = reactive<PermissionForm>(emptyPermissionForm());

const openDrower = (payload: { title: string; row?: unknown }) => {
  (document.activeElement as HTMLElement)?.blur();
  open.value = !open.value;
  titleDrower.value = payload.title;

  if (payload.row && isPermissionRow(payload.row)) {
    editingId.value = payload.row.id;
    Object.assign(formModel, {
      code: payload.row.code,
      name_ar: payload.row.name_ar,
      name_en: payload.row.name_en,
      description_ar: payload.row.description_ar || "",
      description_en: payload.row.description_en || "",
      permission_group_id: payload.row.permission_group.id,
    });
  } else {
    editingId.value = null;
    Object.assign(formModel, emptyPermissionForm());
  }
};

const formRef = ref<{ submit: () => void } | null>(null);

const onSubmit = async (value: PermissionForm) => {
  try {
    if (editingId.value) {
      await updatePermission(editingId.value, value);
    } else {
      await createPermission(value);
    }
    open.value = false;
  } catch (error) {
    console.error("Submit error:", error);
  }
};

const onDeletePermissionHandler = async (id: number) => {
  await deletePermission(id);
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
    :data="enhancedPermissions"
    :total="safePagination.total"
    :page="page"
    :page-sizes="pageSizes"
    :page-size="pageSize"
    :loading="pending"
    :meta="meta"
    :sorting="sorting"
    :global-filter="search"
    :column-filters="columnFilters"
    title-btn-create="إضافة صلاحية"
    title-btn-icon="lucide:shield-plus"
    title-btn-edit="تعديل صلاحية"
    @update:page="onPageChange"
    @update:page-size="onPageSizeChange"
    @update:sorting="onSortingChange"
    @update:global-filter="onSearchGlobal"
    @update:column-filters="onColumnFiltersChange"
    @delete:row="onDeletePermissionHandler"
    @drower:open="openDrower"
    @update:data="openDrower"
  />

  <ClientOnly>
    <UDrawer
      v-model:open="open"
      :description="`إدارة الصلاحيات`"
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
          <FormsPermissionForm
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
