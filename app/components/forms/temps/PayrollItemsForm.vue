

<script setup lang="ts">
import type { PayrollItemForm } from "~/types/payrolls/payrollItem";
import type { Field } from "~/components/generic-form.vue";
import { useFormModel } from "~/composables/useFormModel";
import { CalendarDate } from "@internationalized/date";

/* ================== Props / Emits ================== */
const props = defineProps<{
  modelValue: PayrollItemForm;
  mode?: "create" | "edit";
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: PayrollItemForm): void;
  (e: "submit", v: PayrollItemForm): void;
}>();

const model = useFormModel(toRef(props, "modelValue"), emit);

/* ================== Date Helpers ================== */
const stringToCalendarDate = (
  dateString: string | null | undefined,
): CalendarDate => {
  if (dateString) {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const day = Number(parts[2]);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new CalendarDate(year, month, day);
      }
    }
  }
  // القيمة الافتراضية
  return new CalendarDate(2022, 1, 10);
};

const periodStartCalendar = computed({
  get: () => stringToCalendarDate(model.value.period_start),
  set: (val) => (model.value.period_start = val.toString()),
});

const periodEndCalendar = computed({
  get: () => stringToCalendarDate(model.value.period_end),
  set: (val) => (model.value.period_end = val.toString()),
});

/* ================== Auto Calculate Total ================== */
watch(
  [
    () => model.value.base_amount,
    () => model.value.overtime_amount,
    () => model.value.manual_adjustment,
  ],
  ([base, overtime, adjustment]) => {
    model.value.total_amount =
      (base || 0) + (overtime || 0) + (adjustment || 0);
  },
);

/* ================== Loading States ================== */
const loadingEmployees = ref(false);
const loadingPayrollRuns = ref(false);

/* ================== Fields ================== */
const payrollRunIdField: Field<PayrollItemForm> = {
  name: "payroll_run_id",
  label: "دورة الرواتب",
  colSpan: 1,
  component: "select-menu",
  searchable: true,
  items: [],
  searchApi: async (q: string) => {
    const res: any = await $fetch("/api/payroll-runs", {
      params: { "filter[search]": q },
    });
    return res.data;
  },
  componentProps: {
    valueKey: "id",
    labelKey: "name",
    placeholder: "اختر دورة الرواتب",
    icon: "lucide:file-spreadsheet",
  },
};

const employeeIdField: Field<PayrollItemForm> = {
  name: "employee_id",
  label: "الموظف",
  colSpan: 1,
  component: "select-menu",
  searchable: true,
  items: [],
  searchApi: async (q: string) => {
    const res: any = await $fetch("/api/_nuxt-api/employees/employees", {
      params: { "filter[search]": q },
    });
    return res.data;
  },
  componentProps: {
    valueKey: "id",
    labelKey: "name_ar",
    placeholder: "اختر الموظف",
    icon: "lucide:user",
  },
};

const fields = computed<Field<PayrollItemForm>[]>(() => [
  payrollRunIdField,
  employeeIdField,
  {
    name: "period_start",
    label: "بداية الفترة",
    colSpan: 1,
    component: "custom",
  },
  {
    name: "period_end",
    label: "نهاية الفترة",
    colSpan: 1,
    component: "custom",
  },
  {
    name: "base_amount",
    label: "المبلغ الأساسي",
    colSpan: 1,
    component: "input",
    componentProps: {
      type: "number",
      placeholder: "أدخل المبلغ الأساسي",
      icon: "lucide:banknote",
      min: 0,
      step: 0.01,
    },
  },
  {
    name: "overtime_amount",
    label: "مبلغ العمل الإضافي",
    colSpan: 1,
    component: "input",
    componentProps: {
      type: "number",
      placeholder: "أدخل مبلغ العمل الإضافي",
      icon: "lucide:clock-alert",
      min: 0,
      step: 0.01,
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
      icon: "lucide:coins",
      required: true,
    },
  },
  {
    name: "manual_adjustment",
    label: "التعديل اليدوي",
    colSpan: 1,
    component: "input",
    componentProps: {
      type: "number",
      placeholder: "أدخل التعديل اليدوي",
      icon: "lucide:hand",
      step: 0.01,
    },
  },
  {
    name: "adjustment_note",
    label: "ملاحظة التعديل",
    colSpan: 2,
    component: "textarea",
    componentProps: {
      placeholder: "أدخل ملاحظة التعديل",
      rows: 3,
    },
  },
  {
    name: "total_amount",
    label: "المبلغ الإجمالي",
    colSpan: 2,
    component: "input",
    componentProps: {
      type: "number",
      placeholder: "المبلغ الإجمالي (محسوب تلقائياً)",
      icon: "lucide:receipt",
      disabled: true,
      step: 0.01,
    },
  },
]);

/* ================== Fetch Initial Data ================== */
const fetchPayrollRuns = async () => {
  loadingPayrollRuns.value = true;
  const res: any = await $fetch("/api/payroll-runs");
  payrollRunIdField.items = [...res.data];
  loadingPayrollRuns.value = false;
};

const fetchEmployees = async () => {
  loadingEmployees.value = true;
  const res: any = await $fetch("/api/_nuxt-api/employees/employees");
  employeeIdField.items = [...res.data];
  loadingEmployees.value = false;
};

/* ================== Expose ================== */
const formRef = ref<{ submit: () => void } | null>(null);
defineExpose({
  submit: () => formRef.value?.submit(),
});

fetchPayrollRuns();
fetchEmployees();
</script>

<template>
  <ClientOnly>
    <GenericForm
      ref="formRef"
      v-model="model"
      :fields="fields"
      :loading="loading"
      :columns="props.columns ?? 2"
      :select-loading="{
        payroll_run_id: loadingPayrollRuns,
        employee_id: loadingEmployees,
      }"
      @submit="emit('submit', $event)"
      dir="rtl"
    >
      <!-- بداية الفترة -->
      <template #field-period_start>
        <UInputDate v-model="periodStartCalendar">
          <template #trailing>
            <UPopover>
              <UButton icon="i-lucide-calendar" size="sm" variant="link" />
              <template #content>
                <UCalendar v-model="periodStartCalendar" class="p-2" />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </template>

      <!-- نهاية الفترة -->
      <template #field-period_end>
        <UInputDate v-model="periodEndCalendar">
          <template #trailing>
            <UPopover>
              <UButton icon="i-lucide-calendar" size="sm" variant="link" />
              <template #content>
                <UCalendar v-model="periodEndCalendar" class="p-2" />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </template>
    </GenericForm>
  </ClientOnly>
</template>
