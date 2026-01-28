import { defineStore } from "pinia";
import type { WorkSchedule, WorkScheduleForm } from "~/types/workSchedule";
import type { PaginatedResponse } from "~/types/table";
import { fetchList } from "~/service/useAsyncData";
import { createResource } from "~/service/createResource";
import { updateResource } from "~/service/updateResource";

export const useWorkSchedulesStore = defineStore("work-schedules", {
  state: () => ({
    workSchedules: [] as WorkSchedule[],
    pagination: {
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1,
    },
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchWorkSchedules(params?: Record<string, any>) {
      this.loading = true;
      try {
        const res = await fetchList<PaginatedResponse<WorkSchedule>>({
          endpoint: "/api/work-schedules",
          page: params?.page,
          perPage: params?.per_page,
          search: params?.filter?.search,
        });

        this.workSchedules = res.data;
        this.pagination = res.pagination;
        return res;
      } finally {
        this.loading = false;
      }
    },

    async createWorkSchedule(payload: WorkScheduleForm) {
      return createResource<WorkSchedule>({
        endpoint: "/api/work-schedules",
        payload,
        toast: useToast(),
        onSuccess: (data) => {
          this.workSchedules.unshift(data);
          this.pagination.total++;
        },
      });
    },

    async updateWorkSchedule(
      id: number,
      payload: Partial<WorkScheduleForm>
    ) {
      return updateResource<WorkSchedule>({
        endpoint: `/api/work-schedules/${id}`,
        payload,
        toast: useToast(),
        onSuccess: (data) => {
          const i = this.workSchedules.findIndex((e) => e.id === data.id);
          if (i !== -1) this.workSchedules[i] = data;
        },
      });
    },

    async deleteWorkSchedule(id: number) {
      await $fetch(`/api/work-schedules/${id}`, { method: "DELETE" });
      const index = this.workSchedules.findIndex((e) => e.id === id);
      if (index !== -1) {
        this.workSchedules.splice(index, 1);
        this.pagination.total--;
      }
    },

    setWorkSchedules(payload: PaginatedResponse<WorkSchedule>) {
      this.workSchedules = payload.data;
      this.pagination = payload.pagination;
    },
  },
});
