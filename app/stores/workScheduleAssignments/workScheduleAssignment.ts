import { defineStore } from 'pinia'
import { parseError } from '~/utils/parseError'
import type { WorkScheduleAssignment, WorkScheduleAssignmentForm } from '~/types/workScheduleAssignments'
import type { apiResponse } from '~/types/table'
import type { PaginationMeta } from '~/types/table'

interface WorkScheduleAssignmentsState {
  assignments: WorkScheduleAssignment[]
  pagination:  PaginationMeta | null
  loading:     boolean
  error:       string | null
}

export const useWorkScheduleAssignmentsStore = defineStore('workScheduleAssignments', {
  state: (): WorkScheduleAssignmentsState => ({
    assignments: [],
    pagination:  null,
    loading:     false,
    error:       null,
  }),

  actions: {
    _setLoading(value: boolean) { this.loading = value },
    _setError(message: string | null) { this.error = message },

    async fetchAssignments(params?: Record<string, any>, signal?: AbortSignal) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<WorkScheduleAssignment[]>>(
          `${config.public.apiBase}/api/work-schedule-assignments`,
          { query: params, signal }
        )
        this.assignments = response.data
        this.pagination  = response.pagination
      } catch (error: unknown) {
        if ((error as Error).name === 'AbortError') return
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async fetchAssignmentById(id: number | string) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<WorkScheduleAssignment>>(
          `${config.public.apiBase}/api/work-schedule-assignments/${id}`
        )
        return response.data
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async createAssignment(payload: Partial<WorkScheduleAssignmentForm>) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<WorkScheduleAssignment>>(
          `${config.public.apiBase}/api/work-schedule-assignments`,
          { method: 'POST', body: payload }
        )
        this.assignments.unshift(response.data)
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async updateAssignment(id: number, payload: Partial<WorkScheduleAssignmentForm>) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<WorkScheduleAssignment>>(
          `${config.public.apiBase}/api/work-schedule-assignments/${id}`,
          { method: 'PUT', body: payload }
        )
        const index = this.assignments.findIndex(a => a.id === id)
        if (index !== -1) this.assignments[index] = response.data
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async deleteAssignment(id: number) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<null>>(
          `${config.public.apiBase}/api/work-schedule-assignments/${id}`,
          { method: 'DELETE' }
        )
        this.assignments = this.assignments.filter(a => a.id !== id)
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
