<script setup lang="ts">
import { workScheduleSchema } from "~/schemas/work-schedule.schema";
import type { WorkScheduleForm } from "~/types/workSchedule";
import type { Field } from "~/components/generic-form.vue";
import { useFormModel } from "~/composables/useFormModel";

const props = defineProps<{
  modelValue: WorkScheduleForm;
  mode?: "create" | "edit";
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: WorkScheduleForm): void;
  (e: "submit", v: WorkScheduleForm): void;
}>();

const model = useFormModel(toRef(props, "modelValue"), emit);

const fields: Field<WorkScheduleForm>[] = [
  {
    name: "is_active",
    label: "",
    component: "switch",
    componentProps: {
      checkedIcon: "i-lucide-check",
      uncheckedIcon: "i-lucide-x",
      trueLabel: "نشط",
      falseLabel: "غير نشط",
    },
    colSpan: 2,
  },
  { name: "name_ar", label: "الاسم (عربي)" },
  // { name: "name_en", label: "الاسم (إنجليزي)" },
  // { name: "type", label: "النوع" },
  {
    name: "type",
    label: "النوع",
    colSpan: 1,
    component: "select",
    searchable: false,
    items: [
      {
        id: "fixed",
        type: "ثابت",
      },
      {
        id: "flexible",
        type: "مرن",
      },
      {},
    ],
    componentProps: {
      valueKey: "id",
      labelKey: "type",
      placeholder: "اختر نوع جدول العمل",
      icon: "uim:schedule",
    },
  },
  {
    name: "description_ar",
    label: "الوصف (عربي)",
    component: "textarea",
  },
  // {
  //   name: "description_en",
  //   label: "الوصف (إنجليزي)",
  //   component: "textarea",
  // },
];

const formRef = ref<{ submit: () => void } | null>(null);

defineExpose({
  submit: () => formRef.value?.submit(),
});
</script>

<template>
  <ClientOnly>
    <GenericForm
      ref="formRef"
      v-model="model"
      :schema="workScheduleSchema"
      :fields="fields"
      :loading="loading"
      :columns="columns"
      dir="rtl"
      @submit="emit('submit', $event)"
    />
  </ClientOnly>
</template>
