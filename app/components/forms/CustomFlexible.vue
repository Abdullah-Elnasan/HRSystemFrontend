<script setup lang="ts">
import type { CustomFlexibleDay } from "~/types/workSchedule";
import { DAY_NAMES_AR } from "~/types/workSchedule";

/* ================== Props / Emits ================== */

const props = defineProps<{
  modelValue: CustomFlexibleDay[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: CustomFlexibleDay[]): void;
}>();

/* ================== State ================== */

const localDays = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

/* ================== Helpers ================== */

/**
 * تبديل حالة يوم العمل
 */
const toggleWorkingDay = (dayIndex: number) => {
  const day = localDays.value[dayIndex];
  if (!day) return;

  day.is_working_day = !day.is_working_day;

  // إذا أصبح يوم عمل، ضع ساعات افتراضية
  if (day.is_working_day && day.required_hours === 0) {
    day.required_hours = 8;
  }

  emit("update:modelValue", [...localDays.value]);
};

/**
 * نسخ ساعات يوم إلى جميع أيام العمل
 */
const copyToAllWorkingDays = (hours: number) => {
  const updated = localDays.value.map((day) => {
    if (!day.is_working_day) return day;

    return {
      ...day,
      required_hours: hours,
    };
  });

  emit("update:modelValue", updated);
};

/* ================== Computed ================== */

const workingDaysCount = computed(() =>
  localDays.value.filter((d) => d.is_working_day).length,
);

const totalWeeklyHours = computed(() =>
  localDays.value
    .filter((d) => d.is_working_day)
    .reduce((sum, day) => sum + day.required_hours, 0)
    .toFixed(1),
);

const averageHoursPerDay = computed(() => {
  if (workingDaysCount.value === 0) return "0";
  return (
    Number(totalWeeklyHours.value) / workingDaysCount.value
  ).toFixed(1);
});
</script>

<template>
  <div class="space-y-6">
    <!-- Info Header -->
    <UCard :ui="{ body: 'space-y-2' }">
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-calendar-range" class="w-5 h-5 text-info mt-0.5" />
        <div class="text-sm space-y-1">
          <p class="font-medium text-highlighted">ساعات مخصصة لكل يوم</p>
          <p class="text-muted">
            حدد عدد ساعات مختلف لكل يوم عمل
          </p>
        </div>
      </div>
    </UCard>

    <!-- Days -->
    <div class="space-y-3">
      <div
        v-for="(day, dayIndex) in localDays"
        :key="day.day_of_week"
        class="border rounded-lg p-4 transition-all"
        :class="day.is_working_day ? 'bg-success/5' : 'opacity-60'"
      >
        <div class="flex items-center justify-between gap-4">
          <!-- Switch & Name -->
          <div class="flex items-center gap-3 flex-1">
            <USwitch
              :model-value="day.is_working_day"
              @update:model-value="toggleWorkingDay(dayIndex)"
            />

            <div>
              <h3 class="font-semibold">
                {{ DAY_NAMES_AR[day.day_of_week] }}
              </h3>
              <p class="text-xs text-muted">
                {{ day.is_working_day ? "يوم عمل" : "يوم راحة" }}
              </p>
            </div>
          </div>

          <!-- Hours -->
          <div
            v-if="day.is_working_day"
            class="flex items-center gap-2 max-w-60"
          >
            <UInput
              v-model.number="day.required_hours"
              type="number"
              min="0.5"
              max="24"
              step="0.5"
              size="sm"
            >
              <template #trailing>
                <span class="text-xs text-muted">ساعة</span>
              </template>
            </UInput>

            <UButton
              icon="i-lucide-copy"
              variant="ghost"
              size="sm"
              @click="copyToAllWorkingDays(day.required_hours)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-muted">إجراءات سريعة</label>
      <div class="flex gap-2 flex-wrap">
        <UButton label="8 ساعات" size="sm" variant="soft" @click="copyToAllWorkingDays(8)" />
        <UButton label="7 ساعات" size="sm" variant="soft" @click="copyToAllWorkingDays(7)" />
        <UButton label="6 ساعات" size="sm" variant="soft" @click="copyToAllWorkingDays(6)" />
      </div>
    </div>

    <!-- Summary -->
    <UCard>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span>أيام العمل</span>
          <strong>{{ workingDaysCount }}</strong>
        </div>
        <div class="flex justify-between">
          <span>متوسط الساعات</span>
          <strong>{{ averageHoursPerDay }}</strong>
        </div>
        <div class="flex justify-between">
          <span>الساعات الأسبوعية</span>
          <strong class="text-success">{{ totalWeeklyHours }}</strong>
        </div>
      </div>
    </UCard>
  </div>
</template>
