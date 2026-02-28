import { defineStore } from 'pinia'
import { parseError } from '~/utils/parseError'
import type { UserGroup, UserGroupForm, PermissionAssignForm } from '~/types/userGroups'
import type { apiResponse } from '~/types/table'
import type { PaginationMeta } from '~/types/table'

interface UserGroupsState {
  userGroups: UserGroup[]
  pagination: PaginationMeta | null
  loading:    boolean
  error:      string | null
}

export const useUserGroupStore = defineStore('userGroups', {
  state: (): UserGroupsState => ({
    userGroups: [],
    pagination: null,
    loading:    false,
    error:      null,
  }),

  actions: {
    _setLoading(value: boolean) { this.loading = value },
    _setError(message: string | null) { this.error = message },

    async fetchUserGroups(params?: Record<string, any>, signal?: AbortSignal) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<UserGroup[]>>(
          `${config.public.apiBase}/api/user-groups`,
          { query: params, signal }
        )
        this.userGroups = response.data
        this.pagination = response.pagination
      } catch (error: unknown) {
        if ((error as Error).name === 'AbortError') return
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async fetchUserGroupById(id: number | string) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<UserGroup>>(
          `${config.public.apiBase}/api/user-groups/${id}`
        )
        const index = this.userGroups.findIndex(g => g.id === response.data.id)
        if (index !== -1) this.userGroups[index] = response.data
        return response.data
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async createUserGroup(payload: UserGroupForm | FormData) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<UserGroup>>(
          `${config.public.apiBase}/api/user-groups`,
          { method: 'POST', body: payload }
        )
        this.userGroups.unshift(response.data)
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async updateUserGroup(id: number, payload: Partial<UserGroupForm> | FormData) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<UserGroup>>(
          `${config.public.apiBase}/api/user-groups/${id}`,
          { method: 'PUT', body: payload }
        )
        const index = this.userGroups.findIndex(g => g.id === id)
        if (index !== -1) this.userGroups[index] = response.data
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async deleteUserGroup(id: number) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<null>>(
          `${config.public.apiBase}/api/user-groups/${id}`,
          { method: 'DELETE' }
        )
        this.userGroups = this.userGroups.filter(g => g.id !== id)
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async assignPermissions(payload: PermissionAssignForm) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<any>>(
          `${config.public.apiBase}/api/user-groups/permissions/assign`,
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

    async removePermissions(payload: PermissionAssignForm) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<any>>(
          `${config.public.apiBase}/api/user-groups/permissions/remove`,
          { method: 'DELETE', body: payload }
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
