import type { DepartmentRow } from "~/types/deparment"

export function isDepartmentRow(row: any): row is DepartmentRow {
  return row && typeof row.id === 'number' && 'name_ar' in row
}
