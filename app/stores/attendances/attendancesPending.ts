import { defineStore } from 'pinia'
import { parseError } from '~/utils/parseError'
import type { Attendance, AttendanceForm, AttendanceApiResponse } from '~/types/attendance'
import type { PaginationMeta } from '~/types/table'

interface AttendancePendingState {
  records:    Attendance[]
  pagination: PaginationMeta | null
  loading:    boolean
  error:      string | null
}

export const useAttendancePendingStore = defineStore('attendancePending', {
  state: (): AttendancePendingState => ({
    records:    [],
    pagination: null,
    loading:    false,
    error:      null,
  }),

  actions: {
    _setLoading(value: boolean) { this.loading = value },
    _setError(message: string | null) { this.error = message },

    async fetchRecords(params?: Record<string, any>, signal?: AbortSignal) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<AttendanceApiResponse<Attendance[]>>(
          `${config.public.apiBase}/api/attendances`,
          {
            query: { 'filter[status]': 'pending', ...params },
            signal,
          }
        )
        this.records    = response.data
        this.pagination = response.pagination
      } catch (error: unknown) {
        if ((error as Error).name === 'AbortError') return
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async createRecord(payload: AttendanceForm | FormData) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<AttendanceApiResponse<Attendance>>(
          `${config.public.apiBase}/api/attendances`,
          { method: 'POST', body: payload }
        )
        this.records.unshift(response.data)
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async updateRecord(id: number, payload: Partial<AttendanceForm> | FormData) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<AttendanceApiResponse<Attendance>>(
          `${config.public.apiBase}/api/attendances/${id}`,
          { method: 'PUT', body: payload }
        )
        const index = this.records.findIndex(r => r.id === id)
        if (index !== -1) this.records[index] = response.data
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async deleteRecord(id: number) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<AttendanceApiResponse<null>>(
          `${config.public.apiBase}/api/attendances/${id}`,
          { method: 'DELETE' }
        )
        this.records = this.records.filter(r => r.id !== id)
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
