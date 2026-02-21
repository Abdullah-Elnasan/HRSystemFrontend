<script setup lang="ts">
import type { WorkScheduleAssignmentForm } from "~/types/workScheduleAssignments";
import type { Field } from "~/components/generic-form.vue";
import { useFormModel } from "~/composables/useFormModel";
import { CalendarDate } from "@internationalized/date";

/* ================== Props / Emits ================== */
const props = defineProps<{
  modelValue: WorkScheduleAssignmentForm;
  mode?: "create" | "edit";
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: WorkScheduleAssignmentForm): void;
  (e: "submit", v: WorkScheduleAssignmentForm): void;
}>();

const model = useFormModel(toRef(props, "modelValue"), emit);
const config = useRuntimeConfig();
const { $api } = useNuxtApp();
/* ================== Date Helpers ================== */
const stringToCalendarDate = (
  dateString: string | null | undefined,
): CalendarDate => {
  if (dateString) {
    const [y, m, d] = dateString.split("-").map(Number);
    if (y && m && d) return new CalendarDate(y, m, d);
  }
  return new CalendarDate(2025, 1, 1);
};

const startsAtCalendar = computed({
  get: () => stringToCalendarDate(model.value.starts_at),
  set: (v) => (model.value.starts_at = v.toString()),
});

const endsAtCalendar = computed({
  get: () => stringToCalendarDate(model.value.ends_at),
  set: (v) => (model.value.ends_at = v.toString()),
});

/* ================== Loading ================== */
const loadingAssignables = ref(false);
const loadingWorkSchedules = ref(false);

/* ================== Reactive Items ================== */
const assignableItems = ref<any[]>([]);
const workScheduleItems = ref<any[]>([]);

/* ================== API ================== */
const fetchAssignables = async () => {
  if (!model.value.assignable_type) return [];

  loadingAssignables.value = true;

  const endpoint =
    model.value.assignable_type === "App\\Models\\Employee\\Employee"
      ? `${config.public.apiBase}/api/employees`
      : `${config.public.apiBase}/api/branches`;

  const res: any = await $api(endpoint);
  loadingAssignables.value = false;

  return res.data ?? [];
};

const searchAssignables = async (q: string) => {
  if (!model.value.assignable_type) return [];

  loadingAssignables.value = true;

  const endpoint =
    model.value.assignable_type === "App\\Models\\Employee\\Employee"
      ? `${config.public.apiBase}/api/employees`
      : `${config.public.apiBase}/api/branches`;

  const res: any = await $api(endpoint, {
    params: { "filter[search]": q },
  });

  loadingAssignables.value = false;
  return res.data ?? [];
};

const fetchWorkSchedules = async () => {
  loadingWorkSchedules.value = true;
  const res: any = await $api(`${config.public.apiBase}/api/work-schedules`);
  workScheduleItems.value = res.data ?? [];
  loadingWorkSchedules.value = false;
};

fetchWorkSchedules();

/* ================== Fields ================== */
const assignableTypeField: Field<WorkScheduleAssignmentForm> = {
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

const assignableIdField = computed<Field<WorkScheduleAssignmentForm>>(() => ({
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

const workScheduleIdField = computed<Field<WorkScheduleAssignmentForm>>(() => ({
  name: "work_schedule_id",
  label: "نظام الدوام",
  component: "select-menu",
  searchable: true,
  items: workScheduleItems.value,
  searchApi: async (q: string) => {
    const res: any = await $api(`${config.public.apiBase}/api/work-schedules`, {
      params: { "filter[search]": q },
    });
    return res.data ?? [];
  },
  componentProps: {
    valueKey: "id",
    labelKey: "name_ar",
    placeholder: "اختر نظام الدوام",
  },
}));

const startsAtField: Field<WorkScheduleAssignmentForm> = {
  name: "starts_at",
  label: "تاريخ البداية",
  component: "custom",
};

const endsAtField: Field<WorkScheduleAssignmentForm> = {
  name: "ends_at",
  label: "تاريخ النهاية",
  component: "custom",
};

const fields = computed<Field<WorkScheduleAssignmentForm>[]>(() => {
  const baseFields: Field<WorkScheduleAssignmentForm>[] = [
    workScheduleIdField.value,
    startsAtField,
    endsAtField,
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
      :loading="loading"
      :columns="columns"
      :select-loading="{
        assignable_id: loadingAssignables,
        work_schedule_id: loadingWorkSchedules,
      }"
      @submit="emit('submit', $event)"
      dir="rtl"
    >
      <!-- تاريخ البداية -->
      <template #field-starts_at>
        <UInputDate v-model="startsAtCalendar">
          <template #trailing>
            <UPopover>
              <UButton icon="i-lucide-calendar" size="sm" variant="link" />
              <template #content>
                <UCalendar v-model="startsAtCalendar" class="p-2" />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </template>

      <!-- تاريخ النهاية -->
      <template #field-ends_at>
        <UInputDate v-model="endsAtCalendar">
          <template #trailing>
            <UPopover>
              <UButton icon="i-lucide-calendar" size="sm" variant="link" />
              <template #content>
                <UCalendar v-model="endsAtCalendar" class="p-2" />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </template>
    </GenericForm>
  </ClientOnly>
</template>
