// stores/branches/branches.ts
import { defineStore } from "pinia";
import type { Branch, BranchForm } from "~/types/branch";
import type { PaginatedResponse } from "~/types/table";
import { fetchList } from "~/service/useAsyncData";
import { createResource } from "~/service/createResource";
import { updateResource } from "~/service/updateResource";

function getErrorMessage(err: any): string {
  // إذا كانت رسالة متعددة الأخطاء
  if (err?.data?.errors && typeof err.data.errors === 'object') {
    return Object.values(err.data.errors).flat().join(', ');
  }
  return err?.data?.messageAr ?? err?.data?.message ?? err?.message ?? 'حدث خطأ غير متوقع';
}

export const useBranchesStore = defineStore("branches", {
  state: () => ({
    branches: [] as Branch[],
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
    getBranches: (state) => state.branches,
    getBranchById: (state) => (id: number | string) =>
      state.branches.find((e) => e.id === id),
    isLoading: (state) => state.loading,
  },

  actions: {
    /* ================== Fetch Branches (Paginated) ================== */
    async fetchBranches(params?: Record<string, any>) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        const response = await fetchList<PaginatedResponse<Branch>>({
          endpoint: '/api/branches/branches',
          page: params?.page ?? 1,
          perPage: params?.per_page ?? 10,
          search: params?.filter?.search,
        });

        this.branches = response.data;
        this.pagination = response.pagination;

        if ((response as any).messageAr) {
          toast.add({ title: (response as any).messageAr, color: 'success' });
        }

        return response;
      } catch (err: any) {
        this.error = getErrorMessage(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Fetch Single Branch ================== */
    async fetchBranchById(id: number | string) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        const response = await fetchList<{ data: Branch }>({
          endpoint: `/api/branches/branches/${id}`,
        });

        const branch = response.data;
        const index = this.branches.findIndex((e) => e.id === branch.id);
        if (index !== -1) this.branches[index] = branch;

        if ((response as any).messageAr) {
          toast.add({ title: (response as any).messageAr, color: 'success' });
        }

        return branch;
      } catch (err: any) {
        this.error = getErrorMessage(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Create Branch ================== */
    async createBranch(payload: BranchForm | FormData) {
      this.loading = true;
      this.error = null;

      try {
        return await createResource<Branch>({
          endpoint: '/api/branches/branches',
          payload,
          toast: useToast(),
          onSuccess: (data) => {
            this.branches.unshift(data);
            this.pagination.total += 1;
          },
        });
      } catch (err: any) {
        this.error = getErrorMessage(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Update Branch ================== */
    async updateBranch(id: number, payload: Partial<BranchForm> | FormData) {
      this.loading = true;
      this.error = null;

      try {
        return await updateResource<Branch>({
          endpoint: `/api/branches/${id}`,
          payload,
          toast: useToast(),
          onSuccess: (data) => {
            const index = this.branches.findIndex((b) => b.id === data.id);
            if (index !== -1) this.branches[index] = data;
          },
        });
      } catch (err: any) {
        this.error = getErrorMessage(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Delete Branch ================== */
    async deleteBranch(id: number) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      const index = this.branches.findIndex((e) => e.id === id);
      const backup = index !== -1 ? this.branches[index] : null;

      try {
        if (index !== -1) {
          this.branches.splice(index, 1);
          this.pagination.total -= 1;
        }

        await $fetch(`/api/branches/${id}`, { method: 'DELETE' });

        toast.add({ title: 'تم حذف الفرع بنجاح', color: 'success' });
        return true;
      } catch (err: any) {
        if (backup && index !== -1) {
          this.branches.splice(index, 0, backup);
          this.pagination.total += 1;
        }

        this.error = getErrorMessage(err);
        toast.add({ title: this.error, color: 'error' });
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Local State Management ================== */
    setBranches(payload: PaginatedResponse<Branch>) {
      this.branches = payload.data;
      this.pagination = payload.pagination;
    },

    addBranch(branch: Branch) {
      this.branches.unshift(branch);
      this.pagination.total += 1;
    },

    removeBranch(id: number | string) {
      const index = this.branches.findIndex((e) => e.id === id);
      if (index !== -1) {
        this.branches.splice(index, 1);
        this.pagination.total -= 1;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
