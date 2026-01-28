<script setup lang="ts">
import type { WorkScheduleBasicForm, WorkScheduleType } from "~/types/workSchedule";

/**
 * =========================================================
 * Step 1: Basic Information Form
 * =========================================================
 * يجمع المعلومات الأساسية:
 * - الاسم بالعربية والإنجليزية
 * - نوع الدوام (ثابت/مرن)
 * - الوصف (اختياري)
 * - حالة التفعيل
 */

/* ================== Props / Emits ================== */

const props = defineProps<{
  modelValue: WorkScheduleBasicForm;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: WorkScheduleBasicForm): void;
}>();

/* ================== State ================== */

const localForm = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

/* ================== Type Options ================== */

const typeOptions = [
  { value: "fixed", label: "دوام ثابت", icon: "i-lucide-clock" },
  { value: "flexible", label: "دوام مرن", icon: "i-lucide-calendar-clock" },
];
</script>

<template>
  <div class="space-y-6">
    <!-- Name Arabic -->
    <UFormField label="الاسم بالعربية" name="name_ar" required>
      <UInput
        v-model="localForm.name_ar"
        placeholder="مثال: دوام صباحي ثابت"
        icon="i-lucide-text"
      />
    </UFormField>

    <!-- Name English -->
    <UFormField label="الاسم بالإنجليزية" name="name_en" required>
      <UInput
        v-model="localForm.name_en"
        placeholder="Example: Fixed Morning Shift"
        icon="i-lucide-text"
      />
    </UFormField>

    <!-- Type Selection -->
    <UFormField label="نوع الدوام" name="type" required>
      <USelectMenu
        v-model="localForm.type"
        :items="typeOptions"
        value-key="value"
        text-key="label"
        >
        <!-- :ui="{ trailing: { padding: { sm: 'pe-7' } } }" -->
        <template #leading>
          <UIcon
            :name="
              typeOptions.find((t) => t.value === localForm.type)?.icon ||
              'i-lucide-calendar'
            "
            class="w-5 h-5"
          />
        </template>

        <template #item="{ item }">
          <div class="flex items-center gap-2">
            <UIcon :name="item.icon" class="w-4 h-4" />
            <span>{{ item.label }}</span>
          </div>
        </template>
      </USelectMenu>
    </UFormField>

    <!-- Description Arabic (Optional) -->
    <UFormField label="الوصف بالعربية (اختياري)" name="description_ar">
      <UTextarea
        v-model="localForm.description_ar"
        placeholder="وصف تفصيلي للنظام..."
        :rows="3"
      />
    </UFormField>

    <!-- Description English (Optional) -->
    <UFormField label="الوصف بالإنجليزية (اختياري)" name="description_en">
      <UTextarea
        v-model="localForm.description_en"
        placeholder="Detailed description..."
        :rows="3"
      />
    </UFormField>

    <!-- Active Status -->
    <UFormField label="حالة النظام" name="is_active">
      <div class="flex items-center gap-3">
        <USwitch v-model="localForm.is_active" />
        <span class="text-sm text-muted">
          {{ localForm.is_active ? "النظام نشط" : "النظام غير نشط" }}
        </span>
      </div>
    </UFormField>

    <!-- Info Card -->
    <UCard
      :ui="{
        body: 'space-y-2 bg-primary/5 dark:bg-primary/10',
        // background: 'bg-primary/5 dark:bg-primary/10',
      }"
    >
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-info" class="w-5 h-5 text-primary mt-0.5" />
        <div class="text-sm space-y-1">
          <p class="font-medium text-highlighted">
            {{ localForm.type === "fixed" ? "دوام ثابت" : "دوام مرن" }}
          </p>
          <p class="text-muted">
            {{
              localForm.type === "fixed"
                ? "يتطلب أوقات حضور وانصراف محددة يومياً"
                : "يتطلب عدد ساعات محدد يومياً بدون أوقات ثابتة"
            }}
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>
