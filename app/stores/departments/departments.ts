import { defineStore } from 'pinia'
import { parseError } from '~/utils/parseError'
import type { Department, DepartmentForm, DepartmentApiResponse } from '~/types/deparment'
import type { PaginationMeta } from '~/types/table'

interface DepartmentsState {
  departments: Department[]
  pagination: PaginationMeta | null
  loading: boolean
  error: string | null
}

export const useDepartmentsStore = defineStore('departments', {
  state: (): DepartmentsState => ({
    departments: [],
    pagination: null,
    loading: false,
    error: null,
  }),

  actions: {
    _setLoading(value: boolean) { this.loading = value },
    _setError(message: string | null) { this.error = message },

    async fetchDepartments(params?: Record<string, any>, signal?: AbortSignal) {
      const config = useRuntimeConfig();
      const { $api } = useNuxtApp();
      this._setLoading(true)
      this._setError(null)
      try {
        const response = await $api<DepartmentApiResponse<Department[]>>(
          `${config.public.apiBase}/api/departments`,

          {
            query: params, signal
          }
        )
        this.departments = response.data
        this.pagination = response.pagination
      } catch (error: unknown) {
        if ((error as Error).name === 'AbortError') return
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async fetchDepartmentById(id: number | string) {
      this._setLoading(true)
      this._setError(null)
      const config = useRuntimeConfig();
      const { $api } = useNuxtApp();
      try {
        const response = await $api<DepartmentApiResponse<Department>>(
          `${config.public.apiBase}/api/departments/${id}`
        )
        return response.data
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async createDepartment(payload: DepartmentForm | FormData) {
      this._setLoading(true)
      this._setError(null)
      const config = useRuntimeConfig();
      const { $api } = useNuxtApp();
      try {
        const response = await $api<DepartmentApiResponse<Department>>(
          `${config.public.apiBase}/api/departments`,
          { method: 'POST', body: payload }
        )
        this.departments.unshift(response.data)
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async updateDepartment(id: number, payload: Partial<DepartmentForm> | FormData) {
      this._setLoading(true)
      this._setError(null)
      const config = useRuntimeConfig();
      const { $api } = useNuxtApp();
      try {
        const response = await $api<DepartmentApiResponse<Department>>(
          `${config.public.apiBase}/api/departments/${id}`,
          { method: 'PUT', body: payload }
        )
        const index = this.departments.findIndex(d => d.id === id)
        if (index !== -1) this.departments[index] = response.data
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async deleteDepartment(id: number) {
      this._setLoading(true)
      this._setError(null)
      const config = useRuntimeConfig();
      const { $api } = useNuxtApp();
      try {
        const response = await $api<DepartmentApiResponse<null>>(`${config.public.apiBase}/api/departments/${id}`, { method: 'DELETE' })
        this.departments = this.departments.filter(d => d.id !== id)
        return response // ✅ أضف هذا
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
