import type { Employee } from "~/types/employee";

export function isEmployeeRow(row: any): row is Employee {
  return (
    row &&
    typeof row === "object" &&
    typeof row.id === "number" &&
    "full_name" in row &&
    "pin" in row
  );
}
