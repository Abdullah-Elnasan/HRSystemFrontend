<script setup lang="ts">
import { employeeSchema } from "~/schemas/employees.schema";
import type { EmployeeForm } from "~/types/employee";
import { useFormModel } from "~/composables/useFormModel";
import type { Field } from "~/components/generic-form.vue";
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


/* ================== Date Handling Helpers ================== */

// دالة مساعدة لتحويل string إلى CalendarDate
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
  // القيمة الافتراضية
  return new CalendarDate(2022, 1, 10);
};


/* ================== Birth Date Handling ================== */
const birthDateCalendar = computed({
  get: (): CalendarDate => stringToCalendarDate(model.value.birth_date),
  set: (value: CalendarDate) => {
    model.value.birth_date = value.toString();
  },
});


/* ================== Start Date Handling ================== */
const startsAtCalendar = computed({
  get: (): CalendarDate => stringToCalendarDate(model.value.starts_at),
  set: (value: CalendarDate) => {
    model.value.starts_at = value.toString();
  },
});


/* ================== Fields ================== */


const baseFields = reactive<Field<EmployeeForm>[]>([
  { name: "first_name", label: "الاسم الأول", colSpan: 1 },
  { name: "last_name", label: "اسم العائلة", colSpan: 1 },
  {
    name: "pin",
    label: "الرقم التعريفي",
    colSpan: 1,
    componentProps: { type: "number" },
  },
  { name: "national_id", label: "الرقم الوطني", colSpan: 1 },
  { name: "phone", label: "رقم الهاتف", colSpan: 1 },
  {
    name: "email",
    label: "البريد الإلكتروني",
    colSpan: 1,
    componentProps: { type: "email" },
  },
  { name: "position", label: "المسمى الوظيفي", colSpan: 1 },
  {
    name: "department_id",
    label: "القسم ",
    colSpan: 1,
    component: "select-menu",
    searchable: true,
    items: [],
    searchApi: async (q: string) => {
      const res: any = await $fetch("/api/departments/departments", {
        params: {
          "filter[search]": q,
        },
      });
      return res.data;
    },
    componentProps: {
      valueKey: "id",
      colSpan: 1,
      labelKey: "name_ar",
      placeholder: " القسم",
      icon: "lucide:folder-tree",
    },
  },
  {
    name: "user_group_id",
    label: "مجموعة المستخدمين",
    colSpan: 1,
    component: "select-menu",
    searchable: true,
    items: [],
    searchApi: async (q: string) => {
      const res: any = await $fetch("/api/user-groups/user-groups", {
        params: {
          "filter[search]": q,
        },
      });
      return res.data;
    },
    componentProps: {
      valueKey: "id",
      labelKey: "name_ar",
      placeholder: "اختر مجموعة المستخدمين",
      icon: "lucide:users",
    },
  },


  {
    name: "branch_id",
    label: "الفرع",
    colSpan: 1,
    component: "select-menu",
    searchable: true,
    items: [],
    searchApi: async (q: string) => {
      const res: any = await $fetch("/api/branches/branches", {
        params: {
          "filter[search]": q,
        },
      });
      return res.data;
    },
    componentProps: {
      valueKey: "id",
      labelKey: "name_ar",
      placeholder: "اختر الفرع",
      icon: "gravity-ui:branches-down",
    },
  },

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


const createOnlyFields: Field<EmployeeForm>[] = [

  {
    name: "work_schedule_id",
    label: "نظام الدوام",
    colSpan: 1,
    component: "select-menu",
    searchable: true,
    items: [],
    searchApi: async (q: string) => {
      const res: any = await $fetch("/api/work-schedules/work-schedules", {
        params: { "filter[search]": q },
      });
      return res.data;
    },
    componentProps: {
      valueKey: "id",
      labelKey: "name_ar",
      placeholder: "نظام الدوام",
      icon: "lucide:folder-tree",
    },
  },
      {
    name: "starts_at",
    label: "تاريخ تفعيل نظام الدوام",
    colSpan: 1,
    component: "custom",
  },

];

const fields = computed<Field<EmployeeForm>[]>(() => {
  const allFields =
    props.mode === "edit"
      ? baseFields
      : [...baseFields, ...createOnlyFields];

  const tailOrder = ["birth_date", "image"];

  const tailFields = tailOrder
    .map(name => allFields.find(f => f.name === name))
    .filter(Boolean) as Field<EmployeeForm>[];

  const otherFields = allFields.filter(
    f => !tailOrder.includes(f.name as string),
  );

  return [...otherFields, ...tailFields];
});





/* ================== Refs ================== */


const formRef = ref<{ submit: () => void } | null>(null);
const loadingDepartments = ref(false);
const loadingBranches = ref(false);
const loadingUserGroups = ref(false);
const loadingWorkSchedules = ref(false);


/* ================== Fetch Functions ================== */


const fetchDepartments = async () => {
  loadingDepartments.value = true;
  const res: any = await $fetch("/api/departments/departments");
  const field = baseFields.find((f) => f.name === "department_id");
  if (field) {
    field.items = [...res.data];
  }
  loadingDepartments.value = false;
};


const fetchBranches = async () => {
  loadingBranches.value = true;
  const res: any = await $fetch("/api/branches/branches");
  const field = baseFields.find((f) => f.name === "branch_id");
  if (field) {
    field.items = [...res.data];
  }
  loadingBranches.value = false;
};


const fetchUserGroups = async () => {
  loadingUserGroups.value = true;
  const res: any = await $fetch("/api/user-groups/user-groups");
  const field = baseFields.find((f) => f.name === "user_group_id");
  if (field) {
    field.items = [...res.data];
  }
  loadingUserGroups.value = false;
};


const fetchWorkSchedules = async () => {
  loadingWorkSchedules.value = true;
  const res: any = await $fetch("/api/work-schedules/work-schedules");
  console.log(res);
  const field = createOnlyFields.find((f) => f.name === "work_schedule_id");
  if (field) {
    field.items = [...res.data];
  }
  loadingWorkSchedules.value = false;
};


const ensureItemLoaded = async (
  fieldName: "department_id" | "branch_id" | "user_group_id" | "work_schedule_id",
  itemId: number,
) => {
  const field = baseFields.find((f) => f.name === fieldName);
  if (!field || !field.searchApi || !field.items) return;


  const valueKey = field.componentProps?.valueKey || "id";


  const exists = field.items.some((item: any) => item[valueKey] === itemId);
  if (exists) return;


  const results = await field.searchApi(itemId.toString());
  const matchedItem = results?.find((item: any) => item[valueKey] === itemId);


  if (matchedItem) {
    field.items = [...field.items, matchedItem];
  }
};


/* ================== Lifecycle ================== */


defineExpose({
  submit: () => formRef.value?.submit(),
});


await Promise.all([
  fetchDepartments(),
  fetchBranches(),
  fetchUserGroups(),
  fetchWorkSchedules(),
]);


if (props.mode === "edit") {
  const loadPromises = [];


  if (model.value.department_id) {
    loadPromises.push(
      ensureItemLoaded("department_id", model.value.department_id),
    );
  }


  if (model.value.branch_id) {
    loadPromises.push(ensureItemLoaded("branch_id", model.value.branch_id));
  }


  if (model.value.user_group_id) {
    loadPromises.push(
      ensureItemLoaded("user_group_id", model.value.user_group_id),
    );
  }

  if (model.value.work_schedule_id) {
    loadPromises.push(
      ensureItemLoaded("work_schedule_id", model.value.work_schedule_id),
    );
  }


  await Promise.all(loadPromises);
}
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
        user_group_id: loadingUserGroups,
        work_schedule_id: loadingWorkSchedules,
      }"
      @submit="emit('submit', $event)"
      dir="rtl"
    >
      <!-- مكون تاريخ الميلاد -->
      <template #field-birth_date="{ model: slotModel }">
        <UInputDate v-model="birthDateCalendar">
          <template #trailing>
            <UPopover>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-calendar"
                aria-label="اختر تاريخ الميلاد"
                class="px-0"
              />
              <template #content>
                <UCalendar v-model="birthDateCalendar" class="p-2" />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </template>

      <!-- مكون تاريخ تفعيل نظام الدوام -->
      <template #field-starts_at="{ model: slotModel }">
        <UInputDate v-model="startsAtCalendar">
          <template #trailing>
            <UPopover>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-calendar"
                aria-label="اختر تاريخ التفعيل"
                class="px-0"
              />
              <template #content>
                <UCalendar v-model="startsAtCalendar" class="p-2" />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </template>
    </GenericForm>
  </ClientOnly>
</template>
