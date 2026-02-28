import { defineStore } from 'pinia'
import { parseError } from '~/utils/parseError'
import type { Permission } from '~/types/permission'
import type { apiResponse } from '~/types/table'
import type { PaginationMeta } from '~/types/table'

interface PermissionsState {
  permissions: Permission[]
  pagination:  PaginationMeta | null
  loading:     boolean
  error:       string | null
}

export const usePermissionsStore = defineStore('permissions', {
  state: (): PermissionsState => ({
    permissions: [],
    pagination:  null,
    loading:     false,
    error:       null,
  }),

  actions: {
    _setLoading(value: boolean) { this.loading = value },
    _setError(message: string | null) { this.error = message },

    async fetchPermissions(params?: Record<string, any>, signal?: AbortSignal) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<Permission[]>>(
          `${config.public.apiBase}/api/permissions`,
          { query: params, signal }
        )
        this.permissions = response.data
        this.pagination  = response.pagination
      } catch (error: unknown) {
        if ((error as Error).name === 'AbortError') return
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async fetchPermissionById(id: number | string) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<Permission>>(
          `${config.public.apiBase}/api/permissions/${id}`
        )
        const index = this.permissions.findIndex(p => p.id === response.data.id)
        if (index !== -1) this.permissions[index] = response.data
        return response.data
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
