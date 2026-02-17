// // stores/branches/branches.ts
// import { defineStore } from "pinia";
// import type { Branch, BranchForm } from "~/types/branch";
// import type { PaginatedResponse } from "~/types/table";
// import { fetchList } from "~/service/useAsyncData";
// import { createResource } from "~/service/createResource";
// import { updateResource } from "~/service/updateResource";



// export const useBranchesStore = defineStore("branches", {
//   state: () => ({
//     branches: [] as Branch[],
//     pagination: {
//       current_page: 1,
//       per_page: 10,
//       total: 0,
//       last_page: 1,
//     },
//     loading: false,
//     error: null as string | null,
//   }),

//   getters: {
//     getBranches: (state) => state.branches,
//     getBranchById: (state) => (id: number | string) =>
//       state.branches.find((e) => e.id === id),
//     isLoading: (state) => state.loading,
//   },

//   actions: {
//     /* ================== Fetch Branches (Paginated) ================== */
//     async fetchBranches(params?: Record<string, any>) {
//       this.loading = true;
//       this.error = null;
//       const toast = useToast();

//       try {
//         const response = await fetchList<PaginatedResponse<Branch>>({
//           endpoint: '/api/branches/branches',
//           page: params?.page ?? 1,
//           perPage: params?.per_page ?? 10,
//           search: params?.filter?.search,
//         });

//         this.branches = response.data;
//         this.pagination = response.pagination;

//         if ((response as any).messageAr) {
//           toast.add({ title: (response as any).messageAr, color: 'success' });
//         }

//         return response;
//       } catch (err: any) {
//         // this.error = getErrorMessage(err);
//         handleApiError(err, toast)
//         throw err;
//       } finally {
//         this.loading = false;
//       }
//     },

//     /* ================== Fetch Single Branch ================== */
//     async fetchBranchById(id: number | string) {
//       this.loading = true;
//       this.error = null;
//       const toast = useToast();

//       try {
//         const response = await fetchList<{ data: Branch }>({
//           endpoint: `/api/branches/branches/${id}`,
//         });

//         const branch = response.data;
//         const index = this.branches.findIndex((e) => e.id === branch.id);
//         if (index !== -1) this.branches[index] = branch;

//         if ((response as any).messageAr) {
//           toast.add({ title: (response as any).messageAr, color: 'success' });
//         }

//         return branch;
//       } catch (err: any) {
//         // this.error = getErrorMessage(err);
//         handleApiError(err, toast)
//         throw err;
//       } finally {
//         this.loading = false;
//       }
//     },

//     /* ================== Create Branch ================== */
//     async createBranch(payload: BranchForm | FormData) {
//       this.loading = true;
//       this.error = null;
// const toast = useToast();

//       try {
//         return await createResource<Branch>({
//           endpoint: '/api/branches/branches',
//           payload,
//           toast: useToast(),
//           onSuccess: (data) => {
//             this.branches.unshift(data);
//             this.pagination.total += 1;
//           },
//         });
//       } catch (err: any) {
//         // this.error = getErrorMessage(err);
//         handleApiError(err, toast)
//         throw err;
//       } finally {
//         this.loading = false;
//       }
//     },

//     /* ================== Update Branch ================== */
//     async updateBranch(id: number, payload: Partial<BranchForm> | FormData) {
//       this.loading = true;
//       this.error = null;
// const toast = useToast();

//       try {
//         return await updateResource<Branch>({
//           endpoint: `/api/branches/${id}`,
//           payload,
//           toast: useToast(),
//           onSuccess: (data) => {
//             const index = this.branches.findIndex((b) => b.id === data.id);
//             if (index !== -1) this.branches[index] = data;
//           },
//         });
//       } catch (err: any) {
//         // this.error = getErrorMessage(err);
//         handleApiError(err, toast)
//         throw err;
//       } finally {
//         this.loading = false;
//       }
//     },

//     /* ================== Delete Branch ================== */
//     async deleteBranch(id: number) {
//       this.loading = true;
//       this.error = null;
//       const toast = useToast();

//       const index = this.branches.findIndex((e) => e.id === id);
//       const backup = index !== -1 ? this.branches[index] : null;

//       try {
//         if (index !== -1) {
//           this.branches.splice(index, 1);
//           this.pagination.total -= 1;
//         }

//         await $fetch(`/api/branches/${id}`, { method: 'DELETE' });

//         toast.add({ title: 'تم حذف الفرع بنجاح', color: 'success' });
//         return true;
//       } catch (err: any) {
//         if (backup && index !== -1) {
//           this.branches.splice(index, 0, backup);
//           this.pagination.total += 1;
//         }

//         // this.error = getErrorMessage(err);
//         handleApiError(err, toast)
//         // toast.add({ title: this.error, color: 'error' });
//         throw err;
//       } finally {
//         this.loading = false;
//       }
//     },

//     /* ================== Local State Management ================== */
//     setBranches(payload: PaginatedResponse<Branch>) {
//       this.branches = payload.data;
//       this.pagination = payload.pagination;
//     },

//     addBranch(branch: Branch) {
//       this.branches.unshift(branch);
//       this.pagination.total += 1;
//     },

//     removeBranch(id: number | string) {
//       const index = this.branches.findIndex((e) => e.id === id);
//       if (index !== -1) {
//         this.branches.splice(index, 1);
//         this.pagination.total -= 1;
//       }
//     },

//     clearError() {
//       this.error = null;
//     },
//   },
// });

// stores/branches/branches.ts
// stores/branches/branches.ts
// stores/branches/branches.ts
import { defineStore } from "pinia";
import type { Branch, BranchForm } from "~/types/branch";
import type { PaginatedResponse } from "~/types/table";
import { toFormData } from "~/utils/toFormData";

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

  actions: {
    /* ================== Fetch Branches مع AbortSignal ================== */
    async fetchBranches(params?: Record<string, any>, signal?: AbortSignal) {
      this.loading = true;
      this.error = null;
      const toast = useToast();
      const config = useRuntimeConfig();


      try {
        const query: Record<string, any> = {
          page: params?.page ?? 1,
          per_page: params?.per_page ?? 10,
          ...(params?.filter?.search ? { 'filter[search]': params.filter.search } : {}),
        };

        const response = await $fetch<PaginatedResponse<Branch>>(
          `${config.public.apiBase}/api/branches`,
          {
            query,
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
            signal, // إضافة signal للإلغاء
          }
        );

        this.branches = response.data;
        this.pagination = response.pagination;

        if ((response as any).messageAr) {
          toast.add({ title: (response as any).messageAr, color: 'success' });
        }

        return response;
      } catch (err: any) {
        // تجاهل أخطاء الإلغاء
        if (err.name === 'AbortError') {
          return;
        }

        this.error = err.message || 'فشل في جلب الفروع';
        handleApiError(err, toast);
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
      const config = useRuntimeConfig();
      const { $api } = useNuxtApp()
      try {
        const response = await $api<{ data: Branch }>(
          `${config.public.apiBase}/api/branches/${id}`,
          {
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          }
        );

        const branch = response.data;
        const index = this.branches.findIndex((e) => e.id === branch.id);
        if (index !== -1) this.branches[index] = branch;

        if ((response as any).messageAr) {
          toast.add({ title: (response as any).messageAr, color: 'success' });
        }

        return branch;
      } catch (err: any) {
        this.error = err.message || 'فشل في جلب الفرع';
        handleApiError(err, toast);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Create Branch ================== */
    async createBranch(payload: BranchForm | FormData) {
      this.loading = true;
      this.error = null;
      const toast = useToast();
      const config = useRuntimeConfig();
      const { $api } = useNuxtApp()
      try {
        const formData = payload instanceof FormData
          ? payload
          : toFormData(payload);

        const response = await $api<{ data: Branch; messageAr?: string }>(
          `${config.public.apiBase}/api/branches`,
          {
            method: 'POST',
            body: formData,
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          }
        );

        const data = response.data;
        this.branches.unshift(data);
        this.pagination.total += 1;

        toast.add({
          title: response.messageAr ?? 'تم الإنشاء بنجاح',
          color: 'success',
        });

        return data;
      } catch (err: any) {
        this.error = err.message || 'فشل في إنشاء الفرع';
        handleApiError(err, toast);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Update Branch ================== */
    async updateBranch(id: number, payload: Partial<BranchForm> | FormData) {
      this.loading = true;
      this.error = null;
      const toast = useToast();
      const config = useRuntimeConfig();
      const { $api } = useNuxtApp()
      try {
        const formData = payload instanceof FormData
          ? payload
          : toFormData(payload);

        formData.append('_method', 'PUT');

        const response = await $api<{ data: Branch; messageAr?: string }>(
          `${config.public.apiBase}/api/branches/${id}`,
          {
            method: 'POST',
            body: formData,
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          }
        );

        const data = response.data;
        const index = this.branches.findIndex((b) => b.id === data.id);
        if (index !== -1) this.branches[index] = data;

        toast.add({
          title: response.messageAr ?? 'تم التعديل بنجاح',
          color: 'success',
        });

        return data;
      } catch (err: any) {
        this.error = err.message || 'فشل في تعديل الفرع';
        handleApiError(err, toast);
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
      const config = useRuntimeConfig();

      const index = this.branches.findIndex((e) => e.id === id);
      const backup = index !== -1 ? this.branches[index] : null;

      try {
        if (index !== -1) {
          this.branches.splice(index, 1);
          this.pagination.total -= 1;
        }
        const { $api } = useNuxtApp()

        await $api(`${config.public.apiBase}/api/branches/${id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });

        toast.add({ title: 'تم حذف الفرع بنجاح', color: 'success' });
        return true;
      } catch (err: any) {
        if (backup && index !== -1) {
          this.branches.splice(index, 0, backup);
          this.pagination.total += 1;
        }

        this.error = err.message || 'فشل في حذف الفرع';
        handleApiError(err, toast);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== State Management ================== */
    clearError() {
      this.error = null;
    },
  },
});
