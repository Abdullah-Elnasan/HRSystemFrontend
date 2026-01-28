<template>
  <UDashboardNavbar
    :title="title"
    :portal="true"
    :toggle="{
      color: 'primary',
      variant: 'subtle',
      class: 'rounded-full',
    }"

  >
    <template #leading>
      <UDashboardSidebarCollapse
        variant="link"
        name="close"
        color="primary"
        :portal="true"
        />
        <!-- label="close" -->
    </template>



    <template #right>
      <UColorModeButton />
    </template>
  </UDashboardNavbar>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'

const route = useRoute()

const title = computed<string>(() => {
  return typeof route.meta.title === 'string'
    ? route.meta.title
    : 'لوحة التحكم'
})

</script>
