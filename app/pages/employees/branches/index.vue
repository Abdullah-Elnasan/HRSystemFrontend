<script setup lang="ts">
import { generateColumns } from '~/utils/generateColumns'
import type { Branch, BranchForm } from '~/types/branch'
import { useBranches } from '~/composables/branches/useBranshes'
import { useBranchDrawer } from '~/composables/branches/useBranchDrawer'
import { useBranchActions } from '~/composables/branches/useBranchActions'

const UButton = resolveComponent('UButton')

definePageMeta({
  layout: 'dashboard',
  title: 'إدارة الأفرع',
  keepalive: false,
})

/* ================== Data ================== */
const {
  branches,
  pagination,
  loading,
  page,
  pageSize,
  search,
  setPage,
  setPageSize,
  setSearch,
  fetchBranches,
} = useBranches()

/* ================== Drawer ================== */
const drawer = useBranchDrawer()

/* ================== Form Ref ================== */
const formRef = ref<{ submit: () => void } | null>(null)

/* ================== Actions ================== */
const { submit, remove } = useBranchActions(drawer.close)

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
  branches.value?.length
    ? generateColumns<Branch>(
        branches.value,
        {
          labels: {
            name_ar:                'الاسم',
            description_ar:         'الوصف',
            location_ar:            'الموقع',
            current_work_schedule:  'نظام الدوام الحالي',
            upcoming_work_schedule: 'نظام الدوام القادم',
            payroll_system:         'نظام الرواتب',
            employees_count:        'عدد الموظفين',
            active_employees_count: 'عدد الموظفين النشطين',
            action:                 'العمليات',
          },
          exclude: ['name_en', 'description_en', 'location_en', 'created_at', 'updated_at'],
          columns: {
            name_ar:                { filterable: true },
            description_ar:         { hidden: true },
            location_ar:            { hidden: true },
            action:                 { hideable: false },
            current_work_schedule:  { type: 'object', valueKey: 'name_ar' },
            upcoming_work_schedule: { type: 'object', valueKey: 'name_ar' },
            payroll_system:         { type: 'object', valueKey: 'name' },
          },
        },
        UButton
      )
    : []
)

const tableMeta = {
  class: {
    tr: () => 'bg-white dark:bg-gray-900 shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow',
  },
}

/* ================== Lifecycle ================== */
onMounted(() => fetchBranches())

watch(
  branches,
  (val) => { if (val?.length) firstLoad.value = false },
  { immediate: true }
)

/* ================== Handlers ================== */
const onSubmit = (_value: Partial<BranchForm>) =>
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
    :data="branches ?? []"
    :total="safePagination.total"
    :page="page"
    :page-sizes="PAGE_SIZES"
    :page-size="pageSize"
    :loading="loading"
    :meta="tableMeta"
    :sorting="sorting"
    :global-filter="search"
    :column-filters="columnFilters"
    :btn-create="true"
    title-btn-create="إضافة فرع"
    title-btn-icon="material-symbols:group-add-outline-rounded"
    title-btn-edit="تعديل فرع"
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
        overlay: 'bg-green-400/30',
        content: 'shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] ps-2',
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
        <FormsBranchForm
          ref="formRef"
          v-model="drawer.formModel"
          :mode="drawer.mode.value"
          :columns="1"
          class="min-w-150 items-start"
          @submit="onSubmit"
        />
      </template>

      <template #footer>
        <UButton
          label="إرسال"
          color="neutral"
          class="justify-center"
          @click="submitForm()"
        />
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

<style scoped>
.ring-default { --tw-ring-color: #00dc82 !important; }
</style>
