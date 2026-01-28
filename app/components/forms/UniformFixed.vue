<script setup lang="ts">
import type { UniformFixedSchedule, DayOfWeek } from "~/types/workSchedule";
import { DAY_NAMES_AR } from "~/types/workSchedule";
import { computed } from "vue";

/**
 * =========================================================
 * Uniform Fixed Schedule Configuration
 * =========================================================
 * نفس الأوقات لكل أيام العمل المحددة
 */

/* ================== Props / Emits ================== */

const props = defineProps<{
  modelValue: UniformFixedSchedule;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: UniformFixedSchedule): void;
}>();

/* ================== Model ================== */

const localSchedule = computed<UniformFixedSchedule>({
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

/* ================== Helpers ================== */

function timeToMinutes(time?: string): number | null {
  if (!time) return null;

  const parts = time.split(":");
  if (parts.length !== 2) return null;

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

  return hour * 60 + minute;
}

/* ================== Computed ================== */

const dailyHours = computed(() => {
  const start = timeToMinutes(localSchedule.value.start_time);
  const end = timeToMinutes(localSchedule.value.end_time);

  if (start === null || end === null || end <= start) {
    return 0;
  }

  return Number(((end - start) / 60).toFixed(1));
});

const totalWeeklyHours = computed(() => {
  return Number(
    (dailyHours.value * localSchedule.value.working_days.length).toFixed(1)
  );
});
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
        placeholder="اختر أيام العمل"
        :search-input="{
          placeholder: 'ابحث عن يوم...',
          icon: 'i-lucide-search',
        }"
      />
    </UFormField>

    <!-- Selected Days Preview -->
    <div v-if="localSchedule.working_days.length" class="flex flex-wrap gap-2">
      <UBadge
        v-for="day in localSchedule.working_days"
        :key="day"
        color="primary"
        variant="soft"
      >
        {{ DAY_NAMES_AR[day] }}
      </UBadge>
    </div>

    <!-- Time Range -->
    <div class="grid grid-cols-2 gap-4">
      <UFormField label="وقت الحضور" name="start_time" required>
        <UInput
          v-model="localSchedule.start_time"
          type="time"
          icon="i-lucide-clock"
        />
      </UFormField>

      <UFormField label="وقت الانصراف" name="end_time" required>
        <UInput
          v-model="localSchedule.end_time"
          type="time"
          icon="i-lucide-clock"
        />
      </UFormField>
    </div>

    <!-- Grace Periods -->
    <div class="grid grid-cols-2 gap-4">
      <UFormField label="سماح الحضور (دقائق)">
        <UInput
          v-model.number="localSchedule.grace_period_in_minutes"
          type="number"
          min="0"
          max="60"
          icon="i-lucide-timer"
        />
      </UFormField>

      <UFormField label="سماح الانصراف (دقائق)">
        <UInput
          v-model.number="localSchedule.early_leave_grace_minutes"
          type="number"
          min="0"
          max="60"
          icon="i-lucide-timer"
        />
      </UFormField>
    </div>

    <!-- Summary -->
    <UCard :ui="{ body: 'space-y-3' }">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-info" class="w-5 h-5 text-success" />
        <h4 class="font-semibold text-highlighted">ملخص الدوام</h4>
      </div>

      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-muted">عدد أيام العمل:</span>
          <span class="font-medium">{{ localSchedule.working_days.length }} أيام</span>
        </div>

        <div class="flex justify-between">
          <span class="text-muted">ساعات العمل اليومية:</span>
          <span class="font-medium">{{ dailyHours }} ساعة</span>
        </div>

        <div class="flex justify-between">
          <span class="text-muted">إجمالي الساعات الأسبوعية:</span>
          <span class="font-medium text-success">{{ totalWeeklyHours }} ساعة</span>
        </div>
      </div>
    </UCard>
  </div>
</template>
