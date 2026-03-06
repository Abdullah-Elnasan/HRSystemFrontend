<script setup lang="ts" generic="T extends Record<string, any>">
import type { FormSubmitEvent } from "#ui/types";
import { useFormModel } from "~/composables/useFormModel";

// =========================================================
// Types
// =========================================================

export type FieldComponent =
  | "input"
  | "textarea"
  | "select"
  | "select-menu"
  | "file"
  | "switch"
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
  renderLabel?: (value: any, items?: any[]) => string;
  /** Layout */
  colSpan?: 1 | 2 | 3 | 4;
}

// =========================================================
// Props & Emits
// =========================================================

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

// =========================================================
// State
// =========================================================

const gridCols = computed(() => props.columns ?? 2);
const form = useFormModel(toRef(props, "modelValue"), emit);

// =========================================================
// Icon Color Token
// =========================================================

/**
 * Shared `ui` config injected into every UInput and USelectMenu.
 *
 * Nuxt UI exposes a `leadingIcon` / `trailingIcon` slot class token
 * inside the component's `ui` prop. We use `text-[var(...)]` to point
 * directly at our CSS custom property so the icon colour follows the
 * brand without any extra CSS.
 *
 * --color-secondary-600 (#0097A7) is the brand's "teal active" shade —
 * visible on white but not as heavy as -800.
 */
const inputUi = {
  leadingIcon: "text-[var(--color-secondary-600)]",
  trailingIcon: "text-[var(--color-secondary-400)]",
} as const;

/**
 * USelectMenu uses slightly different token names.
 * `leadingIcon`  → the field icon passed via componentProps.icon
 * `trailingIcon` → the chevron / trailing arrow
 */
const selectUi = {
  leadingIcon:  "text-[var(--color-secondary-600)]",
  trailingIcon: "text-[var(--color-secondary-400)]",
} as const;

// =========================================================
// Handlers
// =========================================================

const onSubmit = (_: FormSubmitEvent<T>) => emit("submit", form.value);
const submit   = () => emit("submit", form.value);

const loadingFields     = ref<Record<string, boolean>>({});
const searchTimeouts    = ref<Record<string, ReturnType<typeof setTimeout>>>({});

/**
 * Debounced search handler for searchable select menus.
 * Waits 300 ms after the user stops typing before calling the API.
 */
function onSelectSearch(field: Field<T>, query: string) {
  const key = String(field.name);
  clearTimeout(searchTimeouts.value[key]);

  searchTimeouts.value[key] = setTimeout(async () => {
    if (!query || !field.searchApi) return;
    loadingFields.value[key] = true;
    try {
      field.items = [...(await field.searchApi(query))];
    } finally {
      loadingFields.value[key] = false;
    }
  }, 300);
}

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
          field.colSpan === 1 && field.component === 'file' && 'col-span-1 h-full',
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
          :required="field.componentProps?.required || false"

          >

          <!-- ── Text Input ──────────────────────────────── -->
          <UInput
            v-if="!field.component || field.component === 'input'"
            v-model="form[field.name]"
            :ui="inputUi"
            v-bind="field.componentProps"
            :placeholder="field.componentProps?.placeholder ?? `أدخل ${field.label}`"
            class="block w-full"
          />

          <!-- ── Textarea ───────────────────────────────── -->
          <UTextarea
            v-else-if="field.component === 'textarea'"
            v-model="form[field.name]"
            :ui="inputUi"
            v-bind="field.componentProps"
            :placeholder="field.componentProps?.placeholder ?? `أدخل ${field.label}`"
            class="block w-full"
          />

          <!-- ── Basic Select ───────────────────────────── -->
          <USelect
            v-else-if="field.component === 'select'"
            v-model="form[field.name]"
            :items="field.items"
            :multiple="field.multiple"
            :ui="selectUi"
            trailing-icon="mi:select"
            class="w-full"
            v-bind="field.componentProps"
          />

          <!-- ── Searchable Select Menu ─────────────────── -->
          <!--
            Icon color is set via :ui="selectUi".
            Nuxt UI's USelectMenu applies `leadingIcon` to the
            left icon and `trailingIcon` to the chevron, both of
            which we map to our brand CSS variables.
          -->
          <USelectMenu
            v-else-if="field.component === 'select-menu'"
            v-model="form[field.name]"
            :items="field.items"
            :multiple="field.multiple"
            :searchable="field.searchable"
            :ui="selectUi"
            trailing-icon="mi:select"
            :loading="
              props.selectLoading?.[field.name] ||
              loadingFields[String(field.name)] ||
              false
            "
            loading-icon="i-lucide-loader-circle"
            class="w-full"
            v-bind="field.componentProps"
            @update:searchTerm="onSelectSearch(field, $event)"
          />

          <!-- ── File Upload ────────────────────────────── -->
          <UFileUpload
            v-else-if="field.component === 'file'"
            v-model="form[field.name]"
            :ui="{ root: 'h-full block', file: 'h-full'}"
            v-bind="field.componentProps"
          />

          <!-- ── Toggle Switch ──────────────────────────── -->
          <USwitch
            v-else-if="field.component === 'switch'"
            v-model="form[field.name]"
            :label="
              Boolean(form[field.name])
                ? field.componentProps?.trueLabel
                : field.componentProps?.falseLabel
            "
            v-bind="field.componentProps"
          />

          <!-- ── Custom Slot ────────────────────────────── -->
          <slot
            v-else-if="field.component === 'custom'"
            :name="`field-${String(field.name)}`"
            :model="form"
          />

        </UFormField>
      </div>
    </template>
  </UForm>
</template>

<style>
/* RTL support applied globally so child portals (dropdowns) also inherit it */
.rtl { direction: rtl !important; }
</style>
