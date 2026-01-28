import type { PaginationMeta } from "./table";

/* =========================================================
 * Core Types
 * ========================================================= */

export type WorkScheduleType = "fixed" | "flexible";
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAYS_OF_WEEK: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

/* =========================================================
 * Rules
 * ========================================================= */

export interface FixedRule {
  day_of_week: DayOfWeek;
  period_index: number;
  start_time: string | null;
  end_time: string | null;
  grace_period_in_minutes: number;
  early_leave_grace_minutes: number;
  is_working_day: boolean;
}

export interface FlexibleRule {
  day_of_week: DayOfWeek;
  required_minutes: number;
  is_working_day: boolean;
}

/* =========================================================
 * API Model
 * ========================================================= */

export interface WorkSchedule {
  id: number;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  type: WorkScheduleType;
  is_active: boolean;
  fixed_rules?: FixedRule[];
  flexible_rules?: FlexibleRule[];
  created_at: string;
  updated_at: string;
  action?: string;
}

/* =========================================================
 * API Response
 * ========================================================= */

export type WorkSchedulesApiResponse<T = WorkSchedule[]> = {
  success: boolean;
  messageAr: string;
  messageEn: string;
  data: T;
  pagination: PaginationMeta;
};

/* =========================================================
 * Form Types
 * ========================================================= */

export interface WorkScheduleBasicForm {
  name_ar: string;
  name_en: string;
  type: WorkScheduleType;
  description_ar?: string;
  description_en?: string;
  is_active: boolean;
}

export interface UniformFixedSchedule {
  start_time: string;
  end_time: string;
  grace_period_in_minutes: number;
  early_leave_grace_minutes: number;
  working_days: DayOfWeek[];
}

export interface UniformFlexibleSchedule {
  required_hours: number;
  working_days: DayOfWeek[];
}

export interface CustomFixedDay {
  day_of_week: DayOfWeek;
  is_working_day: boolean;
  periods: {
    period_index: number;
    start_time: string;
    end_time: string;
    grace_period_in_minutes: number;
    early_leave_grace_minutes: number;
  }[];
}

export interface CustomFlexibleDay {
  day_of_week: DayOfWeek;
  is_working_day: boolean;
  required_hours: number;
}

export interface WorkScheduleForm extends WorkScheduleBasicForm {
  use_uniform_schedule: boolean;
  uniform_fixed?: UniformFixedSchedule;
  uniform_flexible?: UniformFlexibleSchedule;
  custom_fixed_days?: CustomFixedDay[];
  custom_flexible_days?: CustomFlexibleDay[];
}

/* =========================================================
 * Empty Form
 * ========================================================= */

export function emptyWorkScheduleForm(): WorkScheduleForm {
  return {
    name_ar: "",
    name_en: "",
    type: "fixed",
    description_ar: "",
    description_en: "",
    is_active: true,
    use_uniform_schedule: true,
    uniform_fixed: {
      start_time: "08:00",
      end_time: "16:00",
      grace_period_in_minutes: 10,
      early_leave_grace_minutes: 5,
      working_days: [0, 1, 2, 3, 4],
    },
    uniform_flexible: {
      required_hours: 8,
      working_days: [0, 1, 2, 3, 4],
    },
  };
}

/* =========================================================
 * Create Empty Custom Days ✅ (محل الخطأ الأول)
 * ========================================================= */

export function createEmptyCustomDays(): {
  fixed: CustomFixedDay[];
  flexible: CustomFlexibleDay[];
} {
  return {
    fixed: DAYS_OF_WEEK.map((day) => ({
      day_of_week: day,
      is_working_day: day <= 4,
      periods: [
        {
          period_index: 1,
          start_time: "08:00",
          end_time: "16:00",
          grace_period_in_minutes: 10,
          early_leave_grace_minutes: 5,
        },
      ],
    })),
    flexible: DAYS_OF_WEEK.map((day) => ({
      day_of_week: day,
      is_working_day: day <= 4,
      required_hours: 8,
    })),
  };
}

/* =========================================================
 * Payload
 * ========================================================= */

export type WorkSchedulePayload = {
  name_ar: string;
  name_en: string;
  type: WorkScheduleType;
  description_ar?: string;
  description_en?: string;
  is_active: boolean;
  fixed_rules?: FixedRule[];
  flexible_rules?: FlexibleRule[];
};

/* =========================================================
 * Form → Payload
 * ========================================================= */

export function transformFormToPayload(
  form: WorkScheduleForm
): WorkSchedulePayload {
  const base = {
    name_ar: form.name_ar,
    name_en: form.name_en,
    type: form.type,
    description_ar: form.description_ar || undefined,
    description_en: form.description_en || undefined,
    is_active: form.is_active,
  };

  return form.type === "fixed"
    ? { ...base, fixed_rules: buildFixedRules(form) }
    : { ...base, flexible_rules: buildFlexibleRules(form) };
}

/* =========================================================
 * Builders
 * ========================================================= */

function buildFixedRules(form: WorkScheduleForm): FixedRule[] {
  const rules: FixedRule[] = [];

  if (form.use_uniform_schedule && form.uniform_fixed) {
    for (const day of DAYS_OF_WEEK) {
      const isWorking = form.uniform_fixed.working_days.includes(day);
      rules.push({
        day_of_week: day,
        period_index: 1,
        start_time: isWorking ? form.uniform_fixed.start_time : null,
        end_time: isWorking ? form.uniform_fixed.end_time : null,
        grace_period_in_minutes: isWorking
          ? form.uniform_fixed.grace_period_in_minutes
          : 0,
        early_leave_grace_minutes: isWorking
          ? form.uniform_fixed.early_leave_grace_minutes
          : 0,
        is_working_day: isWorking,
      });
    }
  } else if (form.custom_fixed_days) {
    for (const day of form.custom_fixed_days) {
      if (!day.is_working_day) {
        rules.push({
          day_of_week: day.day_of_week,
          period_index: 1,
          start_time: null,
          end_time: null,
          grace_period_in_minutes: 0,
          early_leave_grace_minutes: 0,
          is_working_day: false,
        });
      } else {
        for (const p of day.periods) {
          rules.push({
            day_of_week: day.day_of_week,
            period_index: p.period_index,
            start_time: p.start_time,
            end_time: p.end_time,
            grace_period_in_minutes: p.grace_period_in_minutes,
            early_leave_grace_minutes: p.early_leave_grace_minutes,
            is_working_day: true,
          });
        }
      }
    }
  }

  return rules;
}

function buildFlexibleRules(form: WorkScheduleForm): FlexibleRule[] {
  const rules: FlexibleRule[] = [];

  if (form.use_uniform_schedule && form.uniform_flexible) {
    for (const day of DAYS_OF_WEEK) {
      const isWorking = form.uniform_flexible.working_days.includes(day);
      rules.push({
        day_of_week: day,
        required_minutes: isWorking
          ? form.uniform_flexible.required_hours * 60
          : 0,
        is_working_day: isWorking,
      });
    }
  } else if (form.custom_flexible_days) {
    for (const day of form.custom_flexible_days) {
      rules.push({
        day_of_week: day.day_of_week,
        required_minutes: day.is_working_day
          ? day.required_hours * 60
          : 0,
        is_working_day: day.is_working_day,
      });
    }
  }

  return rules;
}

/* =========================================================
 * Backend → Form ✅ (محل الخطأ الثاني)
 * ========================================================= */

export function transformScheduleToForm(
  schedule: WorkSchedule
): WorkScheduleForm {
  const form = emptyWorkScheduleForm();

  form.name_ar = schedule.name_ar;
  form.name_en = schedule.name_en;
  form.type = schedule.type;
  form.is_active = schedule.is_active;
  form.description_ar = schedule.description_ar ?? "";
  form.description_en = schedule.description_en ?? "";

  if (schedule.type === "fixed" && schedule.fixed_rules) {
    form.use_uniform_schedule = true;
  }

  if (schedule.type === "flexible" && schedule.flexible_rules) {
    form.use_uniform_schedule = true;
  }

  return form;
}

/* =========================================================
 * Day Names
 * ========================================================= */

export const DAY_NAMES_AR: Record<DayOfWeek, string> = {
  0: "الأحد",
  1: "الاثنين",
  2: "الثلاثاء",
  3: "الأربعاء",
  4: "الخميس",
  5: "الجمعة",
  6: "السبت",
};
