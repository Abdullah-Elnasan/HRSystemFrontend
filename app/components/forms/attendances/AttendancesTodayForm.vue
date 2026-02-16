<script setup lang="ts">
import type { AttendanceTodayForm } from "~/types/attendanceToday";
import type { Field } from "~/components/generic-form.vue";
import { useFormModel } from "~/composables/useFormModel";
import { CalendarDate } from "@internationalized/date";
import { attendanceTodaySchema } from "~/schemas/attendance-today.schema";
/* ================== Props / Emits ================== */
const props = defineProps<{
  modelValue: AttendanceTodayForm;
  mode?: "create" | "edit";
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: AttendanceTodayForm): void;
  (e: "submit", v: AttendanceTodayForm): void;
}>();

const model = useFormModel(toRef(props, "modelValue"), emit);

/* ================== Date / Datetime Helpers ================== */
// const stringToCalendarDate = (dateString: string | null | undefined): CalendarDate => {
//   if (dateString) {
//     // نأخذ فقط الجزء الخاص بالتاريخ قبل T
//     const datePart = dateString.split("T")[0];
//     const parts = datePart.split("-");
//     if (parts.length === 3) {
//       const year = Number(parts[0]);
//       const month = Number(parts[1]);
//       const day = Number(parts[2]);
//       if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
//         return new CalendarDate(year, month, day);
//       }
//     }
//   }
//   return new CalendarDate(2025, 1, 1);
// };

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

// work_date
const workDateCalendar = computed({
  get: () => stringToCalendarDate(model.value.work_date),
  set: (val) => (model.value.work_date = val.toString()),
});

// first_check_in — نحفظ كـ datetime string
const firstCheckInCalendar = computed({
  get: () => stringToCalendarDate(model.value.first_check_in),
  set: (val) => {
    // نحفظ التاريخ مع وقت الحقل الحالي أو 00:00:00 كـ default
    const existingTime =
      model.value.first_check_in?.split("T")[1] ?? "00:00:00";
    model.value.first_check_in = `${val.toString()}T${existingTime}`;
  },
});

// last_check_out
const lastCheckOutCalendar = computed({
  get: () => stringToCalendarDate(model.value.last_check_out),
  set: (val) => {
    const existingTime =
      model.value.last_check_out?.split("T")[1] ?? "00:00:00";
    model.value.last_check_out = `${val.toString()}T${existingTime}`;
  },
});

/* ================== Time Helpers ================== */
// استخراج وقت من datetime string
const extractTime = (datetime: string | null): string => {
  if (!datetime) return "";
  const timePart = datetime.split("T")[1];
  if (!timePart) return "";
  // نأخذ فقط HH:mm
  return timePart.substring(0, 5);
};

// تحديث الوقت في datetime string
const updateTime = (datetime: string | null, time: string): string | null => {
  if (!time) return datetime;
  const datePart =
    datetime?.split("T")[0] ?? new Date().toISOString().split("T")[0];
  return `${datePart}T${time}:00`;
};

// first_check_in time
const firstCheckInTime = computed({
  get: () => extractTime(model.value.first_check_in),
  set: (val) => {
    model.value.first_check_in = updateTime(model.value.first_check_in, val);
  },
});

// last_check_out time
const lastCheckOutTime = computed({
  get: () => extractTime(model.value.last_check_out),
  set: (val) => {
    model.value.last_check_out = updateTime(model.value.last_check_out, val);
  },
});

/* ================== Loading States ================== */
const loadingEmployees = ref(false);

/* ================== Fields ================== */
const employeeIdField: Field<AttendanceTodayForm> = {
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

const fields = computed<Field<AttendanceTodayForm>[]>(() => [
  employeeIdField,
  {
    name: "work_date",
    label: "تاريخ العمل",
    colSpan: 1,
    component: "custom",
  },
  {
    name: "first_check_in",
    label: "أول تسجيل دخول",
    colSpan: 1,
    component: "custom",
  },
  {
    name: "last_check_out",
    label: "آخر تسجيل خروج",
    colSpan: 1,
    component: "custom",
  },
  {
    name: "worked_minutes",
    label: "الدقائق العاملة",
    colSpan: 1,
    component: "input",
    componentProps: {
      type: "number",
      placeholder: "أدخل الدقائق العاملة",
      icon: "lucide:clock",
      min: 0,
      step: 1,
    },
  },
  {
    name: "current_status",
    label: "الحالة الحالية",
    colSpan: 1,
    component: "select",
    items: [
      { id: "present", name_ar: "حاضر" },
      { id: "late", name_ar: "متأخر" },
      { id: "out", name_ar: "خارج" },
      { id: "absent", name_ar: "غائب" },
    ],
    componentProps: {
      valueKey: "id",
      labelKey: "name_ar",
      placeholder: "اختر الحالة",
      icon: "lucide:circle-check",
    },
  },
  {
    name: "last_punch_type",
    label: "آخر نوع تسجيل",
    colSpan: 1,
    component: "select",
    items: [
      { id: "in", name_ar: "دخول" },
      { id: "out", name_ar: "خروج" },
    ],
    componentProps: {
      valueKey: "id",
      labelKey: "name_ar",
      placeholder: "اختر نوع التسجيل",
      icon: "lucide:log-in",
    },
  },
]);

/* ================== Fetch Initial Data ================== */
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

fetchEmployees();
</script>

<template>
  <ClientOnly>
    <GenericForm
      ref="formRef"
      v-model="model"
      :fields="fields"
      :loading="loading"
      :schema="attendanceTodaySchema"
      :columns="props.columns ?? 2"
      :select-loading="{
        employee_id: loadingEmployees,
      }"
      @submit="emit('submit', $event)"
      dir="rtl"
    >
      <!-- تاريخ العمل -->
      <template #field-work_date>
        <UInputDate v-model="workDateCalendar">
          <template #trailing>
            <UPopover>
              <UButton icon="i-lucide-calendar" size="sm" variant="link" />
              <template #content>
                <UCalendar v-model="workDateCalendar" class="p-2" />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </template>

      <!-- أول تسجيل دخول -->
      <template #field-first_check_in>
        <div class="flex gap-2">
          <UInputDate v-model="firstCheckInCalendar" class="flex-1">
            <template #trailing>
              <UPopover>
                <UButton icon="i-lucide-calendar" size="sm" variant="link" />
                <template #content>
                  <UCalendar v-model="firstCheckInCalendar" class="p-2" />
                </template>
              </UPopover>
            </template>
          </UInputDate>

          <UInput v-model="firstCheckInTime" type="time" class="w-32" />
        </div>
      </template>

      <!-- آخر تسجيل خروج -->
      <template #field-last_check_out>
        <div class="flex gap-2">
          <UInputDate v-model="lastCheckOutCalendar" class="flex-1">
            <template #trailing>
              <UPopover>
                <UButton icon="i-lucide-calendar" size="sm" variant="link" />
                <template #content>
                  <UCalendar v-model="lastCheckOutCalendar" class="p-2" />
                </template>
              </UPopover>
            </template>
          </UInputDate>

          <UInput v-model="lastCheckOutTime" type="time" class="w-32" />
        </div>
      </template>
    </GenericForm>
  </ClientOnly>
</template>
