<script setup lang="ts">
import { userGroupSchema } from "~/schemas/user-groups.schema";
import type { UserGroupForm } from "~/types/userGroups";
import type { Field } from "~/components/generic-form.vue";
import { useFormModel } from "~/composables/useFormModel";

const props = defineProps<{
  modelValue: UserGroupForm;
  mode?: "create" | "edit";
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: UserGroupForm): void;
  (e: "submit", v: UserGroupForm): void;
}>();

const model = useFormModel(toRef(props, "modelValue"), emit);

const fields: Field<UserGroupForm>[] = [
  {
    name: "name_ar",
    label: "الاسم (عربي)",
    colSpan: 2,
  },
  // {
  //   name: "name_en",
  //   label: "الاسم (إنجليزي)",
  //   colSpan: 2,
  // },
  {
    name: "description_ar",
    label: "الوصف (عربي)",
    component: "textarea",
    colSpan: 2,
  },
  // {
  //   name: "description_en",
  //   label: "الوصف (إنجليزي)",
  //   component: "textarea",
  //   colSpan: 2,
  // },
];

const formRef = ref<{
  submit: () => void;
} | null>(null);

defineExpose({
  submit: () => {
    formRef.value?.submit();
  },
});

const title = computed(() =>
  props.mode === "edit" ? "تعديل المجموعة" : "إضافة مجموعة"
);
</script>

<template>
  <ClientOnly>
    <GenericForm
      ref="formRef"
      v-model="model"
      :schema="userGroupSchema"
      :fields="fields"
      :loading="props.loading"
      :columns="props.columns"
      @submit="emit('submit', $event)"
      dir="rtl"
    />
  </ClientOnly>
</template>
