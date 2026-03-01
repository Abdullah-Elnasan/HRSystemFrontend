import { defineStore } from 'pinia'
import { parseError } from '~/utils/parseError'
import type { PayrollRun, PayrollRunForm } from '~/types/payrolls/payrollRun'
import type { apiResponse } from '~/types/table'
import type { PaginationMeta } from '~/types/table'

interface PayrollRunsState {
  runs:       PayrollRun[]
  pagination: PaginationMeta | null
  loading:    boolean
  error:      string | null
}

export const usePayrollRunsStore = defineStore('payrollRuns', {
  state: (): PayrollRunsState => ({
    runs:       [],
    pagination: null,
    loading:    false,
    error:      null,
  }),

  actions: {
    _setLoading(value: boolean) { this.loading = value },
    _setError(message: string | null) { this.error = message },

    async fetchRuns(params?: Record<string, any>, signal?: AbortSignal) {
      const config   = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<PayrollRun[]>>(
          `${config.public.apiBase}/api/payroll-runs`,
          { query: params, signal }
        )
        this.runs       = response.data
        this.pagination = response.pagination
      } catch (error: unknown) {
        if ((error as Error).name === 'AbortError') return
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async fetchRunById(id: number | string) {
      const config   = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<PayrollRun>>(
          `${config.public.apiBase}/api/payroll-runs/${id}`
        )
        const index = this.runs.findIndex(r => r.id === response.data.id)
        if (index !== -1) this.runs[index] = response.data
        return response.data
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async aprooveRun(payload: PayrollRunForm | FormData) {
      const config   = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<PayrollRun>>(
          `${config.public.apiBase}/api/payroll/approve`,
          { method: 'POST', body: payload }
        )
        this.runs.unshift(response.data)
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async updateRun(id: number, payload: Partial<PayrollRunForm> | FormData) {
      const config   = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<PayrollRun>>(
          `${config.public.apiBase}/api/payroll-runs/${id}`,
          { method: 'PUT', body: payload }
        )
        const index = this.runs.findIndex(r => r.id === id)
        if (index !== -1) this.runs[index] = response.data
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async deleteRun(id: number) {
      const config   = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<null>>(
          `${config.public.apiBase}/api/payroll-runs/${id}`,
          { method: 'DELETE' }
        )
        this.runs = this.runs.filter(r => r.id !== id)
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
