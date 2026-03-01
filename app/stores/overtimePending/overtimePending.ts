import { defineStore } from 'pinia'
import { parseError } from '~/utils/parseError'
import type { OvertimePending, OvertimePendingForm, OvertimePendingApiResponse } from '~/types/payrolls/overtimePending'
import type { PaginationMeta } from '~/types/table'

interface OvertimePendingState {
  records:    OvertimePending[]
  pagination: PaginationMeta | null
  loading:    boolean
  error:      string | null
}

export const useOvertimePendingStore = defineStore('overtimePending', {
  state: (): OvertimePendingState => ({
    records:    [],
    pagination: null,
    loading:    false,
    error:      null,
  }),

  actions: {
    _setLoading(value: boolean) { this.loading = value },
    _setError(message: string | null) { this.error = message },

    async fetchRecords(params?: Record<string, any>, signal?: AbortSignal) {
      const config   = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<OvertimePendingApiResponse<OvertimePending[]>>(
          `${config.public.apiBase}/api/overtime/pending`,
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

    async createRecord(payload: OvertimePendingForm | FormData) {
      const config   = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<OvertimePendingApiResponse<OvertimePending>>(
          `${config.public.apiBase}/api/overtime-approvals`,
          { method: 'POST', body: payload }
        )
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
