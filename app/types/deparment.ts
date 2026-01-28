import type { PaginationMeta } from './table'

/**
 * Model القادم من الـ API
 */
export type Department = {
  id: number
  name_en: string
  name_ar: string
  description_en: string | null
  description_ar: string | null
  created_at: string
  updated_at: string
  employees_count: number
  active_employees_count: number
  action: string
}

/**
 * Form Model (Create / Update)
 */
export type DepartmentForm = {
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
}

/**
 * Initial empty form
 */
export const emptyDepartmentForm = (): DepartmentForm => ({
  name_ar: '',
  name_en: '',
  description_ar: '',
  description_en: '',
})

/**
 * API Response
 */
export type DepartmentApiResponse<T> = {
  success: boolean
  messageAr: string
  messageEn: string
  data: T
  pagination: PaginationMeta
}

export type DepartmentRow = Pick<
  Department,
  'id' | 'name_ar' | 'name_en' | 'description_ar' | 'description_en'
>


