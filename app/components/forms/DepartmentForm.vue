<script setup lang="ts">
import { departmentSchema } from "~/schemas/department.schema"
import type { DepartmentForm } from "~/schemas/department.schema"
import type { Field } from "~/components/generic-form.vue"
import { useFormModel } from "~/composables/useFormModel"

const props = defineProps<{
  modelValue: DepartmentForm
  mode?: "create" | "edit"
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: "update:modelValue", v: DepartmentForm): void
  (e: "submit", v: DepartmentForm): void
}>()

const model = useFormModel(
  toRef(props, "modelValue"),
  emit,
)

const fields: Field<DepartmentForm>[] = [
  {
    name: "name_ar",
    label: "الاسم (عربي)",
    colSpan: 2,
  },
  {
    name: "description_ar",
    label: "الوصف (عربي)",

    component: "textarea",
    colSpan: 2,
  }
]


const formRef = ref<{
  submit: () => void
} | null>(null)


defineExpose({
  submit: () => {
    formRef.value?.submit()
  }
})

const title = computed(() =>
  props.mode === "edit" ? "تعديل قسم" : "إضافة قسم",
)
</script>

<template>
  <ClientOnly>
    <GenericForm ref="formRef" v-model="model" :schema="departmentSchema" :fields="fields" :loading="loading"
      @submit="emit('submit', $event)" dir="rtl" />
  </ClientOnly>
</template>
