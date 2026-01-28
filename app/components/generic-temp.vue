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
    emit("submit", form.value);
  };

  const loadingFields = ref<any>({
    department_id: false,
    branch_id: false,
  });

  const searchTimeouts = ref<Record<string, any>>({});

  const onSelectSearch = (field: Field<T>, query: string) => {
    if (!field.searchApi) return;

    const key = String(field.name);
    const searchApi = field.searchApi; // حفظ reference لتجنب مشاكل TypeScript

    if (searchTimeouts.value[key]) {
      clearTimeout(searchTimeouts.value[key]);
    }

    searchTimeouts.value[key] = setTimeout(async () => {
      if (!query || query.trim() === "") {
        // إذا كان البحث فارغاً، لا تفعل شيئاً أو أعد القائمة الكاملة
        return;
      }

      loadingFields.value[field.name] = true;

      try {
        const res = await searchApi(query);

        // تحديث items في componentProps إذا كان موجوداً
        if (field.componentProps) {
          if (isRef(field.componentProps)) {
            // إذا كان componentProps كله computed
            const propsValue = field.componentProps.value;
            if (propsValue && typeof propsValue === 'object' && propsValue !== null && 'items' in propsValue) {
              // لا يمكن تحديث computed مباشرة، لذا نحدث items المباشر
              field.items = [...res];
            }
          } else if (typeof field.componentProps === 'object' && field.componentProps !== null && 'items' in field.componentProps) {
            if (isRef(field.componentProps.items)) {
              field.componentProps.items.value = [...res];
            } else {
              field.componentProps.items = [...res];
            }
          }
        }

        // تحديث items المباشر للتوافق
        field.items = [...res];
      } catch (error) {
        console.error(`Error searching ${String(field.name)}:`, error);
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
            <USelectMenu
              v-else-if="field.component === 'select-menu'"
              v-model="form[field.name]"
              :items="
                (() => {
                  // التعامل مع componentProps كـ computed
                  if (isRef(field.componentProps)) {
                    const propsValue = field.componentProps.value;
                    if (propsValue && typeof propsValue === 'object' && propsValue !== null && 'items' in propsValue) {
                      return (propsValue as any).items ?? field.items ?? [];
                    }
                    return field.items ?? [];
                  }
                  // التعامل مع componentProps كـ object عادي
                  if (field.componentProps && typeof field.componentProps === 'object' && field.componentProps !== null) {
                    if (isRef(field.componentProps.items)) {
                      return field.componentProps.items.value;
                    }
                    if ('items' in field.componentProps) {
                      return (field.componentProps as any).items ?? field.items ?? [];
                    }
                  }
                  // استخدام items المباشر
                  return field.items ?? [];
                })()
              "
              :icon="
                (() => {
                  if (isRef(field.componentProps)) {
                    const propsValue = field.componentProps.value;
                    if (propsValue && typeof propsValue === 'object' && propsValue !== null && 'icon' in propsValue) {
                      return (propsValue as any).icon;
                    }
                    return undefined;
                  }
                  if (field.componentProps && typeof field.componentProps === 'object' && field.componentProps !== null && 'icon' in field.componentProps) {
                    return (field.componentProps as any).icon;
                  }
                  return undefined;
                })()
              "
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
              v-bind="
                (() => {
                  if (!field.componentProps) return {};

                  // إذا كان componentProps هو computed
                  if (isRef(field.componentProps)) {
                    const propsValue = field.componentProps.value;
                    if (typeof propsValue === 'object' && propsValue !== null) {
                      const { items, ...rest } = propsValue as any;
                      return rest;
                    }
                    return {};
                  }

                  // إذا كان componentProps هو object عادي
                  if (typeof field.componentProps === 'object' && field.componentProps !== null) {
                    const { items, ...rest } = field.componentProps as any;
                    return rest;
                  }

                  return {};
                })()
              "
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
