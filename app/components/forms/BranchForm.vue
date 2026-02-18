<script setup lang="ts">
import { branchSchema } from "~/schemas/branches.schema";
import type { BranchForm } from "~/types/branch";
import type { Field } from "~/components/generic-form.vue";
import { useFormModel } from "~/composables/useFormModel";
import { CalendarDate } from "@internationalized/date";

/* ================== Props / Emits ================== */
const props = defineProps<{
  modelValue: BranchForm;
  mode?: "create" | "edit";
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;
}>();
const config = useRuntimeConfig();
const { $api } = useNuxtApp();
const emit = defineEmits<{
  (e: "update:modelValue", v: BranchForm): void;
  (e: "submit", v: BranchForm): void;
}>();

const model = useFormModel(toRef(props, "modelValue"), emit);

/* ================== Date Helper ================== */
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

// const startsAtCalendar = computed({
//   get: () => stringToCalendarDate(model.value.starts_at),
//   set: (val) => (model.value.starts_at = val.toString()),
// });

/* ================== Fields ================== */
const baseFields: Field<BranchForm>[] = [
  { name: "name_ar", label: "الاسم (عربي)", colSpan: 1 },
  { name: "location_ar", label: "الموقع (عربي)", colSpan: 1 },
  {
    name: "description_ar",
    label: "الوصف (عربي)",
    component: "textarea",
    colSpan: 2,
  },
];

const createOnlyFields: Field<BranchForm>[] = [
  {
    name: "work_schedule_id",
    label: "نظام الدوام",
    colSpan: 1,
    component: "select-menu",
    searchable: true,
    items: [],
    searchApi: async (q: string) => {
      const res: any = await $api( `${config.public.apiBase}/api/work-schedules`, {
        params: { "filter[search]": q },
      });
      return res.data;
    },
    componentProps: {
      valueKey: "id",
      labelKey: "name_ar",
      placeholder: "اختر نظام الدوام",
      icon: "lucide:calendar-clock",
    },
  },
  {
    name: "payroll_system_id",
    label: "نظام الرواتب",
    colSpan: 1,
    component: "select-menu",
    searchable: true,
    items: [],
    searchApi: async (q: string) => {
      const res: any = await $fetch("/api/payroll-systems/payroll-systems", {
        params: { "filter[search]": q },
      });
      return res.data;
    },
    componentProps: {
      valueKey: "id",
      labelKey: "name",
      placeholder: "اختر نظام الرواتب",
      icon: "lucide:calendar-clock",
    },
  },
  // {
  //   name: "starts_at",
  //   label: "تاريخ تفعيل نظام الدوام",
  //   colSpan: 1,
  //   component: "custom",
  // },
];

const fields = computed<Field<BranchForm>[]>(() =>
  props.mode === "edit" ? baseFields : [...baseFields, ...createOnlyFields],
);

/* ================== Loading ================== */
const loadingWorkSchedules = ref(false);
const loadingfetchPayrollSystems = ref(false);

const fetchWorkSchedules = async () => {
  loadingWorkSchedules.value = true;
  const res: any = await $fetch("/api/work-schedules/work-schedules");
  const field = createOnlyFields.find((f) => f.name === "work_schedule_id");
  if (field) field.items = [...res.data];
  loadingWorkSchedules.value = false;
};

const fetchPayrollSystems = async () => {
  loadingfetchPayrollSystems.value = true;
  const res: any = await $fetch("/api/payroll-systems/payroll-systems");
  const field = createOnlyFields.find((f) => f.name === "payroll_system_id");
  if (field) {
    field.items = [...res.data];
  }
  loadingfetchPayrollSystems.value = false;
};

/* ================== Expose ================== */
const formRef = ref<{ submit: () => void } | null>(null);
defineExpose({
  submit: () => formRef.value?.submit(),
});

// defineExpose({
//   submit: async () => {
//     await nextTick()
//     formRef.value!.submit()
//   }
// })

fetchWorkSchedules();
fetchPayrollSystems();
</script>
<template>
  <ClientOnly>
    <GenericForm
      ref="formRef"
      v-model="model"
      :schema="branchSchema"
      :fields="fields"
      :loading="loading"
      :columns="props.columns"
      :select-loading="{
        work_schedule_id: loadingWorkSchedules,
        payroll_system_id: loadingfetchPayrollSystems,
      }"
      @submit="emit('submit', $event)"
      dir="rtl"
    >
      <!-- تاريخ تفعيل نظام الدوام -->
      <!-- <template #field-starts_at>
        <UInputDate v-model="startsAtCalendar">
          <template #trailing>
            <UPopover>
              <UButton
                icon="i-lucide-calendar"
                size="sm"
                variant="link"
              />
              <template #content>
                <UCalendar v-model="startsAtCalendar" class="p-2" />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </template> -->
    </GenericForm>
  </ClientOnly>
</template>
