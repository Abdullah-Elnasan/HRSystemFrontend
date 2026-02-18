import { defineStore } from 'pinia'
import { parseError } from '~/utils/parseError'
import type { Branch, BranchForm } from '~/types/branch'
import type { apiResponse } from '~/types/table'
import type { PaginationMeta } from '~/types/table'

interface BranchesState {
  branches: Branch[]
  pagination: PaginationMeta | null
  loading: boolean
  error: string | null
}

export const useBranchesStore = defineStore('branches', {
  state: (): BranchesState => ({
    branches: [],
    pagination: null,
    loading: false,
    error: null,
  }),

  actions: {
    _setLoading(value: boolean) { this.loading = value },
    _setError(message: string | null) { this.error = message },

    async fetchBranches(params?: Record<string, any>, signal?: AbortSignal) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<Branch[]>>(
          `${config.public.apiBase}/api/branches`,
          { query: params, signal }
        )
        this.branches   = response.data
        this.pagination = response.pagination
      } catch (error: unknown) {
        if ((error as Error).name === 'AbortError') return
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async fetchBranchById(id: number | string) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<Branch>>(
          `${config.public.apiBase}/api/branches/${id}`
        )
        return response.data
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async createBranch(payload: BranchForm | FormData) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<Branch>>(
          `${config.public.apiBase}/api/branches`,
          { method: 'POST', body: payload }
        )
        this.branches.unshift(response.data)
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async updateBranch(id: number, payload: Partial<BranchForm> | FormData) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<Branch>>(
          `${config.public.apiBase}/api/branches/${id}`,
          { method: 'PUT', body: payload }
        )
        const index = this.branches.findIndex(b => b.id === id)
        if (index !== -1) this.branches[index] = response.data
        return response
      } catch (error: unknown) {
        this._setError(parseError(error))
        throw error
      } finally {
        this._setLoading(false)
      }
    },

    async deleteBranch(id: number) {
      const config = useRuntimeConfig()
      const { $api } = useNuxtApp()

      this._setLoading(true)
      this._setError(null)

      try {
        const response = await $api<apiResponse<null>>(
          `${config.public.apiBase}/api/branches/${id}`,
          { method: 'DELETE' }
        )
        this.branches = this.branches.filter(b => b.id !== id)
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
