<template>
  <UDashboardNavbar
    title="الصفحة الرئيسية"
    icon="i-lucide-house"
    :toggle="{
      color: 'secondary',
      variant: 'subtle',
      class: 'rounded-full'
    }"
    right="true"
  />

  <!-- <template #right>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
    </template>

    <template #left>
      <UColorModeButton />

    
    </template> -->


    <!-- <DataTable
  :columns="columns"
  :data="rows"
  :total="total"
  :status-map="statusMap"
  :filterable-columns="filterableColumns"
  :search-column="searchColumn"
  :pinnable-columns="pinnableColumns"
  :initial-visibility="columnVisibility"
  :page="page"
  :page-size="pageSize"
  @update:page
  @update:page-size
  @filter
  @sort
/> -->

</template>


<!-- const page = ref(1)
const pageSize = ref(10)

const columns: DataTableColumn<User>[] = [
  { accessorKey: 'id', header: 'ID', hiddenByDefault: true },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email', filterable: true },
  { accessorKey: 'status', header: 'Status' },
]

const statusMap = {
  active: { label: 'Active', color: 'success' },
  blocked: { label: 'Blocked', color: 'error' },
}

function onFilter({ column, value }) {
  fetchUsers({ page: page.value, pageSize: pageSize.value, [column]: value })
} -->

