<script setup lang="ts">
import type { CustomFixedDay } from "~/types/workSchedule";
import { DAY_NAMES_AR } from "~/types/workSchedule";

/* ================== Props / Emits ================== */

const props = defineProps<{
  modelValue: CustomFixedDay[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: CustomFixedDay[]): void;
}>();

/* ================== State ================== */

const localDays = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

/* ================== Helpers ================== */

/**
 * تحويل الوقت HH:mm إلى دقائق (دالة مضمونة)
 */
const timeToMinutes = (time: string): number => {
  const parts = time.split(":");

  if (parts.length !== 2) return 0;

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return 0;

  return hour * 60 + minute;
};

/**
 * إضافة فترة جديدة ليوم معين
 */
const addPeriod = (dayIndex: number) => {
  const day = localDays.value[dayIndex];
  if (!day) return;

  day.periods.push({
    period_index: day.periods.length + 1,
    start_time: "08:00",
    end_time: "16:00",
    grace_period_in_minutes: 10,
    early_leave_grace_minutes: 5,
  });

  emit("update:modelValue", [...localDays.value]);
};

/**
 * حذف فترة
 */
const removePeriod = (dayIndex: number, periodIndex: number) => {
  const day = localDays.value[dayIndex];
  if (!day) return;

  day.periods.splice(periodIndex, 1);

  day.periods.forEach((p, i) => {
    p.period_index = i + 1;
  });

  emit("update:modelValue", [...localDays.value]);
};

/**
 * تفعيل / تعطيل يوم عمل
 */
const toggleWorkingDay = (dayIndex: number) => {
  const day = localDays.value[dayIndex];
  if (!day) return;

  day.is_working_day = !day.is_working_day;

  if (day.is_working_day && day.periods.length === 0) {
    day.periods.push({
      period_index: 1,
      start_time: "08:00",
      end_time: "16:00",
      grace_period_in_minutes: 10,
      early_leave_grace_minutes: 5,
    });
  }

  emit("update:modelValue", [...localDays.value]);
};

/**
 * نسخ الفترات إلى جميع أيام العمل
 */
const copyToAllWorkingDays = (sourceDay: CustomFixedDay) => {
  const updated = localDays.value.map((day) => {
    if (!day.is_working_day) return day;

    return {
      ...day,
      periods: sourceDay.periods.map((p) => ({ ...p })),
    };
  });

  emit("update:modelValue", updated);
};

/**
 * حساب ساعات اليوم
 */
const calculateDayHours = (day: CustomFixedDay): number => {
  if (!day.is_working_day) return 0;

  let totalMinutes = 0;

  for (const period of day.periods) {
    const diff =
      timeToMinutes(period.end_time) -
      timeToMinutes(period.start_time);

    totalMinutes += Math.max(0, diff);
  }

  return totalMinutes / 60;
};

/* ================== Computed ================== */

const totalWeeklyHours = computed(() =>
  localDays.value
    .reduce((sum, day) => sum + calculateDayHours(day), 0)
    .toFixed(1),
);

const workingDaysCount = computed(
  () => localDays.value.filter((d) => d.is_working_day).length,
);
</script>

<template>
  <div class="space-y-6">
    <!-- Info -->
    <UCard>
      <div class="flex gap-3">
        <UIcon name="i-lucide-calendar-cog" class="w-5 h-5 text-warning" />
        <div>
          <p class="font-semibold">إعدادات مخصصة</p>
          <p class="text-sm text-muted">
            يمكنك تحديد عدة فترات لكل يوم
          </p>
        </div>
      </div>
    </UCard>

    <!-- Days -->
    <div class="space-y-4">
      <div
        v-for="(day, dayIndex) in localDays"
        :key="day.day_of_week"
        class="border rounded-lg p-4 space-y-4"
        :class="day.is_working_day ? 'bg-success/5' : 'opacity-60'"
      >
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <USwitch
              :model-value="day.is_working_day"
              @update:model-value="toggleWorkingDay(dayIndex)"
            />

            <div>
              <strong>{{ DAY_NAMES_AR[day.day_of_week] }}</strong>
              <p class="text-sm text-muted">
                {{
                  day.is_working_day
                    ? `${day.periods.length} فترات - ${calculateDayHours(day).toFixed(1)} ساعة`
                    : "يوم راحة"
                }}
              </p>
            </div>
          </div>

          <UButton
            v-if="day.is_working_day && day.periods.length"
            icon="i-lucide-copy"
            variant="ghost"
            size="sm"
            @click="copyToAllWorkingDays(day)"
          />
        </div>

        <!-- Periods -->
        <div v-if="day.is_working_day" class="space-y-3 ps-10">
          <div
            v-for="(period, periodIndex) in day.periods"
            :key="periodIndex"
            class="border rounded p-3 space-y-3"
          >
            <div class="flex justify-between">
              <span>الفترة {{ period.period_index }}</span>

              <UButton
                v-if="day.periods.length > 1"
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                @click="removePeriod(dayIndex, periodIndex)"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <UInput v-model="period.start_time" type="time" />
              <UInput v-model="period.end_time" type="time" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <UInput v-model.number="period.grace_period_in_minutes" type="number" min="0" />
              <UInput v-model.number="period.early_leave_grace_minutes" type="number" min="0" />
            </div>
          </div>

          <UButton
            icon="i-lucide-plus"
            label="إضافة فترة"
            block
            variant="soft"
            @click="addPeriod(dayIndex)"
          />
        </div>
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
          <span>الساعات الأسبوعية</span>
          <strong class="text-success">{{ totalWeeklyHours }}</strong>
        </div>
      </div>
    </UCard>
  </div>
</template>
