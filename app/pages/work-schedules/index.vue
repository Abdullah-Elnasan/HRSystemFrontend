<script setup lang="ts">
import { generateColumns } from '~/utils/generateColumns'
import type { WorkSchedule, WorkScheduleForm } from '~/types/workSchedule'
import { useWorkSchedules } from '~/composables/workSchedule/useWorkSchedules'
import { useWorkScheduleDrawer } from '~/composables/workSchedule/useWorkScheduleDrawer'
import { useWorkScheduleActions } from '~/composables/workSchedule/useWorkScheduleActions'

const UButton = resolveComponent('UButton')

definePageMeta({
  layout: 'dashboard',
  title: 'إدارة جداول العمل',
  keepalive: false,
})

/* ================== Data ================== */
const {
  workSchedules,
  pagination,
  loading,
  page,
  pageSize,
  search,
  setPage,
  setPageSize,
  setSearch,
  fetchWorkSchedules,
} = useWorkSchedules()

/* ================== Drawer ================== */
const drawer = useWorkScheduleDrawer()

/* ================== Form Ref ================== */
const formRef = ref<{ submit: () => void } | null>(null)

/* ================== Actions ================== */
const { submit, remove } = useWorkScheduleActions(drawer.close)

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

const columns = computed(() =>
  workSchedules.value?.length
    ? generateColumns<WorkSchedule>(
        workSchedules.value,
        {
          labels: {
            name_ar:   'الاسم',
            type:      'النوع',
            is_active: 'فعال',
            action:    'العمليات',
          },
          exclude: [
            'name_en', 'description_en', 'description_ar',
            'rules', 'created_at', 'updated_at',
            'fixed_rules', 'flexible_rules',
          ],
          columns: {
            name_ar:   { filterable: true },
            type:      { filterable: true, type: 'status' },
            is_active: { filterable: true, type: 'status' },
            action:    { hideable: false },
          },
        },
        UButton
      )
    : []
)

const tableMeta = {
  class: {
    tr: (row: any) =>
      row.original.is_active === false
        ? 'bg-error/10 shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow'
        : 'bg-white dark:bg-gray-900 shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow',
  },
}

const statusMap: Record<string, { label: string; color: string }> = {
  fixed:    { label: 'ثابت',     color: 'success' },
  flexible: { label: 'مرن',      color: 'info'    },
  false:    { label: 'غير فعال', color: 'error'   },
  true:     { label: 'فعال',     color: 'success' },
}

/* ================== Lifecycle ================== */
onMounted(() => fetchWorkSchedules())

watch(
  workSchedules,
  (val) => { if (val?.length) firstLoad.value = false },
  { immediate: true }
)

/* ================== Handlers ================== */
const onSubmit = (_value: Partial<WorkScheduleForm>) =>
  submit(drawer.editingId.value, { ...drawer.formModel })

function submitForm() {
  formRef.value?.submit()
}
</script>

<template>
  <!-- أول تحميل -->
  <div v-if="firstLoad && loading" class="flex items-center justify-center py-20">
    <span class="text-muted text-lg">جارٍ التحميل...</span>
  </div>

  <!-- الجدول -->
  <AppTable
    v-else
    :columns="columns"
    :data="workSchedules ?? []"
    :total="safePagination.total"
    :page="page"
    :page-sizes="PAGE_SIZES"
    :page-size="pageSize"
    :loading="loading"
    :meta="tableMeta"
    :status-map="statusMap"
    :sorting="sorting"
    :global-filter="search"
    :column-filters="columnFilters"
    :btn-create="true"
    title-btn-create="إضافة جدول دوام"
    title-btn-icon="material-symbols:group-add-outline-rounded"
    title-btn-edit="تعديل جدول الدوام"
    @update:page="setPage"
    @update:page-size="setPageSize"
    @update:sorting="sorting = $event"
    @update:global-filter="setSearch"
    @update:column-filters="columnFilters = $event"
    @delete:row="remove"
    @drower:open="drawer.open"
    @update:data="drawer.open"
  />

  <!-- Drawer -->
  <ClientOnly>
    <UDrawer
      v-model:open="drawer.isOpen.value"
      direction="left"
      :title="drawer.title.value"
      :ui="{
        body:    'drower space-y-5 pt-0',
        header:  'hidden',
        title:   'text-primary',
        overlay: 'bg-primary/10',
        content: 'shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] ps-2 min-w-200',
      }"
    >
      <template #body>
        <!-- Header -->
        <div class="flex items-center justify-end gap-2">
          <h2 class="text-highlighted font-semibold">{{ drawer.title.value }}</h2>
          <UIcon
            :name="drawer.mode.value === 'edit'
              ? 'solar:pen-new-round-linear'
              : 'ic:baseline-control-point-duplicate'"
            class="size-5"
          />
        </div>

        <!-- Form -->
        <FormsWorkScheduleForm
          ref="formRef"
          v-model="drawer.formModel"
          :mode="drawer.mode.value"
          @submit="onSubmit"
        />
      </template>

      <template #footer>
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
