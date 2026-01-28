import { defineStore } from 'pinia'
import type { WorkSchedule, WorkScheduleForm, WorkSchedulePayload } from '~/types/workSchedule'
import type { PaginatedResponse } from '~/types/table'
import { fetchList } from '~/service/useAsyncData'
import { createResource } from '~/service/createResource'
import { updateResource } from '~/service/updateResource'

function getErrorMessage(err: any): string {
  if (err?.data?.errors && typeof err.data.errors === 'object') {
    return Object.values(err.data.errors).flat().join(', ')
  }

  return (
    err?.data?.messageAr ??
    err?.data?.message ??
    err?.message ??
    'حدث خطأ غير متوقع'
  )
}

export const useWorkSchedulesStore = defineStore('workSchedules', {
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

  getters: {
    getWorkSchedules: (state) => state.workSchedules,
    getWorkScheduleById: (state) => (id: number | string) =>
      state.workSchedules.find((e) => e.id === id),
    isLoading: (state) => state.loading,
  },

  actions: {
    /* ================== Fetch List ================== */
    async fetchWorkSchedules(params?: Record<string, any>) {
      this.loading = true
      this.error = null
      const toast = useToast()

      try {
        const response = await fetchList<PaginatedResponse<WorkSchedule>>({
          endpoint: '/api/work-schedules/work-schedules',
          page: params?.page ?? 1,
          perPage: params?.per_page ?? 10,
          search: params?.filter?.search,
        })

        

        this.workSchedules = response.data
        this.pagination = response.pagination

        if ((response as any).messageAr) {
          toast.add({ title: (response as any).messageAr, color: 'success' })
        }

        return response
      } catch (err: any) {
        this.error = getErrorMessage(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /* ================== Fetch Single ================== */
    async fetchWorkScheduleById(id: number | string) {
      this.loading = true
      this.error = null

      try {
        const response = await fetchList<{ data: WorkSchedule }>({
          endpoint: `/api/work-schedules/${id}`,
        })

        const schedule = response.data
        const index = this.workSchedules.findIndex((e) => e.id === schedule.id)
        if (index !== -1) this.workSchedules[index] = schedule

        return schedule
      } catch (err: any) {
        this.error = getErrorMessage(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /* ================== Create ================== */
    async createWorkSchedule(payload: WorkSchedulePayload) {
      this.loading = true
      this.error = null

      try {
        return await createResource<WorkSchedule>({
          endpoint: '/api/work-schedules/work-schedules',
          payload,
          toast: useToast(),
          onSuccess: (data) => {
            this.workSchedules.unshift(data)
            this.pagination.total += 1
          },
        })
      } catch (err: any) {
        this.error = getErrorMessage(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /* ================== Update ================== */
    async updateWorkSchedule(
      id: number,
      payload: Partial<WorkScheduleForm> | FormData
    ) {
      this.loading = true
      this.error = null

      try {
        return await updateResource<WorkSchedule>({
          endpoint: `/api/work-schedules/${id}`,
          payload,
          toast: useToast(),
          onSuccess: (data) => {
            const index = this.workSchedules.findIndex((e) => e.id === data.id)
            if (index !== -1) this.workSchedules[index] = data
          },
        })
      } catch (err: any) {
        this.error = getErrorMessage(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /* ================== Delete ================== */
    async deleteWorkSchedule(id: number) {
      this.loading = true
      this.error = null
      const toast = useToast()

      const index = this.workSchedules.findIndex((e) => e.id === id)
      const backup = index !== -1 ? this.workSchedules[index] : null

      try {
        if (index !== -1) {
          this.workSchedules.splice(index, 1)
          this.pagination.total -= 1
        }

        await $fetch(`/api/work-schedules/${id}`, { method: 'DELETE' })
        toast.add({ title: 'تم حذف نظام الدوام بنجاح', color: 'success' })
        return true
      } catch (err: any) {
        if (backup && index !== -1) {
          this.workSchedules.splice(index, 0, backup)
          this.pagination.total += 1
        }

        this.error = getErrorMessage(err)
        toast.add({ title: this.error, color: 'error' })
        throw err
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },

    setWorkSchedules(payload: PaginatedResponse<WorkSchedule>) {
      this.workSchedules = payload.data
      this.pagination = payload.pagination
    },
  },
})
