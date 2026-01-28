import type { PaginationMeta } from "./table";

/**
 * Model القادم من الـ API
 */
export type UserGroup = {
  id: number;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  created_at: string;
  updated_at: string;
  users_count: number;
  active_users_count: number;
  action: string;
};

/**
 * Form Model (Create / Update)
 */
export type UserGroupForm = {
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
};

/**
 * Initial empty form
 */
export const emptyUserGroupForm = (): UserGroupForm => ({
  name_ar: "",
  name_en: "",
  description_ar: "",
  description_en: "",
});

/**
 * API Response
 */
export type UserGroupsApiResponse<T = UserGroup[]> = {
  success: boolean;
  messageAr: string;
  messageEn: string;
  data: T;
  pagination: PaginationMeta;
};

/**
 * Row Type (للاستخدام داخل الجدول أو drawer)
 */
export type UserGroupRow = Pick<
  UserGroup,
  | "id"
  | "name_ar"
  | "name_en"
  | "description_ar"
  | "description_en"
>;
