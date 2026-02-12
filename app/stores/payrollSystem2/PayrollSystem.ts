// ~/stores/payroll-systems/payroll-systems.ts
import { defineStore } from "pinia";
import type { PayrollSystem, PayrollSystemForm } from "~/types/PayrollSystem";
import type { PaginatedResponse } from "~/types/table";
import { fetchList } from "~/service/useAsyncData";
import { createResource } from "~/service/createResource";
import { updateResource } from "~/service/updateResource";

export const usePayrollSystemsStore = defineStore("payrollSystems", {
  state: () => ({
    payrollSystems: [] as PayrollSystem[],
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
    getPayrollSystems: (state) => state.payrollSystems,
    getPayrollSystemById: (state) => (id: number | string) =>
      state.payrollSystems.find((p) => p.id === id),
    isLoading: (state) => state.loading,
  },

  actions: {
    /* ================== Fetch Payroll Systems (Paginated) ================== */
    async fetchPayrollSystems(params?: Record<string, any>) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        const response = await fetchList<PaginatedResponse<PayrollSystem>>({
          endpoint: '/api/payroll-systems/payroll-systems',
          page: params?.page ?? 1,
          perPage: params?.per_page ?? 10,
          search: params?.filter?.search,
        });

        this.payrollSystems = response.data;
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

    /* ================== Fetch Single Payroll System ================== */
    async fetchPayrollSystemById(id: number | string) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        const response = await fetchList<{ data: PayrollSystem }>({
          endpoint: `/api/payroll-systems/${id}`,
        });

        const payrollSystem = response.data;
        const index = this.payrollSystems.findIndex((p) => p.id === payrollSystem.id);
        if (index !== -1) this.payrollSystems[index] = payrollSystem;

        if ((response as any).messageAr) {
          toast.add({ title: (response as any).messageAr, color: 'success' });
        }

        return payrollSystem;
      } catch (err: any) {
        handleApiError(err, toast);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Create Payroll System ================== */
    async createPayrollSystem(payload: PayrollSystemForm | FormData) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        return await createResource<PayrollSystem>({
          endpoint: '/api/payroll-systems/payroll-systems',
          payload,
          toast: useToast(),
          onSuccess: (data) => {
            this.payrollSystems.unshift(data);
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

    /* ================== Update Payroll System ================== */
    async updatePayrollSystem(id: number, payload: Partial<PayrollSystemForm> | FormData) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        return await updateResource<PayrollSystem>({
          endpoint: `/api/payroll-systems/${id}`,
          payload,
          toast: useToast(),
          onSuccess: (data) => {
            const index = this.payrollSystems.findIndex((p) => p.id === data.id);
            if (index !== -1) this.payrollSystems[index] = data;
          },
        });
      } catch (err: any) {
        handleApiError(err, toast);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Delete Payroll System ================== */
    async deletePayrollSystem(id: number) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      const index = this.payrollSystems.findIndex((p) => p.id === id);
      const backup = index !== -1 ? this.payrollSystems[index] : null;

      try {
        if (index !== -1) {
          this.payrollSystems.splice(index, 1);
          this.pagination.total -= 1;
        }

        await $fetch(`/api/payroll-systems/${id}`, { method: 'DELETE' });

        toast.add({ title: 'تم حذف نظام الرواتب بنجاح', color: 'success' });
        return true;
      } catch (err: any) {
        if (backup && index !== -1) {
          this.payrollSystems.splice(index, 0, backup);
          this.pagination.total += 1;
        }

        handleApiError(err, toast);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Local State Management ================== */
    setPayrollSystems(payload: PaginatedResponse<PayrollSystem>) {
      this.payrollSystems = payload.data;
      this.pagination = payload.pagination;
    },

    addPayrollSystem(payrollSystem: PayrollSystem) {
      this.payrollSystems.unshift(payrollSystem);
      this.pagination.total += 1;
    },

    removePayrollSystem(id: number | string) {
      const index = this.payrollSystems.findIndex((p) => p.id === id);
      if (index !== -1) {
        this.payrollSystems.splice(index, 1);
        this.pagination.total -= 1;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
