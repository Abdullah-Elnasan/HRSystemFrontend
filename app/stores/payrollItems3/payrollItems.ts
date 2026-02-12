// ~/stores/payroll-records/payroll-records.ts
import { defineStore } from "pinia";
import type { PayrollItem, PayrollItemForm } from "~/types/payrolls/payrollItem";
import type { PaginatedResponse } from "~/types/table";
import { fetchList } from "~/service/useAsyncData";
import { createResource } from "~/service/createResource";
import { updateResource } from "~/service/updateResource";

export const usePayrollItemsStore = defineStore("payrollItems", {
  state: () => ({
    items: [] as PayrollItem[],
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
    getItems: (state) => state.items,
    getItemById: (state) => (id: number | string) =>
      state.items.find((r) => r.id === id),
    isLoading: (state) => state.loading,
  },

  actions: {
    /* ================== Fetch Items (Paginated) ================== */
async fetchItems(params?: Record<string, any>) {
  this.loading = true
  this.error = null
  const toast = useToast()

  try {
    const response = await fetchList<PaginatedResponse<PayrollItem>>({
      endpoint: params?.endpoint ?? '/api/payroll-items/payroll-items',
      page: params?.page ?? 1,
      perPage: params?.per_page ?? 10,
      search: params?.filter?.search,
    })

    this.items = response.data
    this.pagination = response.pagination
    return response
  } finally {
    this.loading = false
  }
},


    /* ================== Fetch Single Record ================== */
    async fetchItemById(id: number | string) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        const response = await fetchList<{ data: PayrollItem }>({
          endpoint: `/api/payroll-items/${id}`,
        });

        const item = response.data;
        const index = this.items.findIndex((r) => r.id === item.id);
        if (index !== -1) this.items[index] = item;

        if ((response as any).messageAr) {
          toast.add({ title: (response as any).messageAr, color: 'success' });
        }

        return item;
      } catch (err: any) {
        handleApiError(err, toast);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Create Record ================== */
    // async createRecord(payload: PayrollItemForm | FormData) {
    //   this.loading = true;
    //   this.error = null;
    //   const toast = useToast();

    //   try {
    //     return await createResource<PayrollItem>({
    //       endpoint: '/api/payroll-records',
    //       payload,
    //       toast: useToast(),
    //       onSuccess: (data) => {
    //         this.records.unshift(data);
    //         this.pagination.total += 1;
    //       },
    //     });
    //   } catch (err: any) {
    //     handleApiError(err, toast);
    //     throw err;
    //   } finally {
    //     this.loading = false;
    //   }
    // },

    /* ================== Update Record ================== */
    async updateItem(id: number, payload: Partial<PayrollItemForm> | FormData) {
      console.log('updateItem')
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        console.log(id)
        return await updateResource<PayrollItem>({
          endpoint: `/api/payroll-items/${id}`,
          payload,
          toast: useToast(),
          onSuccess: (data) => {
            const index = this.items.findIndex((r) => r.id === data.id);
            if (index !== -1) this.items[index] = data;
          },
        });
      } catch (err: any) {
        handleApiError(err, toast);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Delete Record ================== */
    async deleteItem(id: number) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      const index = this.items.findIndex((r) => r.id === id);
      const backup = index !== -1 ? this.items[index] : null;

      try {
        if (index !== -1) {
          this.items.splice(index, 1);
          this.pagination.total -= 1;
        }

        await $fetch(`/api/payroll-items/${id}`, { method: 'DELETE' });

        toast.add({ title: 'تم حذف السجل بنجاح', color: 'success' });
        return true;
      } catch (err: any) {
        if (backup && index !== -1) {
          this.items.splice(index, 0, backup);
          this.pagination.total += 1;
        }

        handleApiError(err, toast);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Local State Management ================== */
    setItems(payload: PaginatedResponse<PayrollItem>) {
      this.items = payload.data;
      this.pagination = payload.pagination;
    },

    addRecord(record: PayrollItem) {
      this.items.unshift(record);
      this.pagination.total += 1;
    },

    removeRecord(id: number | string) {
      const index = this.items.findIndex((r) => r.id === id);
      if (index !== -1) {
        this.items.splice(index, 1);
        this.pagination.total -= 1;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
