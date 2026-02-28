import { defineStore } from 'pinia'
import { parseError } from '~/utils/parseError'
import type { Attendance, AttendanceApiResponse } from '~/types/attendance'
import type { PaginationMeta } from '~/types/table'

interface AttendanceEmployeeState {
  records:    Attendance[]
  pagination: PaginationMeta | null
  loading:    boolean
  error:      string | null
}

export const useAttendanceEmployeeStore = defineStore('attendanceEmployee', {
  state: (): AttendanceEmployeeState => ({
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
          { query: params, signal }
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

    clearError() { this.error = null },
  },
})
