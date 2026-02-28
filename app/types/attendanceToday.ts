// ~/types/attendanceToday.ts
import type { PaginationMeta } from "./table";

export type AttendanceStatus = "present" | "late" | "out" | "absent";
export type PunchType = "in" | "out" | "check_in" | "check_out";

/**
 * Employee (nested)
 */

export type EmployeeNested = {
  id: number;
  employee_pin: string;
  full_name: string;
  branch_id: number | null;
  department_id: number | null;
};

/**
 * Model القادم من الـ API
 */
export type AttendanceToday = {
  /** 🔑 Identity */
  id: number;
  work_date: string | null;

  /** 👤 Employee */
  employee: EmployeeNested;

  /** ⏱️ Attendance Times */
  first_check_in: string | null;
  last_check_out: string | null;
  worked_minutes: number;
  required_minutes: number;

  /** 📌 Status */
  current_status: AttendanceStatus;
  last_punch_type: PunchType | null;

  /** 🧠 Derived Flags */
  is_late: boolean;
  late_minutes: number;

  is_early_leave: boolean;
  early_leave_minutes: number;

  overtime_minutes: number;
  undertime_minutes: number;

  is_inside: boolean;
  is_incomplete: boolean;

  /** 🕒 Meta */
  created_at: string | null;
  updated_at: string | null;
};


/**
 * Form Model (Create / Update)
 */
export type AttendanceTodayForm = {
  employee_id: number | null;
  work_date: string | null;
  first_check_in: string | null;
  last_check_out: string | null;
  worked_minutes: number;
  current_status: AttendanceStatus | "";
  last_punch_type: PunchType | "";
};

/**
 * Initial empty form
 */
export const emptyAttendanceTodayForm = (): AttendanceTodayForm => ({
  employee_id: null,
  work_date: null,
  first_check_in: null,
  last_check_out: null,
  worked_minutes: 0,
  current_status: "",
  last_punch_type: "",
});

/**
 * API Response
 */
// export type AttendanceTodayApiResponse<T = AttendanceToday[]> = {
//   success: boolean;
//   messageAr: string;
//   messageEn: string;
//   data: T;
//   pagination: PaginationMeta;
// };

/**
 * Row Type
 */
export type AttendanceTodayRow = Pick<
  AttendanceToday,
  | "id"
  | "employee"
  | "work_date"
  | "first_check_in"
  | "last_check_out"
  | "worked_minutes"
  | "current_status"
  | "last_punch_type"
>;
