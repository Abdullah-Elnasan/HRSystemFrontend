import { defineStore } from 'pinia'
import { parseError } from '~/utils/parseError'
import type { Employee, EmployeeForm } from '~/types/employee'
import type { apiResponse } from '~/types/table'
import type { PaginationMeta } from '~/types/table'

interface EmployeesState {
  employees:  Employee[]
  pagination: PaginationMeta | null
  loading:    boolean
  error:      string | null
}

export const useEmployeesStore = defineStore('employees', {
  state: (): EmployeesState => ({
    employees:  [],
    pagination: null,
    loading:    false,
    error:      null,
  }),

  actions: {
    _setLoading(value: boolean) { this.loading = value },
    _setError(message: string | null) { this.error = message },

    async fetchEmployees(params?: Record<string, any>, signal?: AbortSignal) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<Employee[]>>(
          `${config.public.apiBase}/api/employees`,
          { query: params, signal }
        )
        this.employees  = response.data
        this.pagination = response.pagination
      } catch (error: unknown) {
        if ((error as Error).name === 'AbortError') return
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async fetchEmployeeById(id: number | string) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<Employee>>(
          `${config.public.apiBase}/api/employees/${id}`
        )
        return response.data
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async createEmployee(payload: EmployeeForm | FormData) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<Employee>>(
          `${config.public.apiBase}/api/employees`,
          { method: 'POST', body: payload }
        )
        this.employees.unshift(response.data)
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async updateEmployee(id: number, payload: Partial<EmployeeForm> | FormData) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<Employee>>(
          `${config.public.apiBase}/api/employees/${id}`,
          { method: 'PUT', body: payload }
        )
        const index = this.employees.findIndex(e => e.id === id)
        if (index !== -1) this.employees[index] = response.data
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async deleteEmployee(id: number) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<null>>(
          `${config.public.apiBase}/api/employees/${id}`,
          { method: 'DELETE' }
        )
        this.employees = this.employees.filter(e => e.id !== id)
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
