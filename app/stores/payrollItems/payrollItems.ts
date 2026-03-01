import { defineStore } from 'pinia'
import { parseError } from '~/utils/parseError'
import type { PayrollItem, PayrollItemForm } from '~/types/payrolls/payrollItem'
import type { apiResponse } from '~/types/table'
import type { PaginationMeta } from '~/types/table'

interface PayrollItemsState {
  items:      PayrollItem[]
  pagination: PaginationMeta | null
  loading:    boolean
  error:      string | null
}

export const usePayrollItemsStore = defineStore('payrollItems', {
  state: (): PayrollItemsState => ({
    items:      [],
    pagination: null,
    loading:    false,
    error:      null,
  }),

  actions: {
    _setLoading(value: boolean) { this.loading = value },
    _setError(message: string | null) { this.error = message },

    async fetchItems(
      params?:   Record<string, any>,
      signal?:   AbortSignal,
      endpoint?: string
    ) {
      const config    = useRuntimeConfig()
      const { $api }  = useNuxtApp()
      const url       = endpoint
        ? `${config.public.apiBase}/${endpoint}`
        : `${config.public.apiBase}/api/payroll-items`

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<PayrollItem[]>>(
          url,
          { query: params, signal }
        )
        this.items      = response.data
        this.pagination = response.pagination
      } catch (error: unknown) {
        if ((error as Error).name === 'AbortError') return
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async fetchItemById(id: number | string) {
      const config   = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<PayrollItem>>(
          `${config.public.apiBase}/api/payroll-items/${id}`
        )
        const index = this.items.findIndex(r => r.id === response.data.id)
        if (index !== -1) this.items[index] = response.data
        return response.data
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async updateItem(id: number, payload: Partial<PayrollItemForm> | FormData) {
      const config   = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<PayrollItem>>(
          `${config.public.apiBase}/api/payroll-items/${id}`,
          { method: 'PUT', body: payload }
        )
        const index = this.items.findIndex(r => r.id === id)
        if (index !== -1) this.items[index] = response.data
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async deleteItem(id: number) {
      const config   = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<null>>(
          `${config.public.apiBase}/api/payroll-items/${id}`,
          { method: 'DELETE' }
        )
        this.items = this.items.filter(r => r.id !== id)
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
