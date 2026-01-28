import type { UserGroupRow } from "~/types/userGroups"

export function isUserGroupRow(row: any): row is UserGroupRow {
  return row && typeof row.id === 'number' && 'name_ar' in row
}
