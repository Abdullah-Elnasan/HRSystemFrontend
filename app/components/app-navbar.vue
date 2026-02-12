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
      <div class="relative group">
        <UButton
          icon="i-lucide-log-out"
          color="error"
          variant="ghost"
          size="sm"
          :loading="authStore.loading"
          @click="handleLogout"
          aria-label="تسجيل الخروج"
          title="تسجيل الخروج"
        />
        <!-- <span
          class="absolute left-full mr-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50"
        >
          تسجيل الخروج
        </span> -->
      </div>
    </template>
  </UDashboardNavbar>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { useAuthStore } from '~/stores/auth/auth'

const route = useRoute()
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const title = computed<string>(() => {
  return typeof route.meta.title === 'string'
    ? route.meta.title
    : 'لوحة التحكم'
})

const handleLogout = async () => {
  try {
    await authStore.logout()
    // Redirect to login page
    await router.push('/login')
  } catch (error) {
    // Error is already handled in the store
    // Still redirect to login even if logout fails
    await router.push('/login')
  }
}

</script>
