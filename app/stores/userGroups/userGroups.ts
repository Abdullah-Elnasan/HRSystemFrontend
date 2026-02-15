import { defineStore } from 'pinia'
import type { UserGroup, UserGroupForm, PermissionAssignForm } from '~/types/userGroups'
import type { PaginatedResponse } from '~/types/table'
import { fetchList } from '~/service/useAsyncData'
import { createResource } from '~/service/createResource'
import { updateResource } from '~/service/updateResource'
import { assignResource, removeResource } from '~/service/assignResource'

// function getErrorMessage(err: any): string {
//   if (err?.data?.errors && typeof err.data.errors === 'object') {
//     return Object.values(err.data.errors).flat().join(', ')
//   }
//   return err?.data?.messageAr ?? err?.data?.message ?? err?.message ?? 'حدث خطأ غير متوقع'
// }

export const useUserGroupStore = defineStore('userGroups', {
  state: () => ({
    userGroups: [] as UserGroup[],
    pagination: {
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1,
    },
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getUserGroups: (state) => state.userGroups,
    getUserGroupById: (state) => (id: number | string) =>
      state.userGroups.find((e) => e.id === id),
    isLoading: (state) => state.loading,
  },

  actions: {
    /* ================== Fetch List ================== */
    async fetchUserGroups(params?: Record<string, any>) {
      this.loading = true
      this.error = null
      const toast = useToast()

      try {
        const response = await fetchList<PaginatedResponse<UserGroup>>({
          endpoint: '/api/user-groups',
          page: params?.page ?? 1,
          perPage: params?.per_page ?? 10,
          search: params?.filter?.search,
        })

        this.userGroups = response.data
        this.pagination = response.pagination

        if ((response as any).messageAr) {
          toast.add({ title: (response as any).messageAr, color: 'success' })
        }

        return response
      } catch (err: any) {
        handleApiError(err, toast)
        // this.error = getErrorMessage(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /* ================== Fetch Single ================== */
    async fetchUserGroupById(id: number | string) {
      this.loading = true
      this.error = null
      const toast = useToast()

      try {
        const response = await fetchList<{ data: UserGroup }>({
          endpoint: `/api/user-groups/${id}`,
        })

        const group = response.data
        const index = this.userGroups.findIndex((e) => e.id === group.id)
        if (index !== -1) this.userGroups[index] = group

        if ((response as any).messageAr) {
          toast.add({ title: (response as any).messageAr, color: 'success' })
        }

        return group
      } catch (err: any) {
        handleApiError(err, toast)
        // this.error = getErrorMessage(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /* ================== Create ================== */
    async createUserGroup(payload: UserGroupForm | FormData) {
      this.loading = true
      this.error = null
      const toast = useToast()
      try {
        return await createResource<UserGroup>({
          endpoint: '/api/user-groups/user-groups',
          payload,
          toast: useToast(),
          onSuccess: (data) => {
            this.userGroups.unshift(data)
            this.pagination.total += 1
          },
        })
      } catch (err: any) {
        handleApiError(err, toast)
        // this.error = getErrorMessage(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /* ================== Update ================== */
    async updateUserGroup(id: number, payload: Partial<UserGroupForm> | FormData) {
      this.loading = true
      this.error = null
      const toast = useToast()
      try {
        return await updateResource<UserGroup>({
          endpoint: `/api/user-groups/${id}`,
          payload,
          toast: useToast(),
          onSuccess: (data) => {
            const index = this.userGroups.findIndex((e) => e.id === data.id)
            if (index !== -1) this.userGroups[index] = data
          },
        })
      } catch (err: any) {
        handleApiError(err, toast)
        // this.error = getErrorMessage(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /* ================== Delete ================== */
    async deleteUserGroup(id: number) {
      this.loading = true
      this.error = null
      const toast = useToast()

      const index = this.userGroups.findIndex((e) => e.id === id)
      const backup = index !== -1 ? this.userGroups[index] : null

      try {
        if (index !== -1) {
          this.userGroups.splice(index, 1)
          this.pagination.total -= 1
        }

        await $fetch(`/api/user-groups/${id}`, { method: 'DELETE' })
        toast.add({ title: 'تم حذف المجموعة بنجاح', color: 'success' })
        return true
      } catch (err: any) {
        if (backup && index !== -1) {
          this.userGroups.splice(index, 0, backup)
          this.pagination.total += 1
        }
        // this.error = getErrorMessage(err)
        handleApiError(err, toast)
        // toast.add({ title: this.error, color: 'error' })
        throw err
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },

    setUserGroups(payload: PaginatedResponse<UserGroup>) {
      this.userGroups = payload.data
      this.pagination = payload.pagination
    },

    addUserGroup(group: UserGroup) {
      this.userGroups.unshift(group)
      this.pagination.total += 1
    },


    /* ================== Assign Permissions ================== */
    async assignPermissions(payload: PermissionAssignForm) {
      this.loading = true
      this.error = null
      const toast = useToast()

      try {
        return await assignResource<any>({
          endpoint: '/api/user-groups/assign',
          payload,
          toast,
          successMessage: 'تم إسناد الصلاحيات بنجاح',
          onSuccess: () => {
          },
        })
      } catch (err: any) {
        throw err
      } finally {
        this.loading = false
      }
    },

    /* ================== Remove Permissions ================== */
    async removePermissions(payload: PermissionAssignForm) {
      this.loading = true
      this.error = null
      const toast = useToast()

      try {
        return await removeResource<any>({
          endpoint: '/api/user-groups/remove',
          payload,
          toast,
          successMessage: 'تم حذف الصلاحيات بنجاح',
          onSuccess: () => {
            // يمكنك تحديث البيانات هنا إذا لزم الأمر
          },
        })
      } catch (err: any) {
        // handleApiError(err, toast)
        throw err
      } finally {
        this.loading = false
      }
    },

    removeUserGroup(id: number | string) {
      const index = this.userGroups.findIndex((e) => e.id === id)
      if (index !== -1) {
        this.userGroups.splice(index, 1)
        this.pagination.total -= 1
      }
    },
  },
})
