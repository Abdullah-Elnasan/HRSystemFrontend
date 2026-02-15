<script setup lang="ts">
import type { Field } from "~/components/generic-form.vue";
import type { PermissionAssignForm } from "~/types/userGroups";
import { useUserGroup } from "~/composables/userGroups/useUserGroups";

/* ================== Props / Emits ================== */
const props = defineProps<{
  permissionIds: number[];
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "update:operation", value: string): void;
  (e: "success"): void;
}>();

/* ================== Composables ================== */
const { assignPermissions, removePermissions, loading } = useUserGroup();
const toast = useToast();

/* ================== State ================== */
const loadingUserGroups = ref(false);

/* ================== Form ================== */
const formData = ref({
  user_group_id: null as number | null,
  operation: "assign" as "assign" | "remove",
});

const baseFields: Field<typeof formData.value>[] = [
  {
    name: "user_group_id",
    label: "مجموعة المستخدمين",
    component: "select-menu",
    colSpan: 2,
    items: [],
    searchable: true,
    searchApi: async (q: string) => {
      const res: any = await $fetch("/api/user-groups/user-groups", {
        params: {
          "filter[search]": q,
        },
      });
      return res.data;
    },
    componentProps: {
      required: true,
      valueKey: "id",
      labelKey: "name_ar",
      placeholder: "اختر مجموعة المستخدمين",
      icon: "lucide:users",
    },
  },
  {
    name: "operation",
    label: "نوع العملية",
    component: "select",
    colSpan: 2,
    items: [
      { label: "إسناد الصلاحيات", value: "assign" },
      { label: "حذف الصلاحيات", value: "remove" },
    ],
    componentProps: {
      required: true,
      icon: "i-lucide-git-branch",
      valueAttribute: "value",
      optionAttribute: "label",
    },
  },
];

const fields = ref<Field<typeof formData.value>[]>(baseFields);

/* ================== Fetch Functions ================== */
const fetchUserGroups = async () => {
  loadingUserGroups.value = true;
  try {
    const res: any = await $fetch("/api/user-groups/user-groups");
    const field = baseFields.find((f) => f.name === "user_group_id");
    if (field) {
      field.items = [...res.data];
    }
  } catch (error) {
    console.error("Error fetching user groups:", error);
  } finally {
    loadingUserGroups.value = false;
  }
};

/* ================== Lifecycle ================== */
onMounted(() => {
  fetchUserGroups();
});

/* ================== Handlers ================== */
const formRef = ref<{ submit: () => void } | null>(null);

const onSubmit = async () => {
  if (!formData.value.user_group_id) {
    toast.add({
      title: "خطأ",
      description: "يجب اختيار مجموعة المستخدمين",
      color: "error",
    });
    return;
  }

  const payload: PermissionAssignForm = {
    user_group_id: formData.value.user_group_id,
    permission_ids: props.permissionIds,
  };

  try {
    if (formData.value.operation === "assign") {
      await assignPermissions(payload);
    } else {
      await removePermissions(payload);
    }

    emit("success");
    closeDialog();
  } catch (error) {
    // الأخطاء يتم معالجتها في composable
    console.error("Operation error:", error);
  }
};

const closeDialog = () => {
  emit("update:open", false);
  setTimeout(() => {
    formData.value = {
      user_group_id: null,
      operation: "assign",
    };
  }, 300);
};

const handleFormSubmit = () => {
  formRef.value?.submit();
};

const operationIcon = computed(() =>
  formData.value.operation === "assign"
    ? "i-lucide-user-plus"
    : "i-lucide-user-minus"
);

const operationColor = computed(() =>
  formData.value.operation === "assign" ? "primary" : "error"
);

watch(
  () => formData.value.operation,
  (newVal) => {
    emit("update:operation", newVal);
  }
);
</script>

<template>
  <UCard>
    <div class="space-y-6" dir="rtl">
      <UAlert
        :icon="operationIcon"
        :color="operationColor"
        variant="soft"
        :title="`سيتم ${formData.operation === 'assign' ? 'إسناد' : 'حذف'} ${permissionIds.length} صلاحية`"
        :description="`اختر مجموعة المستخدمين ل${formData.operation === 'assign' ? 'إسناد' : 'حذف'} الصلاحيات ${formData.operation === 'assign' ? 'إليها' : 'منها'}`"
      />

      <GenericForm
        ref="formRef"
        v-model="formData"
        :fields="fields"
        :columns="2"
        :select-loading="{ user_group_id: loadingUserGroups }"
        @submit="onSubmit"
      />
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="outline"
          label="إلغاء"
          @click="closeDialog"
          :disabled="loading"
        />
        <UButton
          :color="operationColor"
          :icon="operationIcon"
          :loading="loading"
          @click="handleFormSubmit"
        >
          {{
            formData.operation === "assign"
              ? "إسناد الصلاحيات"
              : "حذف الصلاحيات"
          }}
        </UButton>
      </div>
    </template>
  </UCard>
</template>
