// ~/types/permission.ts
import type { PaginationMeta } from "./table";

/**
 * Permission Group (nested)
 */
export type PermissionGroupNested = {
  id: number;
  name_ar: string;
  name_en: string;
};

/**
 * Model القادم من الـ API
 */
export type Permission = {
  id: number;
  code: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  permission_group: PermissionGroupNested;
  created_at: string;
  updated_at: string;
  action: string;
};

/**
 * Form Model (Create / Update)
 */
export type PermissionForm = {
  code: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  permission_group_id: number | null;
};

/**
 * Initial empty form
 */
export const emptyPermissionForm = (): PermissionForm => ({
  code: "",
  name_ar: "",
  name_en: "",
  description_ar: "",
  description_en: "",
  permission_group_id: null,
});

/**
 * API Response
 */
export type PermissionsApiResponse<T = Permission[]> = {
  success: boolean;
  messageAr: string;
  messageEn: string;
  data: T;
  pagination: PaginationMeta;
};

/**
 * Row Type
 */
export type PermissionRow = Pick<
  Permission,
  | "id"
  | "code"
  | "name_ar"
  | "name_en"
  | "description_ar"
  | "description_en"
  | "permission_group"
>;
