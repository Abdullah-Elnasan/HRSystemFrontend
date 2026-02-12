
import type { PayrollSystemRow } from "~/types/PayrollSystem";

export function isPayrollSystemRow(row: unknown): row is PayrollSystemRow {
  return (
    typeof row === "object" &&
    row !== null &&
    "id" in row &&
    "name" in row &&
    "salary_type" in row
  );
}
