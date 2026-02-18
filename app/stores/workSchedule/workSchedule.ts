import { defineStore } from 'pinia'
import { parseError } from '~/utils/parseError'
import type { WorkSchedule, WorkSchedulePayload } from '~/types/workSchedule'
import type { apiResponse } from '~/types/table'
import type { PaginationMeta } from '~/types/table'

interface WorkSchedulesState {
  workSchedules: WorkSchedule[]
  pagination: PaginationMeta | null
  loading: boolean
  error: string | null
}

export const useWorkSchedulesStore = defineStore('workSchedules', {
  state: (): WorkSchedulesState => ({
    workSchedules: [],
    pagination: null,
    loading: false,
    error: null,
  }),

  actions: {
    _setLoading(value: boolean) { this.loading = value },
    _setError(message: string | null) { this.error = message },

    async fetchWorkSchedules(params?: Record<string, any>, signal?: AbortSignal) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<WorkSchedule[]>>(
          `${config.public.apiBase}/api/work-schedules`,
          { query: params, signal }
        )
        this.workSchedules = response.data
        this.pagination = response.pagination
      } catch (error: unknown) {
        if ((error as Error).name === 'AbortError') return
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async fetchWorkScheduleById(id: number | string) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<WorkSchedule>>(
          `${config.public.apiBase}/api/work-schedules/${id}`
        )
        return response.data
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async createWorkSchedule(payload: WorkSchedulePayload) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<WorkSchedule>>(
          `${config.public.apiBase}/api/work-schedules`,
          { method: 'POST', body: payload }
        )
        this.workSchedules.unshift(response.data)
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async updateWorkSchedule(id: number, payload: Partial<WorkSchedulePayload> | FormData) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<WorkSchedule>>(
          `${config.public.apiBase}/api/work-schedules/${id}`,
          { method: 'PUT', body: payload }
        )
        const index = this.workSchedules.findIndex(w => w.id === id)
        if (index !== -1) this.workSchedules[index] = response.data
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async deleteWorkSchedule(id: number) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<null>>(
          `${config.public.apiBase}/api/work-schedules/${id}`,
          { method: 'DELETE' }
        )
        this.workSchedules = this.workSchedules.filter(w => w.id !== id)
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    clearError() { this.error = null },
  },
})
