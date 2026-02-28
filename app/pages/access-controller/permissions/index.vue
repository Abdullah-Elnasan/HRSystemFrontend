<script setup lang="ts">
import { generateColumns } from '~/utils/generateColumns'
import type { Permission } from '~/types/permission'
import { usePermissions } from '~/composables/permissions/usePermissions'

const UButton = resolveComponent('UButton')

definePageMeta({
  layout: 'dashboard',
  title: 'إدارة الصلاحيات',
  keepalive: false,
})

/* ================== Data ================== */
const {
  permissions,
  pagination,
  loading,
  page,
  pageSize,
  search,
  setPage,
  setPageSize,
  setSearch,
  fetchPermissions,
} = usePermissions()

/* ================== Table ================== */
const PAGE_SIZES: number[] = [10, 50, 100]

const firstLoad     = ref(true)
const sorting       = ref<any[]>([])
const columnFilters = ref<any[]>([])

const safePagination = computed(() => ({
  total:        pagination.value?.total        ?? 0,
  per_page:     pagination.value?.per_page     ?? pageSize.value,
  current_page: pagination.value?.current_page ?? page.value,
  last_page:    pagination.value?.last_page    ?? 1,
}))

const tableMeta = {
  class: {
    tr: () => 'bg-white dark:bg-gray-900 shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow',
  },
}

// ─── Enhanced Permissions ─────────────────────────────
const enhancedPermissions = computed(() =>
  permissions.value?.map(p => ({
    ...p,
    // permission_group_name: p.group.name_ar,
  })) ?? []
)

// ─── Multi-Select State ───────────────────────────────
const selectedPermissions = ref<number[]>([])

const isAllSelected = computed(() =>
  enhancedPermissions.value.length > 0 &&
  selectedPermissions.value.length === enhancedPermissions.value.length
)

function toggleSelect(id: number, checked: boolean) {
  if (checked) {
    selectedPermissions.value.push(id)
  } else {
    selectedPermissions.value = selectedPermissions.value.filter(i => i !== id)
  }
}

function selectAll() {
  if (isAllSelected.value) {
    selectedPermissions.value = []
  } else {
    selectedPermissions.value = enhancedPermissions.value.map(p => p.id)
  }
}

// ─── Columns ──────────────────────────────────────────
const columns = computed(() => {
  const baseColumns = enhancedPermissions.value.length
    ? generateColumns<any>(
        enhancedPermissions.value,
        {
          labels: {
            code:                  'الكود',
            name_ar:               'الاسم (عربي)',
            name_en:               'الاسم (إنجليزي)',
            description_ar:        'الوصف (عربي)',
            description_en:        'الوصف (إنجليزي)',
            permission_group_name: 'مجموعة الصلاحيات',
          },
          exclude: ['group', 'created_at', 'action', 'updated_at'],
          columns: {
            code:                  { filterable: true },
            name_ar:               { filterable: true },
            name_en:               { filterable: true },
            description_ar:        { hidden: true },
            description_en:        { hidden: true },
            permission_group_name: { filterable: true },
            action:                { hideable: false },
          },
        },
        UButton
      )
    : []

  return [
    {
      accessorKey:   'select',
      header:        '',
      enableHiding:  false,
      enableSorting: false,
      size:          50,
      cell: ({ row }: any) =>
        h('input', {
          type:    'checkbox',
          checked: selectedPermissions.value.includes(row.original.id),
          class:   'w-4 h-4 cursor-pointer',
          onChange: (e: Event) => {
            toggleSelect(row.original.id, (e.target as HTMLInputElement).checked)
          },
        }),
    },
    ...baseColumns,
  ]
})

/* ================== Assign Dialog ================== */
const assignDialogOpen  = ref(false)
const currentOperation  = ref('assign')
const toast             = useToast()

function openAssignDialog() {
  if (selectedPermissions.value.length === 0) {
    toast.add({
      title:       'تنبيه',
      description: 'يرجى اختيار صلاحية واحدة على الأقل',
      color:       'warning',
    })
    return
  }
  assignDialogOpen.value = true
}

function closeAssignDialog() {
  assignDialogOpen.value = false
}

function handleAssignComplete() {
  selectedPermissions.value = []
}

/* ================== Lifecycle ================== */
onMounted(() => fetchPermissions())

watch(
  permissions,
  (val) => { if (val?.length) firstLoad.value = false },
  { immediate: true }
)
</script>

<template>
  <!-- أول تحميل -->
  <div v-if="firstLoad && loading" class="flex items-center justify-center py-20">
    <span class="text-muted text-lg">جارٍ التحميل...</span>
  </div>

  <div v-else class="space-y-4">
    <!-- Toolbar المخصص -->
    <div class="flex items-center justify-between gap-4" dir="rtl">
      <div class="flex items-center gap-2">

        <!-- زر إسناد الصلاحيات -->
        <UModal
          v-model:open="assignDialogOpen"
          title="إسناد الصلاحيات"
          :description="`تم تحديد ${selectedPermissions.length} صلاحية`"
          icon="i-lucide-user-plus"
          :ui="{ header: 'rtl' }"
          :close="{ color: 'primary', variant: 'outline', class: 'rounded-full' }"
        >
          <UButton
            v-if="selectedPermissions.length > 0"
            color="primary"
            icon="i-lucide-user-plus"
            @click="openAssignDialog"
          >
            إسناد الصلاحيات ({{ selectedPermissions.length }})
          </UButton>

          <template #body>
            <FormsAccessControllerPermissionsassigndialog
              :permission-ids="selectedPermissions"
              @update:open="closeAssignDialog"
              @update:operation="currentOperation = $event"
              @success="handleAssignComplete"
            />
          </template>
        </UModal>

        <!-- زر تحديد الكل -->
        <UButton
          v-if="enhancedPermissions.length > 0"
          variant="outline"
          :icon="isAllSelected ? 'i-lucide-square-check' : 'i-lucide-square-dashed'"
          @click="selectAll"
        >
          {{ isAllSelected ? 'إلغاء الكل' : 'تحديد الكل' }}
        </UButton>
      </div>

      <!-- عداد المحددين -->
      <div v-if="selectedPermissions.length > 0" class="text-sm text-muted">
        تم تحديد {{ selectedPermissions.length }} من {{ enhancedPermissions.length }} صلاحية
      </div>
    </div>

    <!-- الجدول -->
    <AppTable
      :columns="columns"
      :data="enhancedPermissions"
      :total="safePagination.total"
      :page="page"
      :page-sizes="PAGE_SIZES"
      :page-size="pageSize"
      :loading="loading"
      :meta="tableMeta"
      :sorting="sorting"
      :global-filter="search"
      :column-filters="columnFilters"
      title-btn-create="إضافة صلاحية"
      title-btn-icon="lucide:shield-plus"
      title-btn-edit="تعديل صلاحية"
      @update:page="setPage"
      @update:page-size="setPageSize"
      @update:sorting="sorting = $event"
      @update:global-filter="setSearch"
      @update:column-filters="columnFilters = $event"
    />
  </div>
</template>

<style scoped>
.ring-default { --tw-ring-color: #00dc82 !important; }
.rtl { direction: rtl; }
</style>
