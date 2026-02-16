<script setup lang="ts">
import type { PayrollAssignmentForm } from "~/types/payrollAssignments";
import { payrollAssignmentSchema } from "~/schemas/payroll-assignment.schema";
import type { Field } from "~/components/generic-form.vue";
import { useFormModel } from "~/composables/useFormModel";
import { CalendarDate } from "@internationalized/date";

/* ================== Props / Emits ================== */
const props = defineProps<{
  modelValue: PayrollAssignmentForm;
  mode?: "create" | "edit";
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: PayrollAssignmentForm): void;
  (e: "submit", v: PayrollAssignmentForm): void;
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

const effectiveFromCalendar = computed({
  get: () => stringToCalendarDate(model.value.effective_from),
  set: (v) => (model.value.effective_from = v.toString()),
});

const effectiveToCalendar = computed({
  get: () => stringToCalendarDate(model.value.effective_to),
  set: (v) => (model.value.effective_to = v.toString()),
});

/* ================== Loading ================== */
const loadingAssignables = ref(false);
const loadingPayrollSystems = ref(false);

/* ================== Reactive Items ================== */
const assignableItems = ref<any[]>([]);
const payrollSystemItems = ref<any[]>([]);

/* ================== API ================== */
const fetchAssignables = async () => {
  if (!model.value.assignable_type) return [];

  loadingAssignables.value = true;

  const endpoint =
    model.value.assignable_type === "App\\Models\\Employee\\Employee"
      ? "/api/_nuxt-api/employees/employees"
      : "/api/branches/branches";

  const res: any = await $fetch(endpoint);
  loadingAssignables.value = false;

  return res.data ?? [];
};

const searchAssignables = async (q: string) => {
  if (!model.value.assignable_type) return [];

  loadingAssignables.value = true;

  const endpoint =
    model.value.assignable_type === "App\\Models\\Employee\\Employee"
      ? "/api/_nuxt-api/employees/employees"
      : "/api/branches/branches";

  const res: any = await $fetch(endpoint, {
    params: { "filter[search]": q },
  });

  loadingAssignables.value = false;
  return res.data ?? [];
};

const fetchPayrollSystems = async () => {
  loadingPayrollSystems.value = true;
  const res: any = await $fetch("/api/payroll-systems/payroll-systems");
  payrollSystemItems.value = res.data ?? [];
  loadingPayrollSystems.value = false;
};

fetchPayrollSystems();

/* ================== Fields ================== */
const assignableTypeField: Field<PayrollAssignmentForm> = {
  name: "assignable_type",
  label: "نوع الإسناد",
  component: "select",
  items: [
    {
      id: "App\\Models\\Employee\\Employee",
      name_ar: "موظف",
    },
    {
      id: "App\\Models\\Branch\\Branch",
      name_ar: "فرع",
    },
  ],
  componentProps: {
    valueKey: "id",
    labelKey: "name_ar",
    placeholder: "اختر نوع الإسناد",
  },
};

const assignableIdField = computed<Field<PayrollAssignmentForm>>(() => ({
  name: "assignable_id",
  label: "الاسم",
  component: "select-menu",
  searchable: true,
  items: assignableItems.value,
  searchApi: searchAssignables,
  componentProps: {
    valueKey: "id",
    labelKey:
      model.value.assignable_type === "App\\Models\\Employee\\Employee"
        ? "full_name"
        : "name_ar",
    placeholder: "اختر من القائمة",
    disabled: !model.value.assignable_type,
  },
}));

const payrollSystemIdField = computed<Field<PayrollAssignmentForm>>(() => ({
  name: "payroll_system_id",
  label: "نظام الرواتب",
  component: "select-menu",
  searchable: true,
  items: payrollSystemItems.value,
  searchApi: async (q: string) => {
    const res: any = await $fetch("/api/payroll-systems/payroll-systems", {
      params: { "filter[search]": q },
    });
    return res.data ?? [];
  },
  componentProps: {
    valueKey: "id",
    labelKey: "name",
    placeholder: "اختر نظام الرواتب",
  },
}));

const effectiveFromField: Field<PayrollAssignmentForm> = {
  name: "effective_from",
  label: "تاريخ السريان",
  component: "custom",
};

const effectiveToField: Field<PayrollAssignmentForm> = {
  name: "effective_to",
  label: "تاريخ الانتهاء",
  component: "custom",
};

const fields = computed<Field<PayrollAssignmentForm>[]>(() => {
  const baseFields: Field<PayrollAssignmentForm>[] = [
    payrollSystemIdField.value,
    effectiveFromField,
    effectiveToField,
  ];

  // في الإنشاء فقط
  if (props.mode !== "edit") {
    return [assignableTypeField, assignableIdField.value, ...baseFields];
  }

  // في التعديل
  return baseFields;
});

/* ================== Watch assignable_type ================== */
watch(
  () => model.value.assignable_type,
  async (type) => {
    model.value.assignable_id = null;
    assignableItems.value = [];

    if (!type) return;

    assignableItems.value = await fetchAssignables();
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
      :schema="payrollAssignmentSchema"
      :loading="loading"
      :columns="columns"
      :select-loading="{
        assignable_id: loadingAssignables,
        payroll_system_id: loadingPayrollSystems,
      }"
      @submit="emit('submit', $event)"
      dir="rtl"
    >
      <!-- تاريخ السريان -->
      <template #field-effective_from>
        <UInputDate v-model="effectiveFromCalendar">
          <template #trailing>
            <UPopover>
              <UButton icon="i-lucide-calendar" size="sm" variant="link" />
              <template #content>
                <UCalendar v-model="effectiveFromCalendar" class="p-2" />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </template>

      <!-- تاريخ الانتهاء -->
      <template #field-effective_to>
        <UInputDate v-model="effectiveToCalendar">
          <template #trailing>
            <UPopover>
              <UButton icon="i-lucide-calendar" size="sm" variant="link" />
              <template #content>
                <UCalendar v-model="effectiveToCalendar" class="p-2" />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </template>
    </GenericForm>
  </ClientOnly>
</template>
