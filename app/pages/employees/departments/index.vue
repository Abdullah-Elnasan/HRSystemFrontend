<script setup lang="ts">
import { generateColumns } from '~/utils/generateColumns'
import type { Department, DepartmentForm } from '~/types/deparment'
import { useDepartments } from '~/composables/departments/useDepartments'
import { useDepartmentDrawer } from '~/composables/departments/useDepartmentDrawer'
import { useDepartmentActions } from '~/composables/departments/useDepartmentActions'

const UButton = resolveComponent('UButton')

definePageMeta({
  layout: 'dashboard',
  title: 'إدارة الأقسام',
  keepalive: false,
})

/* ================== Data ================== */
const {
  departments,
  pagination,
  loading,
  page,
  pageSize,
  search,
  setPage,
  setPageSize,
  setSearch,
  fetchDepartments,
} = useDepartments()

/* ================== Drawer ================== */
const drawer = useDepartmentDrawer()

/* ================== Form Ref ================== */
const formRef = ref<{ submit: () => void } | null>(null)

/* ================== Actions ================== */
const { submit, remove } = useDepartmentActions(drawer.close)

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
  departments.value?.length
    ? generateColumns<Department>(
        departments.value,
        {
          labels: {
            name_ar:                'الاسم',
            description_ar:         'الوصف',
            employees_count:        'عدد الموظفين',
            active_employees_count: 'عدد الموظفين النشطين',
            action:                 'العمليات',
          },
          exclude: ['name_en', 'description_en', 'created_at', 'updated_at'],
          columns: {
            name_ar:        { filterable: true },
            description_ar: { hidden: true },
            action:         { hideable: false },
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
onMounted(() => fetchDepartments())

watch(
  departments,
  (val) => { if (val?.length) firstLoad.value = false },
  { immediate: true }
)

/* ================== Handlers ================== */
const onSubmit = (_value: Partial<DepartmentForm>) =>
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
    :data="departments ?? []"
    :total="safePagination.total"
    :page="page"
    :page-sizes="PAGE_SIZES"
    :page-size="pageSize"
    :loading="loading"
    :meta="tableMeta"
    :sorting="sorting"
    :global-filter="search"
    :column-filters="columnFilters"
    title-btn-create="إضافة قسم"
    title-btn-icon="material-symbols:group-add-outline-rounded"
    title-btn-edit="تعديل قسم"
    :btn-create="true"
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
        <FormsDepartmentForm
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
