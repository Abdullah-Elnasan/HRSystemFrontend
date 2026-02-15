// ~/composables/permissions/isPermissionRow.ts
import type { PermissionRow } from "~/types/permission";

export function isPermissionRow(row: unknown): row is PermissionRow {
  return (
    typeof row === "object" &&
    row !== null &&
    "id" in row &&
    "code" in row &&
    "permission_group" in row
  );
}
