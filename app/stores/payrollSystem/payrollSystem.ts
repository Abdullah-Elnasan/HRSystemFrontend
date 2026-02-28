import { defineStore } from 'pinia'
import { parseError } from '~/utils/parseError'
import type { PayrollSystem, PayrollSystemForm } from '~/types/payrollSystem'
import type { apiResponse } from '~/types/table';
import type { PaginationMeta } from '~/types/table'

interface PayrollSystemsState {
  payrollSystems: PayrollSystem[]
  pagination: PaginationMeta | null
  loading: boolean
  error: string | null
}

export const usePayrollSystemsStore = defineStore('payrollSystems', {
  state: (): PayrollSystemsState => ({
    payrollSystems: [],
    pagination: null,
    loading: false,
    error: null,
  }),

  actions: {
    _setLoading(value: boolean) { this.loading = value },
    _setError(message: string | null) { this.error = message },

    async fetchPayrollSystems(params?: Record<string, any>, signal?: AbortSignal) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<PayrollSystem[]>>(
          `${config.public.apiBase}/api/payroll-systems`,
          { query: params, signal }
        )
        this.payrollSystems = response.data
        this.pagination = response.pagination
      } catch (error: unknown) {
        if ((error as Error).name === 'AbortError') return
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async fetchPayrollSystemById(id: number | string) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<PayrollSystem>>(
          `${config.public.apiBase}/api/payroll-systems/${id}`
        )
        const index = this.payrollSystems.findIndex(p => p.id === response.data.id)
        if (index !== -1) this.payrollSystems[index] = response.data
        return response.data
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async createPayrollSystem(payload: PayrollSystemForm | FormData) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<PayrollSystem>>(
          `${config.public.apiBase}/api/payroll-systems`,
          { method: 'POST', body: payload }
        )
        this.payrollSystems.unshift(response.data)
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async updatePayrollSystem(id: number, payload: Partial<PayrollSystemForm> | FormData) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<PayrollSystem>>(
          `${config.public.apiBase}/api/payroll-systems/${id}`,
          { method: 'PUT', body: payload }
        )
        const index = this.payrollSystems.findIndex(p => p.id === id)
        if (index !== -1) this.payrollSystems[index] = response.data
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async deletePayrollSystem(id: number) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<null>>(
          `${config.public.apiBase}/api/payroll-systems/${id}`,
          { method: 'DELETE' }
        )
        this.payrollSystems = this.payrollSystems.filter(p => p.id !== id)
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
