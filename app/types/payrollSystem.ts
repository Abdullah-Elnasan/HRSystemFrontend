// ~/types/payroll-system.ts
import type { PaginationMeta } from "./table";

/**
 * Salary Type Enum
 */
export type SalaryType = "monthly" | "hourly";

/**
 * Currency Type
 */
export type Currency = "USD" | "EUR" | "SAR" | "AED" | "EGP" | "JOD";

/**
 * Model القادم من الـ API
 */
export type PayrollSystem = {
  id: number;
  name: string;
  salary_type: SalaryType;
  monthly_salary: number | null;
  hourly_rate: number | null;
  overtime_base_rate: number;
  deduct_missing_time: boolean;
  is_active: boolean;
  currency: Currency;
  created_at: string;
  updated_at: string;
  action: string;
};

/**
 * Form Model (Create / Update)
 */
export type PayrollSystemForm = {
  name: string;
  salary_type: SalaryType | "";
  monthly_salary: number | null;
  hourly_rate: number | null;
  overtime_base_rate: number;
  deduct_missing_time: boolean;
  is_active: boolean;
  currency: Currency | "";
};

/**
 * Initial empty form
 */
export const emptyPayrollSystemForm = (): PayrollSystemForm => ({
  name: "",
  salary_type: "",
  monthly_salary: null,
  hourly_rate: null,
  overtime_base_rate: 1.5,
  deduct_missing_time: false,
  is_active: true,
  currency: "",
});

/**
 * API Response
 */
export type PayrollSystemsApiResponse<T = PayrollSystem[]> = {
  success: boolean;
  messageAr: string;
  messageEn: string;
  data: T;
  pagination: PaginationMeta;
};

/**
 * Row Type
 */
export type PayrollSystemRow = Pick<
  PayrollSystem,
  | "id"
  | "name"
  | "salary_type"
  | "monthly_salary"
  | "hourly_rate"
  | "overtime_base_rate"
  | "deduct_missing_time"
  | "is_active"
  | "currency"
>;
