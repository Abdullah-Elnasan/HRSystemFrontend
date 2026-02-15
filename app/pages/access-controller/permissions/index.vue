<script setup lang="ts">
import { generateColumns } from "~/utils/generateColumns";
import type { Permission, PermissionForm } from "~/types/permission";
import { usePermissions } from "~/composables/permissions/usePermissions";
import { header, modal } from "#build/ui";

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
} = usePermissions();

const assignDialogOpen = ref(false);
const selectedPermissions = ref<number[]>([]);
const toast = useToast();
const currentOperation = ref("assign");
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
    permission_group_name: permission.group.name_ar,
  })),
);

/* ================== Columns ================== */
const columns = computed(() => {
  const baseColumns = enhancedPermissions.value.length
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
        },
        exclude: ["group", "created_at", "action", "updated_at"],
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
      UButton,
    )
    : [];

  return [
    {
      accessorKey: "select",
      header: "",
      cell: ({ row }: any) => {
        return h("input", {
          type: "checkbox",
          checked: selectedPermissions.value.includes(row.original.id),
          onChange: (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.checked) {
              selectedPermissions.value.push(row.original.id);
            } else {
              selectedPermissions.value = selectedPermissions.value.filter(
                (id) => id !== row.original.id,
              );
            }
          },
          class: "w-4 h-4 cursor-pointer",
        });
      },
      enableHiding: false,
      enableSorting: false,
      size: 50,
    },
    ...baseColumns,
  ];
});

/* ================== Effects ================== */
watch(
  permissions,
  (val) => {
    if (val.length) firstLoad.value = false;
  },
  { immediate: true },
);

/* ================== Handlers ================== */
const onPageChange = (p: number) => setPage(p);
const onPageSizeChange = (s: number) => setPageSize(s);
const onSearchGlobal = (val: string) => setSearch(val);
const onSortingChange = (val: any[]) => (sorting.value = val);
const onColumnFiltersChange = (val: any[]) => (columnFilters.value = val);

/* ================== إسناد الصلاحيات ================== */
const openAssignDialog = () => {
  // التحقق من اختيار صلاحيات
  if (selectedPermissions.value.length === 0) {
    toast.add({
      title: "تنبيه",
      description: "يرجى اختيار صلاحية واحدة على الأقل",
      color: "warning",
    });
    return;
  }
  // فتح الـ Dialog
  assignDialogOpen.value = true;
};

const closeAssignDialog = () => {
  assignDialogOpen.value = false;
};

const handleAssignComplete = () => {
  selectedPermissions.value = [];
};

const selectAll = () => {
  if (selectedPermissions.value.length === enhancedPermissions.value.length) {
    selectedPermissions.value = [];
  } else {
    selectedPermissions.value = enhancedPermissions.value.map((p) => p.id);
  }
};

const isAllSelected = computed(
  () =>
    enhancedPermissions.value.length > 0 &&
    selectedPermissions.value.length === enhancedPermissions.value.length,
);
</script>

<template>
  <div v-if="firstLoad && pending" class="flex justify-center items-center py-20">
    <span class="text-muted text-lg">جارٍ التحميل...</span>
  </div>

  <div v-else class="space-y-4">
    <div class="flex items-center justify-between gap-4" dir="rtl">
      <div class="flex items-center gap-2">
        <UModal :ui="{
          header: 'rtl',
        }" v-model:open="assignDialogOpen" title="إسناد الصلاحيات"
          :description="`تم تحديد ${selectedPermissions.length} صلاحية`" icon="i-lucide-user-plus" :close="{
            color: 'primary',
            variant: 'outline',
            class: 'rounded-full',
          }">
          <UButton v-if="selectedPermissions.length > 0" color="primary" icon="i-lucide-user-plus"
            @click="openAssignDialog">
            إسناد الصلاحيات ({{ selectedPermissions.length }})
          </UButton>

          <!-- <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-user-plus" class="w-6 h-6" :class="currentOperation === 'assign'
                    ? 'text-primary'
                    : 'text-error'
                  " />
                <div>
                  <h3 class="text-lg font-semibold">إسناد الصلاحيات</h3>
                  <p class="text-sm text-muted">
                    تم تحديد {{ selectedPermissions.length }} صلاحية
                  </p>
                </div>
              </div>
              <UButton variant="ghost" icon="i-lucide-x" @click="closeAssignDialog" />
            </div>
          </template> -->

          <template #body>
            <FormsAccessControllerPermissionsassigndialog :permission-ids="selectedPermissions"
              @update:open="closeAssignDialog" @update:operation="currentOperation = $event"
              @success="handleAssignComplete" />
          </template>
        </UModal>

        <UButton v-if="enhancedPermissions.length > 0" variant="outline" :icon="isAllSelected ? 'i-lucide-square-check' : 'i-lucide-square-dashed'
          " @click="selectAll">
          {{ isAllSelected ? "إلغاء الكل" : "تحديد الكل" }}
        </UButton>
      </div>

      <div v-if="selectedPermissions.length > 0" class="text-sm text-muted">
        تم تحديد {{ selectedPermissions.length }} من
        {{ enhancedPermissions.length }} صلاحية
      </div>
    </div>

    <AppTable :columns="columns" :data="enhancedPermissions" :total="safePagination.total" :page="page"
      :page-sizes="pageSizes" :page-size="pageSize" :loading="pending" :meta="meta" :sorting="sorting"
      :global-filter="search" :column-filters="columnFilters" title-btn-create="إضافة صلاحية"
      title-btn-icon="lucide:shield-plus" title-btn-edit="تعديل صلاحية" @update:page="onPageChange"
      @update:page-size="onPageSizeChange" @update:sorting="onSortingChange" @update:global-filter="onSearchGlobal"
      @update:column-filters="onColumnFiltersChange" />
  </div>
</template>

<style scoped>
.ring-default {
  --tw-ring-color: #00dc82 !important;
}

.rtl {
  direction: rtl;
}
</style>
