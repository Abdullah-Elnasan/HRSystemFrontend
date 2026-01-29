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
  is_uniform: boolean;
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
  is_uniform: boolean;
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
  is_uniform: boolean ;
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
    is_uniform: true,
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
  is_uniform: boolean;  // ✅ إضافة هذا الحقل
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
    is_uniform: form.is_uniform,  // ✅ إضافة هذا
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

  if (form.is_uniform && form.uniform_fixed) {
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

  if (form.is_uniform && form.uniform_flexible) {
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
 * Backend → Form (تحديث شامل)
 * ========================================================= */

export function transformScheduleToForm(
  schedule: WorkSchedule & { rules?: any[], is_uniform?: boolean }
): WorkScheduleForm {
  const form: WorkScheduleForm = {
    ...emptyWorkScheduleForm(),
    name_ar: schedule.name_ar,
    name_en: schedule.name_en,
    type: schedule.type,
    description_ar: schedule.description_ar ?? "",
    description_en: schedule.description_en ?? "",
    is_active: schedule.is_active,
    is_uniform: schedule.is_uniform ?? true, // ✅ استخدم is_uniform من API مباشرة
  };

  const rules = schedule.rules || [];

  if (rules.length === 0) {
    return form;
  }

  // =============== FIXED RULES ===============
  if (schedule.type === "fixed") {
    const fixedRules = rules as any[];

    if (form.is_uniform) {
      // نظام موحد ثابت
      const firstWorkingRule = fixedRules.find((r) => r.is_working_day);

      if (firstWorkingRule) {
        form.uniform_fixed = {
          working_days: fixedRules
            .filter((r) => r.is_working_day && r.period_index === 1)
            .map((r) => r.day_of_week as DayOfWeek),
          start_time: firstWorkingRule.start_time?.substring(0, 5) || "08:00",
          end_time: firstWorkingRule.end_time?.substring(0, 5) || "16:00",
          grace_period_in_minutes: firstWorkingRule.grace_period_in_minutes || 0,
          early_leave_grace_minutes: firstWorkingRule.early_leave_grace_minutes || 0,
        };
      }
    } else {
      // نظام مخصص ثابت
      const customDaysMap = new Map<DayOfWeek, CustomFixedDay>();

      fixedRules.forEach((rule) => {
        const dayOfWeek = rule.day_of_week as DayOfWeek;

        if (!customDaysMap.has(dayOfWeek)) {
          customDaysMap.set(dayOfWeek, {
            day_of_week: dayOfWeek,
            is_working_day: rule.is_working_day === 1 || rule.is_working_day === true,
            periods: [],
          });
        }

        const day = customDaysMap.get(dayOfWeek)!;

        if (rule.is_working_day === 1 || rule.is_working_day === true) {
          day.periods.push({
            period_index: rule.period_index,
            start_time: rule.start_time?.substring(0, 5) || "08:00",
            end_time: rule.end_time?.substring(0, 5) || "16:00",
            grace_period_in_minutes: rule.grace_period_in_minutes || 0,
            early_leave_grace_minutes: rule.early_leave_grace_minutes || 0,
          });
        }
      });

      form.custom_fixed_days = Array.from(customDaysMap.values()).sort(
        (a, b) => a.day_of_week - b.day_of_week
      );
    }
  }

  // =============== FLEXIBLE RULES ===============
  if (schedule.type === "flexible") {
    const flexibleRules = rules as any[];

    if (form.is_uniform) {
      // نظام موحد مرن
      const firstWorkingRule = flexibleRules.find((r) => r.is_working_day);

      if (firstWorkingRule) {
        form.uniform_flexible = {
          working_days: flexibleRules
            .filter((r) => r.is_working_day === 1 || r.is_working_day === true)
            .map((r) => r.day_of_week as DayOfWeek),
          required_hours: Math.round((firstWorkingRule.required_minutes / 60) * 10) / 10 || 8,
        };
      }
    } else {
      // نظام مخصص مرن
      form.custom_flexible_days = flexibleRules
        .map((rule) => ({
          day_of_week: rule.day_of_week as DayOfWeek,
          is_working_day: rule.is_working_day === 1 || rule.is_working_day === true,
          required_hours: Math.round((rule.required_minutes / 60) * 10) / 10 || 0,
        }))
        .sort((a, b) => a.day_of_week - b.day_of_week);
    }
  }

  return form;
}

/* =========================================================
 * تحويل بيانات API إلى صيغة WorkScheduleForm
 * ========================================================= */

export function transformAPIResponseToForm(apiData: any): WorkScheduleForm {
  const form: WorkScheduleForm = {
    ...emptyWorkScheduleForm(),
    name_ar: apiData.name_ar || '',
    name_en: apiData.name_en || '',
    type: apiData.type || 'fixed',
    description_ar: apiData.description_ar || null,
    description_en: apiData.description_en || null,
    is_active: apiData.is_active ? true : false,
  }

  // تحديد نوع النظام (موحد أم مخصص)
  if (apiData.fixed_rules && apiData.fixed_rules.length > 0) {
    form.type = 'fixed'

    // التحقق مما إذا كانت القواعد موحدة أم مخصصة
    const uniqueDays = new Set(apiData.fixed_rules.map((r: any) => r.day_of_week))
    const isUniform = uniqueDays.size === 7 &&
      !apiData.fixed_rules.some((r: any) => (r.period_index || 1) > 1)

    if (isUniform) {
      // نظام موحد
      form.is_uniform = true
      const firstRule = apiData.fixed_rules[0]
      form.uniform_fixed = {
        working_days: apiData.fixed_rules
          .filter((r: any) => r.is_working_day)
          .map((r: any) => r.day_of_week),
        start_time: firstRule.start_time || '08:00',
        end_time: firstRule.end_time || '16:00',
        grace_period_in_minutes: firstRule.grace_period_in_minutes || 0,
        early_leave_grace_minutes: firstRule.early_leave_grace_minutes || 0,
      }
    } else {
      // نظام مخصص
      form.is_uniform = false
      const customDaysMap = new Map<number, any>()

      apiData.fixed_rules.forEach((rule: any) => {
        const dayOfWeek = rule.day_of_week
        if (!customDaysMap.has(dayOfWeek)) {
          customDaysMap.set(dayOfWeek, {
            day_of_week: dayOfWeek,
            is_working_day: !!rule.is_working_day,
            periods: [],
          })
        }

        const day = customDaysMap.get(dayOfWeek)
        day.periods.push({
          period_index: rule.period_index || 1,
          start_time: rule.start_time || '08:00',
          end_time: rule.end_time || '16:00',
          grace_period_in_minutes: rule.grace_period_in_minutes || 0,
          early_leave_grace_minutes: rule.early_leave_grace_minutes || 0,
        })
      })

      form.custom_fixed_days = Array.from(customDaysMap.values()).sort(
        (a: CustomFixedDay, b: CustomFixedDay) => a.day_of_week - b.day_of_week
      )
    }
  } else if (apiData.flexible_rules && apiData.flexible_rules.length > 0) {
    form.type = 'flexible'
    form.is_uniform = true

    const uniqueDays = new Set(apiData.flexible_rules.map((r: any) => r.day_of_week))
    const isUniform = uniqueDays.size === 7

    if (isUniform) {
      // نظام موحد
      const firstRule = apiData.flexible_rules[0]
      form.uniform_flexible = {
        working_days: apiData.flexible_rules
          .filter((r: any) => r.is_working_day)
          .map((r: any) => r.day_of_week),
        required_hours: firstRule.required_hours || 8,
      }
    } else {
      // نظام مخصص
      form.is_uniform = false
      form.custom_flexible_days = apiData.flexible_rules.map((rule: any) => ({
        day_of_week: rule.day_of_week,
        is_working_day: !!rule.is_working_day,
        required_hours: rule.required_hours || 0,
      })).sort((a: CustomFlexibleDay, b: CustomFlexibleDay) => a.day_of_week - b.day_of_week)
    }
  }

  return form
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
