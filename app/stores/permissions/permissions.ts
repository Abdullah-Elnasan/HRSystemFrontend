// ~/stores/permissions/permissions.ts
import { defineStore } from "pinia";
import type { Permission, PermissionForm } from "~/types/permission";
import type { PaginatedResponse } from "~/types/table";
import { fetchList } from "~/service/useAsyncData";
import { createResource } from "~/service/createResource";
import { updateResource } from "~/service/updateResource";

export const usePermissionsStore = defineStore("permissions", {
  state: () => ({
    permissions: [] as Permission[],
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
    getPermissions: (state) => state.permissions,
    getPermissionById: (state) => (id: number | string) =>
      state.permissions.find((p) => p.id === id),
    isLoading: (state) => state.loading,
  },

  actions: {
    /* ================== Fetch Permissions (Paginated) ================== */
    async fetchPermissions(params?: Record<string, any>) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        const response = await fetchList<PaginatedResponse<Permission>>({
          endpoint: '/api/permissions',
          page: params?.page ?? 1,
          perPage: params?.per_page ?? 10,
          search: params?.filter?.search,
        });

        this.permissions = response.data;
        this.pagination = response.pagination;

        if ((response as any).messageAr) {
          toast.add({ title: (response as any).messageAr, color: 'success' });
        }

        return response;
      } catch (err: any) {
        handleApiError(err, toast);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Fetch Single Permission ================== */
    async fetchPermissionById(id: number | string) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        const response = await fetchList<{ data: Permission }>({
          endpoint: `/api/permissions/${id}`,
        });

        const permission = response.data;
        const index = this.permissions.findIndex((p) => p.id === permission.id);
        if (index !== -1) this.permissions[index] = permission;

        if ((response as any).messageAr) {
          toast.add({ title: (response as any).messageAr, color: 'success' });
        }

        return permission;
      } catch (err: any) {
        handleApiError(err, toast);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Create Permission ================== */
    async createPermission(payload: PermissionForm | FormData) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        return await createResource<Permission>({
          endpoint: '/api/permissions',
          payload,
          toast: useToast(),
          onSuccess: (data) => {
            this.permissions.unshift(data);
            this.pagination.total += 1;
          },
        });
      } catch (err: any) {
        handleApiError(err, toast);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Update Permission ================== */
    async updatePermission(id: number, payload: Partial<PermissionForm> | FormData) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        return await updateResource<Permission>({
          endpoint: `/api/permissions/${id}`,
          payload,
          toast: useToast(),
          onSuccess: (data) => {
            const index = this.permissions.findIndex((p) => p.id === data.id);
            if (index !== -1) this.permissions[index] = data;
          },
        });
      } catch (err: any) {
        handleApiError(err, toast);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Delete Permission ================== */
    async deletePermission(id: number) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      const index = this.permissions.findIndex((p) => p.id === id);
      const backup = index !== -1 ? this.permissions[index] : null;

      try {
        if (index !== -1) {
          this.permissions.splice(index, 1);
          this.pagination.total -= 1;
        }

        await $fetch(`/api/permissions/${id}`, { method: 'DELETE' });

        toast.add({ title: 'تم حذف الصلاحية بنجاح', color: 'success' });
        return true;
      } catch (err: any) {
        if (backup && index !== -1) {
          this.permissions.splice(index, 0, backup);
          this.pagination.total += 1;
        }

        handleApiError(err, toast);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Local State Management ================== */
    setPermissions(payload: PaginatedResponse<Permission>) {
      this.permissions = payload.data;
      this.pagination = payload.pagination;
    },

    addPermission(permission: Permission) {
      this.permissions.unshift(permission);
      this.pagination.total += 1;
    },

    removePermission(id: number | string) {
      const index = this.permissions.findIndex((p) => p.id === id);
      if (index !== -1) {
        this.permissions.splice(index, 1);
        this.pagination.total -= 1;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
