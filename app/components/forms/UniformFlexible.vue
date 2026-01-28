<script setup lang="ts">
import type { UniformFlexibleSchedule, DayOfWeek } from "~/types/workSchedule";
import { DAY_NAMES_AR } from "~/types/workSchedule";

/**
 * =========================================================
 * Uniform Flexible Schedule Configuration
 * =========================================================
 * نفس عدد الساعات لكل أيام العمل
 */

/* ================== Props / Emits ================== */

const props = defineProps<{
  modelValue: UniformFlexibleSchedule;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: UniformFlexibleSchedule): void;
}>();

/* ================== State ================== */

const localSchedule = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

/* ================== Days Options ================== */

const daysOptions = computed(() => {
  const days: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
  return days.map((day) => ({
    value: day,
    label: DAY_NAMES_AR[day],
  }));
});

/* ================== Presets ================== */

const hourPresets = [
  { label: "6 ساعات", value: 6 },
  { label: "7 ساعات", value: 7 },
  { label: "8 ساعات", value: 8 },
  { label: "9 ساعات", value: 9 },
  { label: "10 ساعات", value: 10 },
];
</script>

<template>
  <div class="space-y-6">
    <!-- Working Days Selection -->
    <UFormField label="أيام العمل" name="working_days" required>
      <USelectMenu
        v-model="localSchedule.working_days"
        :items="daysOptions"
        value-key="value"
        text-key="label"
        multiple
        searchable
        :search-input="{
          placeholder: 'ابحث عن يوم...',
          icon: 'i-lucide-search',
        }"
        placeholder="اختر أيام العمل"
      >
        <template>
          <span v-if="localSchedule.working_days.length === 0" class="text-muted">
            اختر أيام العمل
          </span>
          <span v-else class="text-highlighted">
            {{ localSchedule.working_days.length }} يوم محدد
          </span>
        </template>
      </USelectMenu>
    </UFormField>

    <!-- Selected Days Preview -->
    <div v-if="localSchedule.working_days.length > 0" class="flex flex-wrap gap-2">
      <UBadge
        v-for="day in localSchedule.working_days"
        :key="day"
        color="primary"
        variant="soft"
      >
        {{ DAY_NAMES_AR[day] }}
      </UBadge>
    </div>

    <!-- Required Hours -->
    <UFormField label="عدد الساعات المطلوبة يومياً" name="required_hours" required>
      <UInput
        v-model.number="localSchedule.required_hours"
        type="number"
        min="1"
        max="24"
        step="0.5"
        icon="i-lucide-clock"
        placeholder="8"
      />
    </UFormField>

    <!-- Quick Presets -->
    <div>
      <label class="block text-sm font-medium text-muted mb-2">
        اختر سريع
      </label>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="preset in hourPresets"
          :key="preset.value"
          :variant="
            localSchedule.required_hours === preset.value ? 'solid' : 'outline'
          "
          :color="
            localSchedule.required_hours === preset.value ? 'primary' : 'neutral'
          "
          size="sm"
          @click="localSchedule.required_hours = preset.value"
        >
          {{ preset.label }}
        </UButton>
      </div>
    </div>

    <!-- Info Card -->
    <UCard
      :ui="{
        body: 'space-y-2',
        // background: 'bg-info/5 dark:bg-info/10',
      }"
    >
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-lightbulb" class="w-5 h-5 text-info mt-0.5" />
        <div class="text-sm space-y-1">
          <p class="font-medium text-highlighted">الدوام المرن</p>
          <p class="text-muted">
            الموظف غير ملزم بأوقات حضور وانصراف محددة، بل يجب عليه إكمال عدد
            الساعات المطلوبة خلال اليوم
          </p>
        </div>
      </div>
    </UCard>

    <!-- Summary Card -->
    <UCard
      :ui="{
        body: 'space-y-3',
        // background: 'bg-success/5 dark:bg-success/10',
      }"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-info" class="w-5 h-5 text-success" />
        <h4 class="font-semibold text-highlighted">ملخص الدوام</h4>
      </div>

      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-muted">عدد أيام العمل:</span>
          <span class="font-medium text-highlighted">
            {{ localSchedule.working_days.length }} أيام
          </span>
        </div>

        <div class="flex justify-between">
          <span class="text-muted">ساعات العمل اليومية:</span>
          <span class="font-medium text-highlighted">
            {{ localSchedule.required_hours }} ساعة
          </span>
        </div>

        <div class="flex justify-between">
          <span class="text-muted">إجمالي الساعات الأسبوعية:</span>
          <span class="font-medium text-success">
            {{ localSchedule.required_hours * localSchedule.working_days.length }} ساعة
          </span>
        </div>
      </div>
    </UCard>
  </div>
</template>
