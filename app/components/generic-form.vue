<script setup lang="ts" generic="T extends Record<string, any>">
import type { FormSubmitEvent } from "#ui/types";
import { useFormModel } from "~/composables/useFormModel";

/* ================== Types ================== */

export type FieldComponent =
  | "input"
  | "textarea"
  | "select"
  | "select-menu"
  | "file"
  | "switch" // ✅ جديد
  | "custom";

export interface Field<T> {
  name: keyof T;
  label: string;
  component?: FieldComponent;

  componentProps?: Record<string, any>;
  wrapperProps?: Record<string, any>;

  /** Select / SelectMenu */
  items?: any[];
  multiple?: boolean;
  searchable?: boolean;
  searchApi?: (query: string) => Promise<any[]>;

  /** Layout */
  colSpan?: 1 | 2 | 3 | 4;
}

/* ================== Props / Emits ================== */

const props = defineProps<{
  columns?: 1 | 2 | 3 | 4;
  modelValue: T;
  schema?: any;
  fields: Field<T>[];
  loading?: boolean;
  selectLoading?: Partial<Record<keyof T, boolean>>;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: T): void;
  (e: "submit", value: T): void;
}>();

/* ================== State ================== */

const gridCols = computed(() => props.columns ?? 2);
const form = useFormModel(toRef(props, "modelValue"), emit);

/* ================== Handlers ================== */

const onSubmit = (_: FormSubmitEvent<T>) => {
  emit("submit", form.value);
};

const submit = () => {
  console.log(form.value);
  emit("submit", form.value);
};

const loadingFields = ref<any>({
  department_id: false,
  branch_id: false,
});

const searchTimeouts = ref<Record<string, any>>({});

const onSelectSearch = (field: Field<T>, query: string) => {
  const key = String(field.name);

  if (searchTimeouts.value[key]) {
    clearTimeout(searchTimeouts.value[key]);
  }

  searchTimeouts.value[key] = setTimeout(async () => {
    if (!query) return;

    loadingFields.value[field.name] = true;

    try {
      const res = await field.searchApi!(query);
      console.log(res);
      field.items = [...res];
    } finally {
      loadingFields.value[field.name] = false;
    }
  }, 300);
};

defineExpose({ submit });
</script>

<template>
  <UForm
    :schema="schema"
    :state="form"
    :class="[
      'grid gap-y-8',
      gridCols === 2 ? 'grid-cols-2 gap-x-2' : 'grid-cols-1',
    ]"
    @submit="onSubmit"
  >
    <template v-for="field in fields" :key="String(field.name)">
      <div
        :class="[
          field.colSpan === 1 &&
            field.component === 'file' &&
            'col-span-1 h-32',
          field.colSpan === 1 && 'col-span-1',
          field.colSpan === 2 && 'col-span-2',
          field.colSpan === 3 && 'col-span-3',
          field.colSpan === 4 && 'col-span-4',
        ]"
      >
        <UFormField
          :label="field.label"
          :name="String(field.name)"
          v-bind="field.wrapperProps"
        >
          <!-- ================== Input (default + date) ================== -->
          <UInput
            v-if="!field.component || field.component === 'input'"
            v-model="form[field.name]"
            v-bind="field.componentProps"
            :ui="{
              root: 'block',
            }"
            :placeholder="`أدخل ${field.label}`"
          />

          <!-- ================== Textarea ================== -->
          <UTextarea
            :ui="{
              root: 'block',
            }"
            v-else-if="field.component === 'textarea'"
            v-model="form[field.name]"
            v-bind="field.componentProps"
            :placeholder="`أدخل ${field.label}`"
          />

          <!-- ================== Select Menu (Search + API) ================== -->
          <!-- داخل GenericForm.vue -->
          <USelect
            v-else-if="field.component === 'select'"
            v-model="form[field.name]"
            :items="field?.items"
            :icon="field.componentProps?.icon"
            :multiple="field.multiple"
            class="w-full"
            trailing-icon="mi:select"
            v-bind="field.componentProps"
          />
          <USelectMenu
            v-else-if="field.component === 'select-menu'"
            v-model="form[field.name]"
            :items="field?.items"
            :icon="field.componentProps?.icon"
            :multiple="field.multiple"
            :searchable="field.searchable"
            :search-input="{
              placeholder: `ابحث عن ${field.label}`,
              icon: 'i-lucide-search',
            }"
            class="w-full"
            trailing-icon="mi:select"
            :loading="
              props.selectLoading?.[field.name] ||
              loadingFields[String(field.name)] ||
              false
            "
            loading-icon="i-lucide-loader"
            @update:searchTerm="onSelectSearch(field, $event)"
            v-bind="field.componentProps"
          />

          <!-- ================== File Upload ================== -->
          <UFileUpload
            :ui="{
              root: 'block',
              file: 'h-32',
            }"
            v-else-if="field.component === 'file'"
            v-model="form[field.name]"
            v-bind="field.componentProps"
          />

          <!-- ================== Switch ================== -->
          <USwitch
            v-else-if="field.component === 'switch'"
            v-model="form[field.name]"
            :label="
              (() => {
                const val = Boolean(form[field.name]);
                return val
                  ? field.componentProps?.trueLabel
                  : field.componentProps?.falseLabel;
              })()
            "
            v-bind="field.componentProps"
          />

          <!-- ================== Custom ================== -->
          <slot
            v-else-if="field.component === 'custom'"
            :name="`field-${String(field.name)}`"
            :model="form"
            :ui="{
              root: 'block',
            }"
          />
        </UFormField>
      </div>
    </template>
  </UForm>
</template>
<style>
.rtl {
  direction: rtl !important;
}
</style>
