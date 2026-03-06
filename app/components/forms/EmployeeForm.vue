<script setup lang="ts">
/**
 * =========================================================
 * @component   EmployeeForm
 * @description Create / Edit form for employee records.
 *              Dropdown data is fetched lazily after the
 *              form mounts so the UI opens instantly.
 * =========================================================
 */

import { employeeSchema } from "~/schemas/employees.schema";
import type { EmployeeForm } from "~/types/employee";
import { useFormModel } from "~/composables/useFormModel";
import type { Field } from "~/components/generic-form.vue";
import { CalendarDate } from "@internationalized/date";

// =========================================================
// Props & Emits
// =========================================================

const props = defineProps<{
  modelValue: EmployeeForm;
  mode?: "create" | "edit";
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: EmployeeForm): void;
  (e: "submit", v: EmployeeForm): void;
}>();

const model = useFormModel(toRef(props, "modelValue"), emit);
const config = useRuntimeConfig();
const { $api } = useNuxtApp();

// =========================================================
// Date Helpers
// =========================================================

/**
 * Converts an ISO date string ("YYYY-MM-DD") to a CalendarDate.
 * Falls back to 2022-01-10 when the input is empty or malformed.
 */
const stringToCalendarDate = (dateString: string | null | undefined): CalendarDate => {
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

  const today = new Date();

  return new CalendarDate(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );
};


/** Two-way binding between the model's birth_date string and CalendarDate */
const birthDateCalendar = computed<CalendarDate>({
  get: () => stringToCalendarDate(model.value.birth_date),
  set: (v) => { model.value.birth_date = v.toString(); },
});

// =========================================================
// Loading Flags – one per async dropdown
// =========================================================

const loadingDepartments = ref(false);
const loadingBranches = ref(false);
const loadingUserGroups = ref(false);
const loadingWorkSchedules = ref(false);
const loadingPayroll = ref(false);

// =========================================================
// Field Definitions
// =========================================================

/**
 * Fields shared by both create and edit modes.
 * Icons follow the brand palette: primary = gold, secondary = teal.
 */
const baseFields = reactive<Field<EmployeeForm>[]>([
  {
    name: "first_name",
    label: "الاسم الأول",
    colSpan: 1,
    componentProps: { icon: "i-lucide-user", placeholder: "أدخل الاسم الأول" },
  },
  {
    name: "last_name",
    label: "اسم العائلة",
    colSpan: 1,
    componentProps: { icon: "i-lucide-user-check", placeholder: "أدخل اسم العائلة" },
  },
  {
    name: "pin",
    label: "الرقم التعريفي",
    colSpan: 1,
    componentProps: { type: "number", icon: "i-lucide-hash", placeholder: "الرقم التعريفي" },
  },
  {
    name: "national_id",
    label: "الرقم الوطني",
    colSpan: 1,
    componentProps: { icon: "i-lucide-id-card", placeholder: "أدخل الرقم الوطني" },
  },
  {
    name: "phone",
    label: "رقم الهاتف",
    colSpan: 1,
    componentProps: { icon: "i-lucide-phone", placeholder: "05XXXXXXXX" },
  },
  {
    name: "email",
    label: "البريد الإلكتروني",
    colSpan: 1,
    componentProps: { type: "email", icon: "i-lucide-mail", placeholder: "example@domain.com" },
  },
  {
    name: "position",
    label: "المسمى الوظيفي",
    colSpan: 1,
    componentProps: { icon: "i-lucide-briefcase", placeholder: "مثال: محاسب أول" },
  },

  // ─── Department ─────────────────────────────────────────
  {
    name: "department_id",
    label: "القسم",
    colSpan: 1,
    component: "select-menu",
    searchable: true,
    items: [],
    searchApi: async (q: string) => {
      const res: any = await $api(`${config.public.apiBase}/api/departments`, {
        params: { "filter[search]": q },
      });
      return res.data;
    },
    componentProps: {
      valueKey: "id",
      labelKey: "name_ar",
      placeholder: "اختر القسم",
      icon: "i-lucide-folder-tree",
    },
  },

  // ─── User Group ─────────────────────────────────────────
  {
    name: "user_group_id",
    label: "مجموعة المستخدمين",
    colSpan: 1,
    component: "select-menu",
    searchable: true,
    items: [],
    searchApi: async (q: string) => {
      const res: any = await $api(`${config.public.apiBase}/api/user-groups`, {
        params: { "filter[search]": q },
      });
      return res.data;
    },
    componentProps: {
      valueKey: "id",
      labelKey: "name_ar",
      placeholder: "اختر المجموعة",
      icon: "i-lucide-users",
    },
  },

  // ─── Branch ─────────────────────────────────────────────
  {
    name: "branch_id",
    label: "الفرع",
    colSpan: 1,
    component: "select-menu",
    searchable: true,
    items: [],
    searchApi: async (q: string) => {
      const res: any = await $api(`${config.public.apiBase}/api/branches`, {
        params: { "filter[search]": q },
      });
      return res.data;
    },
    componentProps: {
      valueKey: "id",
      labelKey: "name_ar",
      placeholder: "اختر الفرع",
      icon: "i-lucide-building-2",
    },
  },

  // ─── Birth Date & Image (always last) ───────────────────
  {
    name: "birth_date",
    label: "تاريخ الميلاد",
    colSpan: 1,
    component: "custom",
  },
  {
    name: "image",
    label: "صورة الموظف",
    colSpan: 1,
    component: "file",
    componentProps: {
      icon: "i-lucide-image",
      description: "PNG, JPG, WEBP (max 2MB)",
      accept: "image/png,image/jpeg,image/jpg,image/webp",
      class: "w-full min-h-48",
    },
  },
]);

/** Fields that only appear in create mode */
const createOnlyFields: Field<EmployeeForm>[] = [
  {
    name: "work_schedule_id",
    label: "نظام الدوام",
    colSpan: 1,
    component: "select-menu",
    searchable: true,
    items: [],
    searchApi: async (q: string) => {
      const res: any = await $api(`${config.public.apiBase}/api/work-schedules`, {
        params: { "filter[search]": q },
      });
      return res.data;
    },
    componentProps: {
      valueKey: "id",
      labelKey: "name_ar",
      placeholder: "اختر نظام الدوام",
      icon: "i-lucide-clock",
    },
  },
  {
    name: "payroll_system_id",
    label: "نظام الراتب",
    colSpan: 1,
    component: "select-menu",
    searchable: true,
    items: [],
    searchApi: async (q: string) => {
      const res: any = await $api(`${config.public.apiBase}/api/payroll-systems`, {
        params: { "filter[search]": q },
      });
      return res.data;
    },
    componentProps: {
      valueKey: "id",
      labelKey: "name",
      placeholder: "اختر نظام الراتب",
      icon: "i-lucide-wallet",
    },
  },
];

/**
 * Computed field list — merges base + create-only,
 * then ensures birth_date and image are always last.
 */
const fields = computed<Field<EmployeeForm>[]>(() => {
  const all = props.mode === "edit"
    ? baseFields
    : [...baseFields, ...createOnlyFields];

  const TAIL = ["birth_date", "image"];
  const tail = TAIL.map(n => all.find(f => f.name === n)).filter(Boolean) as Field<EmployeeForm>[];
  const other = all.filter(f => !TAIL.includes(f.name as string));

  return [...other, ...tail];
});

// =========================================================
// Async Data Loaders
// =========================================================

/**
 * Fetches all departments and populates the dropdown items.
 * Called lazily after mount so the form opens immediately.
 */
async function fetchDepartments() {
  loadingDepartments.value = true;
  try {
    const res: any = await $api(`${config.public.apiBase}/api/departments`);
    const field = baseFields.find(f => f.name === "department_id");
    if (field) field.items = [...res.data];
  } finally {
    loadingDepartments.value = false;
  }
}

/** Fetches all branches */
async function fetchBranches() {
  loadingBranches.value = true;
  try {
    const res: any = await $api(`${config.public.apiBase}/api/branches`);
    const field = baseFields.find(f => f.name === "branch_id");
    if (field) field.items = [...res.data];
  } finally {
    loadingBranches.value = false;
  }
}

/** Fetches all user groups */
async function fetchUserGroups() {
  loadingUserGroups.value = true;
  try {
    const res: any = await $api(`${config.public.apiBase}/api/user-groups`);
    const field = baseFields.find(f => f.name === "user_group_id");
    if (field) field.items = [...res.data];
  } finally {
    loadingUserGroups.value = false;
  }
}

/** Fetches all work schedules (create mode only) */
async function fetchWorkSchedules() {
  loadingWorkSchedules.value = true;
  try {
    const res: any = await $api(`${config.public.apiBase}/api/work-schedules`);
    const field = createOnlyFields.find(f => f.name === "work_schedule_id");
    if (field) field.items = [...res.data];
  } finally {
    loadingWorkSchedules.value = false;
  }
}

/** Fetches all payroll systems (create mode only) */
async function fetchPayrollSystems() {
  loadingPayroll.value = true;
  try {
    const res: any = await $api(`${config.public.apiBase}/api/payroll-systems`);
    const field = createOnlyFields.find(f => f.name === "payroll_system_id");
    if (field) field.items = [...res.data];
  } finally {
    loadingPayroll.value = false;
  }
}

/**
 * In edit mode, ensures the currently selected item for a dropdown
 * is present in its items list even before the full list loads.
 * Prevents the select showing a blank value on open.
 */
async function ensureItemLoaded(
  fieldName: "department_id" | "branch_id" | "user_group_id" | "work_schedule_id" | "payroll_system_id",
  itemId: number,
) {
  // Search both field arrays
  const field =
    (baseFields.find(f => f.name === fieldName) as Field<EmployeeForm> | undefined) ??
    createOnlyFields.find(f => f.name === fieldName);

  if (!field?.searchApi || !field.items) return;

  const valueKey = field.componentProps?.valueKey ?? "id";
  const alreadyLoaded = (field.items as any[]).some(i => i[valueKey] === itemId);
  if (alreadyLoaded) return;

  const results = await field.searchApi(String(itemId));
  const match = results?.find((i: any) => i[valueKey] === itemId);
  if (match) field.items = [...(field.items as any[]), match];
}

// =========================================================
// Refs
// =========================================================

const formRef = ref<{ submit: () => void } | null>(null);

// =========================================================
// Lifecycle
// =========================================================

onMounted(() => {
  /**
   * Fire all fetch calls in parallel AFTER the component mounts.
   * This allows the form drawer to open immediately while the
   * dropdowns load in the background.
   */
  const loaders: Promise<void>[] = [
    fetchDepartments(),
    fetchBranches(),
    fetchUserGroups(),
  ];

  // Work schedule and payroll only needed in create mode
  if (props.mode !== "edit") {
    loaders.push(fetchWorkSchedules(), fetchPayrollSystems());
  }

  // In edit mode, ensure the already-selected IDs appear in the lists
  if (props.mode === "edit") {
    const { department_id, branch_id, user_group_id, work_schedule_id } = model.value;
    if (department_id) loaders.push(ensureItemLoaded("department_id", department_id));
    if (branch_id) loaders.push(ensureItemLoaded("branch_id", branch_id));
    if (user_group_id) loaders.push(ensureItemLoaded("user_group_id", user_group_id));
    if (work_schedule_id) loaders.push(ensureItemLoaded("work_schedule_id", work_schedule_id));
  }

  Promise.all(loaders);
});

// =========================================================
// Expose
// =========================================================

defineExpose({
  /** Triggers validation and submits the form programmatically */
  submit: () => formRef.value?.submit(),
});


const inputUi = {
  leadingIcon: "text-[var(--color-secondary-600)]",
  trailingIcon: "text-[var(--color-secondary-400)]",
} as const;


</script>

<template>
  <ClientOnly>
    <GenericForm ref="formRef" v-model="model" :schema="employeeSchema" :fields="fields" :loading="loading"
      :columns="props.columns" :select-loading="{
        department_id: loadingDepartments,
        branch_id: loadingBranches,
        user_group_id: loadingUserGroups,
        work_schedule_id: loadingWorkSchedules,
        payroll_system_id: loadingPayroll,
      }" dir="rtl" @submit="emit('submit', $event)">

      <!-- ── Birth Date custom field ───────────────────── -->
      <template #field-birth_date>
        <UFormField  name="birth_date">
          <UInputDate v-model="birthDateCalendar">
            <template #trailing>
              <UPopover>
                <UButton :ui="inputUi" variant="link" size="sm" icon="i-lucide-calendar"
                  aria-label="اختر تاريخ الميلاد" class="px-0" />
                <template #content>
                  <UCalendar v-model="birthDateCalendar" class="p-2" />
                </template>
              </UPopover>
            </template>
          </UInputDate>
        </UFormField>
      </template>

    </GenericForm>
  </ClientOnly>
</template>

<style scoped>
/**
 * Brand color variables injected at component scope.
 * These mirror the global CSS tokens so the form fields
 * stay visually consistent with the rest of the app.
 */
:deep(.form-field label) {
  color: var(--color-secondary-800);
  /* teal-ish label text */
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.02em;
}

/** Highlight focused inputs with the primary (gold) ring */
:deep(.form-field input:focus),
:deep(.form-field textarea:focus) {
  outline-color: var(--color-primary-500);
  border-color: var(--color-primary-400);
}

/** Give select menus the same gold focus ring */
:deep(.form-field [data-select]:focus-within) {
  border-color: var(--color-primary-400);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary-500) 25%, transparent);
}

/** Input icons inherit the secondary brand color */
:deep(.form-field .input-icon),
:deep(.form-field [data-icon]) {
  color: var(--color-secondary-500);
}
</style>
