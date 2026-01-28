<script setup lang="ts">
import type { WorkScheduleForm } from "~/types/workSchedule";
import {
  emptyWorkScheduleForm,
  createEmptyCustomDays,
  transformFormToPayload,
} from "~/types/workSchedule";

/**
 * =========================================================
 * Main Work Schedule Form (Multi-Step Wizard)
 * =========================================================
 * نموذج متعدد الخطوات لإنشاء أو تعديل نظام دوام
 */

/* ================== Props / Emits ================== */

const props = defineProps<{
  modelValue: WorkScheduleForm;
  mode?: "create" | "edit";
  columns?: 1 | 2 | 3 | 4;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: WorkScheduleForm): void;
  (e: "submit", value: WorkScheduleForm): void;
}>();

/* ================== State ================== */

const currentStep = ref(1);
const totalSteps = 3;

const localForm = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

/* ================== Initialize Custom Days ================== */

// تأكد من وجود أيام مخصصة عند التبديل
watch(
  () => localForm.value.use_uniform_schedule,
  (useUniform) => {
    if (!useUniform) {
      const emptyDays = createEmptyCustomDays();
      if (!localForm.value.custom_fixed_days) {
        localForm.value.custom_fixed_days = emptyDays.fixed;
      }
      if (!localForm.value.custom_flexible_days) {
        localForm.value.custom_flexible_days = emptyDays.flexible;
      }
    }
  }
);

/* ================== Navigation ================== */

const goToStep = (step: number) => {
  if (step >= 1 && step <= totalSteps) {
    currentStep.value = step;
  }
};

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

/* ================== Submission ================== */

const submit = () => {
  emit("submit", localForm.value);
};

defineExpose({ submit });

/* ================== Step Indicators ================== */

const steps = computed(() => [
  {
    number: 1,
    title: "المعلومات الأساسية",
    icon: "i-lucide-file-text",
  },
  {
    number: 2,
    title: "تكوين الجدول",
    icon: "i-lucide-calendar",
  },
  {
    number: 3,
    title: "المراجعة والتأكيد",
    icon: "i-lucide-check-circle",
  },
]);
</script>

<template>
  <div class="space-y-6" dir="rtl">
    <!-- Step Indicators -->
    <div class="flex  items-center justify-between">
      <div
        v-for="(step, idx) in steps"
        :key="step.number"
        class="flex items-center flex-1"
      >
        <!-- Step Circle -->
        <div class="flex items-center gap-3">


          <!-- Step Title (Hidden on mobile) -->
          <span
            class="hidden sm:block text-sm font-medium"
            :class="{
              'text-highlighted': currentStep >= step.number,
              'text-muted': currentStep < step.number,
            }"
          >
            {{ step.title }}
          </span>

          <div
            class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all"
            :class="{
              'bg-primary border-primary text-white': currentStep >= step.number,
              'border-muted text-muted': currentStep < step.number,
            }"
          >
            <UIcon
              v-if="currentStep > step.number"
              name="i-lucide-check"
              class="w-5 h-5"
            />
            <span v-else class="font-semibold text-sm">{{ step.number }}</span>
          </div>
        </div>

        <!-- Connector Line -->
        <div
          v-if="idx < steps.length - 1"
          class="flex-1 h-0.5 mx-2 sm:mx-4 transition-all"
          :class="{
            'bg-primary': currentStep > step.number,
            'bg-muted': currentStep <= step.number,
          }"
        />
      </div>
    </div>

    <!-- Form Content -->
    <div class="min-h-100">
      <!-- Step 1: Basic Information -->
      <div v-show="currentStep === 1">
        <FormsStep1Basic v-model="localForm" />
      </div>

      <!-- Step 2: Schedule Configuration -->
      <div v-show="currentStep === 2" class="space-y-6">
        <!-- Uniform Toggle -->
        <UFormField label="نوع الإعداد" name="use_uniform_schedule">
          <div class="flex items-center gap-3">
            <USwitch v-model="localForm.use_uniform_schedule" />
            <span class="text-sm text-muted">
              {{
                localForm.use_uniform_schedule
                  ? "جدول موحد لجميع الأيام"
                  : "جدول مخصص لكل يوم"
              }}
            </span>
          </div>
        </UFormField>

        <!-- Fixed Type -->
        <template v-if="localForm.type === 'fixed'">
          <!-- Uniform Fixed -->
          <FormsUniformFixed
            v-if="localForm.use_uniform_schedule && localForm.uniform_fixed"
            v-model="localForm.uniform_fixed"
          />

          <!-- Custom Fixed -->
          <FormsCustomFixed
            v-else-if="!localForm.use_uniform_schedule && localForm.custom_fixed_days"
            v-model="localForm.custom_fixed_days"
          />
        </template>

        <!-- Flexible Type -->
        <template v-else>
          <!-- Uniform Flexible -->
          <FormsUniformFlexible
            v-if="localForm.use_uniform_schedule && localForm.uniform_flexible"
            v-model="localForm.uniform_flexible"
          />

          <!-- Custom Flexible -->
          <FormsCustomFlexible
            v-else-if="
              !localForm.use_uniform_schedule && localForm.custom_flexible_days
            "
            v-model="localForm.custom_flexible_days"
          />
        </template>
      </div>

      <!-- Step 3: Review & Confirm -->
      <div v-show="currentStep === 3" class="space-y-6">
        <FormsReview :form="localForm" />
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex items-center justify-between gap-3 pt-4 border-t border-default">
      <!-- Previous -->
      <UButton
        v-if="currentStep > 1"
        label="السابق"
        icon="i-lucide-arrow-right"
        color="neutral"
        variant="outline"
        @click="prevStep"
      />
      <div v-else />

      <!-- Next / Submit -->
      <div class="flex gap-2">
        <UButton
          v-if="currentStep < totalSteps"
          label="التالي"
          trailing-icon="i-lucide-arrow-left"
          color="primary"
          @click="nextStep"
        />

        <UButton
          v-else
          label="حفظ النظام"
          icon="i-lucide-save"
          color="primary"
          @click="submit"
        />
      </div>
    </div>
  </div>
</template>
