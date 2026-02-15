<script setup lang="ts">
import type { PayrollSystemForm } from "~/types/payrollSystem";
import type { Field } from "~/components/generic-form.vue";
import { useFormModel } from "~/composables/useFormModel";
import { payrollSystemSchema } from "~/schemas/payroll-system.schema";

/* ================== Props / Emits ================== */
const props = defineProps<{
  modelValue: PayrollSystemForm;
  mode?: "create" | "edit";
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: PayrollSystemForm): void;
  (e: "submit", v: PayrollSystemForm): void;
}>();

const model = useFormModel(toRef(props, "modelValue"), emit);

/* ================== Fields ================== */
const fields = computed<Field<PayrollSystemForm>[]>(() => [
  {
    name: "name",
    label: "اسم نظام الرواتب",
    colSpan: 2,
    componentProps: {
      placeholder: "أدخل اسم النظام",
      icon: "lucide:file-text",
      required: true,
    },
  },
  {
    name: "salary_type",
    label: "نوع الراتب",
    colSpan: 1,
    component: "select",
    items: [
      { id: "monthly", name_ar: "شهري" },
      { id: "hourly", name_ar: "بالساعة" },
    ],
    componentProps: {
      valueKey: "id",
      labelKey: "name_ar",
      placeholder: "اختر نوع الراتب",
      icon: "lucide:calendar",
      required: true,
    },
  },
  {
    name: "currency",
    label: "العملة",
    colSpan: 1,
    component: "select",
    items: [
      { id: "SAR", name_ar: "ريال سعودي (SAR)" },
      { id: "AED", name_ar: "درهم إماراتي (AED)" },
      { id: "EGP", name_ar: "جنيه مصري (EGP)" },
      { id: "USD", name_ar: "دولار أمريكي (USD)" },
      { id: "EUR", name_ar: "يورو (EUR)" },
      { id: "JOD", name_ar: "دينار أردني (JOD)" },
    ],
    componentProps: {
      valueKey: "id",
      labelKey: "name_ar",
      placeholder: "اختر العملة",
      icon: "lucide:banknote",
      required: true,
    },
  },
  {
    name: "monthly_salary",
    label: "الراتب الشهري",
    colSpan: 1,
    component: "input",
    componentProps: {
      type: "number",
      placeholder: "أدخل الراتب الشهري",
      icon: "lucide:wallet",
      min: 0,
      step: 0.01,
      disabled: model.value.salary_type !== "monthly",
    },
  },
  {
    name: "hourly_rate",
    label: "الأجر بالساعة",
    colSpan: 1,
    component: "input",
    componentProps: {
      type: "number",
      placeholder: "أدخل الأجر بالساعة",
      icon: "lucide:clock",
      min: 0,
      step: 0.01,
      disabled: model.value.salary_type !== "hourly",
    },
  },
  {
    name: "overtime_base_rate",
    label: "معامل الوقت الإضافي",
    colSpan: 1,
    component: "input",
    componentProps: {
      type: "number",
      placeholder: "أدخل معامل الوقت الإضافي",
      icon: "lucide:trending-up",
      min: 1,
      step: 0.1,
      required: true,
    },
  },
  {
    name: "deduct_missing_time",
    label: "خصم الوقت المفقود",
    colSpan: 1,
    component: "switch",
    componentProps: {
      trueLabel: "تفعيل الخصم",
      falseLabel: "إلغاء الخصم",
    },
  },
  {
    name: "is_active",
    label: "الحالة",
    colSpan: 1,
    component: "switch",
    componentProps: {
      trueLabel: "نشط",
      falseLabel: "غير نشط",
    },
  },
]);

/* ================== Watch salary_type ================== */
watch(
  () => model.value.salary_type,
  (newType) => {
    if (newType === "monthly") {
      model.value.hourly_rate = null;
    } else if (newType === "hourly") {
      model.value.monthly_salary = null;
    }
  },
);

/* ================== Expose ================== */
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
      :fields="fields"
      :schema="payrollSystemSchema"
      :loading="loading"
      :columns="props.columns ?? 2"
      @submit="emit('submit', $event)"
      dir="rtl"
    />
  </ClientOnly>
</template>
