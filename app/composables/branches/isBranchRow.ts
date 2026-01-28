import type { BranchRow } from "~/types/branch"

export function isBranchRow(row: any): row is BranchRow {
  return row && typeof row.id === 'number' && 'name_ar' in row
}
