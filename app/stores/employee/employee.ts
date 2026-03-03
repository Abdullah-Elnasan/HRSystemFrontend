import { defineStore } from 'pinia'
import { parseError } from '~/utils/parseError'
import type { Employee, EmployeeForm } from '~/types/employee'
import type { apiResponse } from '~/types/table'
import type { PaginationMeta } from '~/types/table'
import { toFormData } from '~/utils/toFormData'
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

   async createEmployee(payload: EmployeeForm) {
  const config = useRuntimeConfig()
  const { $api } = useNuxtApp()

  this._setLoading(true)
  this._setError(null)

  try {
    // تحويل تلقائي إلى FormData إذا وُجدت صورة
    const body = payload.image instanceof File
      ? toFormData(payload)
      : payload

    const response = await $api<apiResponse<Employee>>(
      `${config.public.apiBase}/api/employees`,
      { method: 'POST', body }
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

async updateEmployee(id: number, payload: Partial<EmployeeForm>) {
  const config = useRuntimeConfig()
  const { $api } = useNuxtApp()

  this._setLoading(true)
  this._setError(null)

  try {
    let body: FormData | Partial<EmployeeForm>

    if (payload.image instanceof File) {
      const form = toFormData(payload as Record<string, any>)
      // Laravel يحتاج هذا لـ PUT مع FormData
      form.append('_method', 'PUT')
      body = form

      const response = await $api<apiResponse<Employee>>(
        `${config.public.apiBase}/api/employees/${id}`,
        { method: 'POST', body }  // POST بدل PUT عند FormData
      )
      const index = this.employees.findIndex(e => e.id === id)
      if (index !== -1) this.employees[index] = response.data
      return response
    } else {
      // بدون صورة → أرسل JSON عادي
      const { image, ...rest } = payload
      const response = await $api<apiResponse<Employee>>(
        `${config.public.apiBase}/api/employees/${id}`,
        { method: 'PUT', body: rest }
      )
      const index = this.employees.findIndex(e => e.id === id)
      if (index !== -1) this.employees[index] = response.data
      return response
    }
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
