// ~/composables/work-schedule-assignments/isWorkScheduleAssignmentRow.ts
import type { WorkScheduleAssignmentRow } from "~/types/workScheduleAssignments";

export function isWorkScheduleAssignmentRow(row: unknown): row is WorkScheduleAssignmentRow {
  return (
    typeof row === "object" &&
    row !== null &&
    "id" in row &&
    "work_schedule" in row &&
    "assignable" in row
  );
}
