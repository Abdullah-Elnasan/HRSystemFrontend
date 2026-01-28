import type { WorkSchedule } from "~/types/workSchedule"

export function isWorkScheduleRow(row: any): row is WorkSchedule {
  return row && typeof row.id === 'number' && 'name_ar' in row
}
