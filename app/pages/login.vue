<script setup lang="ts">
import type { LoginForm } from '~/schemas/auth.schema'
import { emptyLoginForm } from '~/types/auth'
import { useAuthStore } from '~/stores/auth/auth'

definePageMeta({
  layout: false,
  auth: false,
  middleware: 'guest' as any,
  title: 'تسجيل الدخول',
})

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const formModel = reactive<LoginForm>(emptyLoginForm())
const formRef = ref<{ submit: () => void } | null>(null)

const onSubmit = async (value: LoginForm) => {
  try {
    await authStore.login(value, toast)
    // Redirect to dashboard or return URL
    const returnUrl = router.currentRoute.value.query.returnUrl as string
    console.log(returnUrl);
    if (returnUrl) {
      await router.push(returnUrl)
    } else {
      await router.push('/')
    }
  } catch (error) {
    // Error is already handled in the store
    console.error('Login error:', error)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          تسجيل الدخول
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          أدخل بياناتك للوصول إلى النظام
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <FormsLoginForm
          ref="formRef"
          v-model="formModel"
          :loading="authStore.loading"
          @submit="onSubmit"
        />

        <div class="mt-6">
          <UButton
            label="تسجيل الدخول"
            color="primary"
            block
            :loading="authStore.loading"
            @click="formRef?.submit()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

