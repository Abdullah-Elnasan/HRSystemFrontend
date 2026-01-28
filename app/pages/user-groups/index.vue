<script setup lang="ts">
import { generateColumns } from "~/utils/generateColumns";
import type { UserGroup, UserGroupForm } from "~/types/userGroups";
import { emptyUserGroupForm } from "~/types/userGroups";
import { isUserGroupRow } from "~/composables/userGroups/isUserGroupRow";
import { useUserGroup } from "~/composables/userGroups/useUserGroups";

const UButton = resolveComponent("UButton");

definePageMeta({
  layout: "dashboard",
  title: "إدارة المجموعات",
  keepalive: false,
});

/* ================== Composable ================== */
const {
  data,
  pagination,
  loading,
  page,
  pageSize,
  search,
  setPage,
  setPageSize,
  setSearch,
  deleteUserGroup,
  createUserGroup,
  updateUserGroup,
} = useUserGroup();

const open = ref(false);
const titleDrawer = ref("");

/* ================== Computed ================== */
const groups = computed<UserGroup[]>(() => data.value ?? []);

const safePagination = computed(() => ({
  total: pagination.value?.total ?? 0,
  per_page: pagination.value?.per_page ?? pageSize.value,
  current_page: pagination.value?.current_page ?? page.value,
  last_page: pagination.value?.last_page ?? 1,
}));

/* ================== Table State ================== */
const pageSizes = [1, 50, 100];
const sorting = ref<any[]>([]);
const columnFilters = ref<any[]>([]);
const firstLoad = ref(true);

const meta = {
  class: {
    tr: (row: any) =>
      "bg-white dark:bg-gray-900 shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow",
  },
};

/* ================== Columns ================== */
const columns = computed(() =>
  groups.value.length
    ? generateColumns<UserGroup>(
        groups.value,
        {
          labels: {
            name_ar: "الاسم بالعربية",
            name_en: "الاسم بالإنجليزية",
            description_ar: "الوصف بالعربية",
            description_en: "الوصف بالإنجليزية",
            users_count: "عدد المستخدمين",
            active_users_count: "المستخدمين النشطين",
            action: "العمليات",
          },
          exclude: ["created_at", "updated_at", "description_en", "name_en"], // إذا تريد استبعاد حقول أخرى
          columns: {
            name_ar: { filterable: true },
            name_en: { filterable: true },
            description_ar: { hidden: true },
            description_en: { hidden: true },
            action: { hideable: false },
          },
        },
        UButton
      )
    : []
);

/* ================== Effects ================== */
watch(
  groups,
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
const formModel = reactive<UserGroupForm>(emptyUserGroupForm());

const openDrawer = (payload: { title: string; row?: unknown }) => {
  (document.activeElement as HTMLElement)?.blur();
  open.value = !open.value;
  titleDrawer.value = payload.title;

  if (payload.row && isUserGroupRow(payload.row)) {
    editingId.value = payload.row.id;
    Object.assign(formModel, {
      name_ar: payload.row.name_ar,
      name_en: payload.row.name_en,
      description_ar: payload.row.description_ar || "",
      description_en: payload.row.description_en || "",
    });
  } else {
    editingId.value = null;
    Object.assign(formModel, emptyUserGroupForm());
  }
};

const formRef = ref<{ submit: () => void } | null>(null);

const onSubmit = async (value: UserGroupForm) => {
  try {
    if (editingId.value) {
      await updateUserGroup(editingId.value, value);
    } else {
      await createUserGroup(value);
    }
    open.value = false;
  } catch (error) {
    console.error("Submit error:", error);
  }
};

const onDeleteHandler = async (id: number) => {
  await deleteUserGroup(id);
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
    :data="groups"
    :total="safePagination.total"
    :page="page"
    :page-sizes="pageSizes"
    :page-size="pageSize"
    :loading="loading"
    :meta="meta"
    :sorting="sorting"
    :global-filter="search"
    :column-filters="columnFilters"
    title-btn-create="إضافة مجموعة"
    title-btn-icon="material-symbols:add-to-photos-outline-rounded"
    title-btn-edit="تعديل مجموعة"
    @update:page="onPageChange"
    @update:page-size="onPageSizeChange"
    @update:sorting="onSortingChange"
    @update:global-filter="onSearchGlobal"
    @update:column-filters="onColumnFiltersChange"
    @delete:row="onDeleteHandler"
    @drower:open="openDrawer"
    @update:data="openDrawer"
  />

  <ClientOnly>
    <UDrawer
      v-model:open="open"
      :description="`إدارة المجموعات`"
      direction="left"
      :title="titleDrawer"
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

        <ClientOnly>
          <FormsUserGroupsForm
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
