import { useWorkSchedulesStore } from "~/stores/workSchedule/workSchedule";
import type { WorkScheduleForm } from "~/types/workSchedule";
import { usePaginatedList } from "~/composables/usePaginatedList";

export function useWorkSchedules() {
  const store = useWorkSchedulesStore();
  const toast = useToast();

  const list = usePaginatedList({
    key: "work-schedules",
    endpoint: "/api/work-schedules/work-schedules",
    store: {
      setData: store.setWorkSchedules,
    },
  });

  async function createWorkSchedule(payload: WorkScheduleForm) {
    try {
      return await store.createWorkSchedule(payload);
    } catch (error) {
      toast.add({ title: store.error ?? "فشل في الإنشاء", color: "error" });
      throw error;
    }
  }

  async function updateWorkSchedule(
    id: number,
    payload: Partial<WorkScheduleForm>
  ) {
    try {
      return await store.updateWorkSchedule(id, payload);
    } catch (error) {
      toast.add({ title: store.error ?? "فشل في التعديل", color: "error" });
      throw error;
    }
  }

  async function deleteWorkSchedule(id: number) {
    try {
      await store.deleteWorkSchedule(id);
    } catch (error) {
      toast.add({ title: store.error ?? "فشل في الحذف", color: "error" });
      throw error;
    }
  }

  return {
    ...list,

    data: computed(() => store.workSchedules),
    pagination: computed(() => store.pagination),
    pending: computed(() => store.loading),

    createWorkSchedule,
    updateWorkSchedule,
    deleteWorkSchedule,
  };
}
