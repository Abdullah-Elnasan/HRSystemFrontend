<script setup lang="ts">
import type { WorkScheduleForm } from "~/types/workSchedule";
import { DAY_NAMES_AR } from "~/types/workSchedule";

/* ================== Props ================== */

const props = defineProps<{
  form: WorkScheduleForm;
}>();

/* ================== Helpers ================== */

const timeToMinutes = (time?: string): number => {
  if (!time) return 0;

  const parts = time.split(":");
  if (parts.length !== 2) return 0;

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return 0;

  return hour * 60 + minute;
};

/* ================== Computed ================== */

const scheduleTypeLabel = computed(() =>
  props.form.type === "fixed" ? "دوام ثابت" : "دوام مرن",
);

const scheduleTypeIcon = computed(() =>
  props.form.type === "fixed"
    ? "i-lucide-clock"
    : "i-lucide-calendar-clock",
);

const configTypeLabel = computed(() =>
  props.form.use_uniform_schedule ? "جدول موحد" : "جدول مخصص",
);

/**
 * أيام العمل وتفاصيلها
 */
const workingDaysDetails = computed(() => {
  const details: Array<{ day: string; info: string }> = [];

  if (props.form.use_uniform_schedule) {
    if (props.form.type === "fixed" && props.form.uniform_fixed) {
      const { working_days, start_time, end_time } = props.form.uniform_fixed;

      working_days.forEach((day) => {
        details.push({
          day: DAY_NAMES_AR[day],
          info: `${start_time} - ${end_time}`,
        });
      });
    }

    if (props.form.type === "flexible" && props.form.uniform_flexible) {
      const { working_days, required_hours } = props.form.uniform_flexible;

      working_days.forEach((day) => {
        details.push({
          day: DAY_NAMES_AR[day],
          info: `${required_hours} ساعة`,
        });
      });
    }
  } else {
    if (props.form.type === "fixed" && props.form.custom_fixed_days) {
      props.form.custom_fixed_days
        .filter((d) => d.is_working_day)
        .forEach((day) => {
          const periods = day.periods
            .map((p) => `${p.start_time}-${p.end_time}`)
            .join(" | ");

          details.push({
            day: DAY_NAMES_AR[day.day_of_week],
            info: periods,
          });
        });
    }

    if (props.form.type === "flexible" && props.form.custom_flexible_days) {
      props.form.custom_flexible_days
        .filter((d) => d.is_working_day)
        .forEach((day) => {
          details.push({
            day: DAY_NAMES_AR[day.day_of_week],
            info: `${day.required_hours} ساعة`,
          });
        });
    }
  }

  return details;
});

/**
 * إجمالي الساعات الأسبوعية
 */
const totalWeeklyHours = computed(() => {
  let totalMinutes = 0;

  if (props.form.use_uniform_schedule) {
    if (props.form.type === "fixed" && props.form.uniform_fixed) {
      const { working_days, start_time, end_time } =
        props.form.uniform_fixed;

      const dailyMinutes =
        timeToMinutes(end_time) - timeToMinutes(start_time);

      totalMinutes = dailyMinutes * working_days.length;
    }

    if (props.form.type === "flexible" && props.form.uniform_flexible) {
      totalMinutes =
        props.form.uniform_flexible.required_hours *
        props.form.uniform_flexible.working_days.length *
        60;
    }
  } else {
    if (props.form.type === "fixed" && props.form.custom_fixed_days) {
      props.form.custom_fixed_days
        .filter((d) => d.is_working_day)
        .forEach((day) => {
          day.periods.forEach((period) => {
            totalMinutes +=
              timeToMinutes(period.end_time) -
              timeToMinutes(period.start_time);
          });
        });
    }

    if (props.form.type === "flexible" && props.form.custom_flexible_days) {
      totalMinutes =
        props.form.custom_flexible_days
          .filter((d) => d.is_working_day)
          .reduce((sum, d) => sum + d.required_hours, 0) * 60;
    }
  }

  return (totalMinutes / 60).toFixed(1);
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
      <UIcon name="i-lucide-clipboard-check" class="w-12 h-12 text-primary mx-auto" />
      <h3 class="text-xl font-bold text-highlighted">مراجعة النظام</h3>
      <p class="text-sm text-muted">
        تأكد من صحة المعلومات قبل الحفظ
      </p>
    </div>

    <!-- Basic Information -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-file-text" class="w-5 h-5 text-primary" />
          <h4 class="font-semibold text-highlighted">المعلومات الأساسية</h4>
        </div>
      </template>

      <div class="space-y-3 text-sm">
        <div class="flex justify-between">
          <span class="text-muted">الاسم بالعربية:</span>
          <span class="font-medium text-highlighted">{{ form.name_ar }}</span>
        </div>

        <div class="flex justify-between">
          <span class="text-muted">الاسم بالإنجليزية:</span>
          <span class="font-medium text-highlighted">{{ form.name_en }}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-muted">نوع الدوام:</span>
          <UBadge :color="form.type === 'fixed' ? 'success' : 'info'" variant="soft">
            <div class="flex items-center gap-1">
              <UIcon :name="scheduleTypeIcon" class="w-4 h-4" />
              {{ scheduleTypeLabel }}
            </div>
          </UBadge>
        </div>

        <div v-if="form.description_ar" class="flex justify-between">
          <span class="text-muted">الوصف:</span>
          <span class="font-medium text-highlighted max-w-60 text-left">
            {{ form.description_ar }}
          </span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-muted">الحالة:</span>
          <UBadge :color="form.is_active ? 'success' : 'error'" variant="soft">
            {{ form.is_active ? "نشط" : "غير نشط" }}
          </UBadge>
        </div>
      </div>
    </UCard>

    <!-- Schedule Configuration -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-calendar" class="w-5 h-5 text-primary" />
          <h4 class="font-semibold text-highlighted">تكوين الجدول</h4>
        </div>
      </template>

      <div class="space-y-4">
        <!-- Config Type -->
        <div class="flex justify-between items-center pb-3 border-b border-default">
          <span class="text-muted text-sm">نوع الإعداد:</span>
          <UBadge color="primary" variant="soft">
            {{ configTypeLabel }}
          </UBadge>
        </div>

        <!-- Working Days List -->
        <div class="space-y-2">
          <h5 class="text-sm font-semibold text-highlighted">أيام العمل:</h5>
          <div class="space-y-2">
            <div
              v-for="detail in workingDaysDetails"
              :key="detail.day"
              class="flex justify-between items-center p-2 rounded bg-muted/10"
            >
              <span class="font-medium text-highlighted">{{ detail.day }}</span>
              <span class="text-sm text-muted">{{ detail.info }}</span>
            </div>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="pt-3 border-t border-default space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-muted">عدد أيام العمل:</span>
            <span class="font-semibold text-highlighted">
              {{ workingDaysDetails.length }} أيام
            </span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted">إجمالي الساعات الأسبوعية:</span>
            <span class="font-semibold text-success">
              {{ totalWeeklyHours }} ساعة
            </span>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Warning Card -->
    <UCard
      :ui="{
        body: 'space-y-2',
        // background: 'bg-warning/5 dark:bg-warning/10',
      }"
    >
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-warning mt-0.5" />
        <div class="text-sm space-y-1">
          <p class="font-medium text-highlighted">تنبيه</p>
          <p class="text-muted">
            بعد حفظ النظام، سيتم تطبيقه على الموظفين المرتبطين به. تأكد من صحة
            جميع البيانات.
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>
