<script setup lang="ts">
import { employeeSchema } from "~/schemas/employees.schema";
import type { EmployeeForm } from "~/types/employee";
import type { Field } from "~/components/generic-form.vue";
import { useFormModel } from "~/composables/useFormModel";
import { CalendarDate } from "@internationalized/date";

/* ================== Props / Emits ================== */

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

/* ================== Birth Date Handling ================== */

const birthDateCalendar = computed({
  get: (): CalendarDate => {
    if (model.value.birth_date) {
      const parts = model.value.birth_date.split("-");
      if (parts.length === 3) {
        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return new CalendarDate(year, month, day);
        }
      }
    }
    return new CalendarDate(2000, 1, 1);
  },
  set: (value: CalendarDate) => {
    model.value.birth_date = value.toString(); // "YYYY-MM-DD"
  },
});

/* ================== Select Data (منفصل عن fields) ================== */

const departmentItems = ref<any[]>([]);
const branchItems = ref<any[]>([]);
const loadingDepartments = ref(false);
const loadingBranches = ref(false);

const fetchDepartments = async () => {
  loadingDepartments.value = true;
  const res: any = await $fetch("/api/departments/departments", {
    cache: "no-cache",
    headers: { "x-no-cache": Date.now().toString() },
  });
  console.log(res);
  departmentItems.value = Array.isArray(res.data) ? res.data : [];
  loadingDepartments.value = false;
};

const fetchBranches = async () => {
  loadingBranches.value = true;
  const res: any = await $fetch("/api/branches/branches", {
    cache: "no-cache",
    headers: { "x-no-cache": Date.now().toString() },
  });
  console.log(res);

  branchItems.value = Array.isArray(res.data) ? res.data : [];
  loadingBranches.value = false;
};

onMounted(async () => {
  fetchBranches();
  fetchDepartments();

});


/* ================== Fields ================== */

const fields: Field<EmployeeForm>[] = [
  {
    name: "first_name",
    label: "الاسم الأول",
    colSpan: 1,
  },
  {
    name: "last_name",
    label: "اسم العائلة",
    colSpan: 1,
  },
  {
    name: "pin",
    label: "الرقم التعريفي",
    colSpan: 1,
    component: "input",
    componentProps: {
      type: "number",
    },
  },
  {
    name: "national_id",
    label: "الرقم الوطني",
    colSpan: 1,
  },
  {
    name: "phone",
    label: "رقم الهاتف",
    colSpan: 1,
  },
  {
    name: "email",
    label: "البريد الإلكتروني",
    colSpan: 1,
    componentProps: {
      type: "email",
    },
  },
  {
    name: "position",
    label: "المسمى الوظيفي",
    colSpan: 1,
  },

  /* ======== Department ======== */
  {
    name: "department_id",
    label: "القسم",
    colSpan: 1,
    component: "select-menu",
    searchable: true,
    // نستخدم componentProps فقط، بدون field.items
    componentProps: computed(() => ({
      items: departmentItems.value,
      valueKey: "id",
      labelKey: "name_ar",
      placeholder: "اختر القسم",
      icon: "lucide:folder-tree",
      class: "w-full",
    })),
  },

  /* ======== Branch ======== */
  {
    name: "branch_id",
    label: "الفرع",
    colSpan: 1,
    component: "select-menu",
    searchable: true,
    componentProps: computed(() => ({
      items: branchItems.value,
      valueKey: "id",
      labelKey: "name_ar",
      placeholder: "اختر الفرع",
      icon: "gravity-ui:branches-down",
      class: "w-full",
    })),
  },

  /* ======== Birth Date ======== */
  {
    name: "birth_date",
    label: "تاريخ الميلاد",
    colSpan: 1,
    component: "custom",
  },

  /* ======== Image ======== */
  {
    name: "image",
    label: "صورة الموظف",
    colSpan: 2,
    component: "file",
    componentProps: {
      icon: "i-lucide-image",
      description: "PNG, JPG, WEBP (max 2MB)",
      accept: "image/png,image/jpeg,image/jpg,image/webp",
      class: "w-full min-h-48",
    },
  },
];

/* ================== Expose formRef ================== */

const formRef = ref<{ submit: () => void } | null>(null);

defineExpose({
  submit: () => formRef.value?.submit(),
});

const title = computed(() =>
  props.mode === "edit" ? "تعديل موظف" : "إضافة موظف",
);
</script>

<template>
  <ClientOnly>
    <GenericForm
      ref="formRef"
      v-model="model"
      :schema="employeeSchema"
      :fields="fields"
      :loading="loading"
      :columns="props.columns"
      :select-loading="{
        department_id: loadingDepartments,
        branch_id: loadingBranches,
      }"
      @submit="emit('submit', $event)"
      dir="rtl"
    >
      <!-- حقل مخصص لتاريخ الميلاد -->
      <template #field-birth_date>
        <UInputDate v-model="birthDateCalendar">
          <template #trailing>
            <UPopover>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-calendar"
                aria-label="Select a date"
                class="px-0"
              />
              <template #content>
                <UCalendar v-model="birthDateCalendar" class="p-2" />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </template>
    </GenericForm>
  </ClientOnly>
</template>
