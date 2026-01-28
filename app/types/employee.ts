// types/employee.ts
import type { PaginationMeta } from "./table";

/**
 * Model القادم من الـ API
 */
export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  position: string | null;
  national_id: string;
  pin: number;
  birth_date: string | null;
  branch: { id: number; name_ar: string };
  department: { id: number; name_ar: string | null };
  user_group: { id: number; name_ar: string | null };
  current_work_schedule: { id: number; name_ar: string | null };
  upcoming_work_schedule: { id: number; name_ar: string | null };
  image?: string | null;
  created_at: string;
  updated_at: string;
  action: string;
  number: number;
};

/**
 * Form Model (Create / Update)
 */
export type EmployeeForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status?: "active" | "inactive";
  position?: string;
  national_id: string;
  pin: number;
  birth_date?: string;
  starts_at?: string;
  branch_id: number;
  user_group_id: number;
  department_id?: number;
  work_schedule_id?: number;
  image?: File | null;
};

/**
 * Create Payload (without optional server-generated fields)
 */
export type CreateEmployeePayload = Omit<EmployeeForm, "image"> & {
  image?: File | null;
};

/**
 * Update Payload (all fields optional except ID)
 */
export type UpdateEmployeePayload = Partial<EmployeeForm>;

/**
 * Initial empty form
 */
export const emptyEmployeeForm = (): EmployeeForm => ({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  status: "active",
  position: "",
  national_id: "",
  pin: 0,
  birth_date: "",
  branch_id: 0,
  department_id: 0,
  user_group_id: 0,
  image: null,
});

/**
 * API Response
 */
export type EmployeesApiResponse<T = Employee[]> = {
  success: boolean;
  messageAr: string;
  messageEn: string;
  data: T;
  pagination: PaginationMeta;
};

/**
 * Row Type (للاستخدام داخل الجدول أو drawer)
 */
export type EmployeeRow = Pick<
  Employee,
  | "id"
  | "first_name"
  | "last_name"
  | "full_name"
  | "email"
  | "phone"
  | "status"
  | "position"
  | "national_id"
  | "pin"
  | "birth_date"
  | "branch"
  | "department"
  | "user_group"
>;
