<script setup lang="ts">
import type { PermissionForm } from "~/types/permission";
import type { Field } from "~/components/generic-form.vue";
import { useFormModel } from "~/composables/useFormModel";

/* ================== Props / Emits ================== */
const props = defineProps<{
  modelValue: PermissionForm;
  mode?: "create" | "edit";
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: PermissionForm): void;
  (e: "submit", v: PermissionForm): void;
}>();

const model = useFormModel(toRef(props, "modelValue"), emit);

/* ================== Loading States ================== */
const loadingPermissionGroups = ref(false);

/* ================== Fields ================== */
const permissionGroupIdField: Field<PermissionForm> = {
  name: "permission_group_id",
  label: "مجموعة الصلاحيات",
  colSpan: 2,
  component: "select-menu",
  searchable: true,
  items: [],
  searchApi: async (q: string) => {
    const res: any = await $fetch("/api/permission-groups", {
      params: { "filter[search]": q },
    });
    return res.data;
  },
  componentProps: {
    valueKey: "id",
    labelKey: "name_ar",
    placeholder: "اختر مجموعة الصلاحيات",
    icon: "lucide:folder-lock",
  },
};

const fields = computed<Field<PermissionForm>[]>(() => [
  {
    name: "code",
    label: "الكود الفريد",
    colSpan: 2,
    component: "input",
    componentProps: {
      placeholder: "مثال: view_reports",
      icon: "lucide:code",
      required: true,
    },
  },
  {
    name: "name_ar",
    label: "الاسم (عربي)",
    colSpan: 1,
    component: "input",
    componentProps: {
      placeholder: "أدخل الاسم بالعربية",
      icon: "lucide:text",
      required: true,
    },
  },
  {
    name: "name_en",
    label: "الاسم (إنجليزي)",
    colSpan: 1,
    component: "input",
    componentProps: {
      placeholder: "Enter name in English",
      icon: "lucide:text",
      required: true,
    },
  },
  {
    name: "description_ar",
    label: "الوصف (عربي)",
    colSpan: 1,
    component: "textarea",
    componentProps: {
      placeholder: "أدخل الوصف بالعربية",
      rows: 3,
    },
  },
  {
    name: "description_en",
    label: "الوصف (إنجليزي)",
    colSpan: 1,
    component: "textarea",
    componentProps: {
      placeholder: "Enter description in English",
      rows: 3,
    },
  },
  permissionGroupIdField,
]);

/* ================== Fetch Initial Data ================== */
const fetchPermissionGroups = async () => {
  loadingPermissionGroups.value = true;
  const res: any = await $fetch("/api/permission-groups");
  permissionGroupIdField.items = [...res.data];
  loadingPermissionGroups.value = false;
};

/* ================== Expose ================== */
const formRef = ref<{ submit: () => void } | null>(null);
defineExpose({
  submit: () => formRef.value?.submit(),
});

fetchPermissionGroups();
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
        permission_group_id: loadingPermissionGroups,
      }"
      @submit="emit('submit', $event)"
      dir="rtl"
    />
  </ClientOnly>
</template>
