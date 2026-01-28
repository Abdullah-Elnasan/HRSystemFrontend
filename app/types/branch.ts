import type { PaginationMeta } from "./table";

/**
 * Model القادم من الـ API
 */
export type Branch = {
  id: number;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  location_en: string | null;
  location_ar: string | null;
  current_work_schedule: { id: number; name_ar: string | null };
  upcoming_work_schedule: { id: number; name_ar: string | null };
  created_at: string;
  updated_at: string;
  employees_count: number;
  active_employees_count: number;
  action: string;
};

/**
 * Form Model (Create / Update)
 */
// ~/types/branch.ts
export type BranchForm = {
  name_ar: string;
  name_en?: string;
  description_ar?: string;
  description_en?: string;
  location_ar?: string;
  location_en?: string;

  // ⬇️ جديد
  work_schedule_id?: number | null;
  starts_at?: string | null;
};

/**
 * Initial empty form
 */
export const emptyBranchForm = (): BranchForm => ({
  name_ar: "",
  name_en: "",
  description_ar: "",
  description_en: "",
  location_ar: "",
  location_en: "",
  work_schedule_id: null,
  starts_at: null,
});


/**
 * API Response
 */
export type BranchesApiResponse<T = Branch[]> = {
  success: boolean;
  messageAr: string;
  messageEn: string;
  data: T;
  pagination: PaginationMeta;
};

/**
 * Row Type (للاستخدام داخل الجدول أو drawer)
 */
export type BranchRow = Pick<
  Branch,
  | "id"
  | "name_ar"
  | "name_en"
  | "description_ar"
  | "description_en"
  | "location_ar"
  | "location_en"
>;
