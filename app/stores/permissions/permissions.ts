// ~/stores/permissions/permissions.ts
import { defineStore } from "pinia";
import type { Permission, PermissionForm } from "~/types/permission";
import type { PaginatedResponse } from "~/types/table";
import { fetchList } from "~/service/useAsyncData";

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
          endpoint: '/api/permissions/permissions',
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

    /* ================== Local State Management ================== */
    setPermissions(payload: PaginatedResponse<Permission>) {
      this.permissions = payload.data;
      this.pagination = payload.pagination;
    },


    clearError() {
      this.error = null;
    },
  },
});
