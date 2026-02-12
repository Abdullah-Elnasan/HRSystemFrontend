<script setup lang="ts">
import { loginSchema } from '~/schemas/auth.schema'
import type { LoginForm } from '~/schemas/auth.schema'
import type { Field } from '~/components/generic-form.vue'
import { useFormModel } from '~/composables/useFormModel'

const props = defineProps<{
  modelValue: LoginForm
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: LoginForm): void
  (e: 'submit', v: LoginForm): void
}>()

const model = useFormModel(
  toRef(props, 'modelValue'),
  emit,
)

const fields: Field<LoginForm>[] = [
  {
    name: 'email',
    label: 'البريد الإلكتروني',
    component: 'input',
    componentProps: {
      type: 'email',
      required: true,
    },
    colSpan: 2,
  },
  {
    name: 'password',
    label: 'كلمة المرور',
    component: 'input',
    componentProps: {
      type: 'password',
      required: true,
    },
    colSpan: 2,
  },
]

const formRef = ref<{
  submit: () => void
} | null>(null)

defineExpose({
  submit: () => {
    formRef.value?.submit()
  },
})
</script>

<template>
  <ClientOnly>
    <GenericForm
      ref="formRef"
      v-model="model"
      :schema="loginSchema"
      :fields="fields"
      :loading="loading"
      :columns="1"
      @submit="emit('submit', $event)"
      dir="rtl"
    />
  </ClientOnly>
</template>

