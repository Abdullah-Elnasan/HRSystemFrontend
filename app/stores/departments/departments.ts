import { defineStore } from "pinia";
import type { Department, DepartmentForm } from "~/types/deparment";
import type { PaginatedResponse } from "~/types/table";
import { fetchList } from "~/service/useAsyncData";
import { createResource } from "~/service/createResource";
import { updateResource } from "~/service/updateResource";

function getErrorMessage(err: any): string {
  if (err?.data?.errors && typeof err.data.errors === "object") {
    return Object.values(err.data.errors).flat().join(", ");
  }
  return err?.data?.messageAr ?? err?.data?.message ?? err?.message ?? "حدث خطأ غير متوقع";
}

export const useDepartmentsStore = defineStore("departments", {
  state: () => ({
    departments: [] as Department[],
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
    getDepartments: (state) => state.departments,
    getDepartmentById: (state) => (id: number | string) =>
      state.departments.find((e) => e.id === id),
    isLoading: (state) => state.loading,
  },

  actions: {
    /* ================== Fetch Departments (Paginated) ================== */
    async fetchDepartments(params?: Record<string, any>) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        const response = await fetchList<PaginatedResponse<Department>>({
          endpoint: "/api/departments/departments",
          page: params?.page ?? 1,
          perPage: params?.per_page ?? 10,
          search: params?.filter?.search,
        });

        this.departments = response.data;
        this.pagination = response.pagination;

        if ((response as any).messageAr) {
          toast.add({ title: (response as any).messageAr, color: "success" });
        }

        return response;
      } catch (err: any) {
        this.error = getErrorMessage(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Fetch Single Department ================== */
    async fetchDepartmentById(id: number | string) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        const response = await fetchList<{ data: Department }>({
          endpoint: `/api/departments/departments/${id}`,
        });

        const department = response.data;
        const index = this.departments.findIndex((e) => e.id === department.id);
        if (index !== -1) this.departments[index] = department;

        if ((response as any).messageAr) {
          toast.add({ title: (response as any).messageAr, color: "success" });
        }

        return department;
      } catch (err: any) {
        this.error = getErrorMessage(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Create Department ================== */
    async createDepartment(payload: DepartmentForm | FormData) {
      this.loading = true;
      this.error = null;

      try {
        return await createResource<Department>({
          endpoint: "/api/departments/departments",
          payload,
          toast: useToast(),
          onSuccess: (data) => {
            this.departments.unshift(data);
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

    /* ================== Update Department ================== */
    async updateDepartment(id: number, payload: Partial<DepartmentForm> | FormData) {
      this.loading = true;
      this.error = null;

      try {
        return await updateResource<Department>({
          endpoint: `/api/departments/${id}`,
          payload,
          toast: useToast(),
          onSuccess: (data) => {
            const index = this.departments.findIndex((e) => e.id === data.id);
            if (index !== -1) this.departments[index] = data;
          },
        });
      } catch (err: any) {
        this.error = getErrorMessage(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Delete Department ================== */
    async deleteDepartment(id: number) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      const index = this.departments.findIndex((e) => e.id === id);
      const backup = index !== -1 ? this.departments[index] : null;

      try {
        if (index !== -1) {
          this.departments.splice(index, 1);
          this.pagination.total -= 1;
        }

        await $fetch(`/api/departments/${id}`, { method: "DELETE" });

        toast.add({ title: "تم حذف القسم بنجاح", color: "success" });
        return true;
      } catch (err: any) {
        if (backup && index !== -1) {
          this.departments.splice(index, 0, backup);
          this.pagination.total += 1;
        }

        this.error = getErrorMessage(err);
        toast.add({ title: this.error, color: "error" });
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Helper: Convert to FormData ================== */
    toFormData(payload: Record<string, any>): FormData {
      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (typeof value === "object" && !(value instanceof Date)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      return formData;
    },

    /* ================== Local State Management ================== */
    setDepartments(payload: PaginatedResponse<Department>) {
      this.departments = payload.data;
      this.pagination = payload.pagination;
    },

    addDepartment(department: Department) {
      this.departments.unshift(department);
      this.pagination.total += 1;
    },

    removeDepartment(id: number | string) {
      const index = this.departments.findIndex((e) => e.id === id);
      if (index !== -1) {
        this.departments.splice(index, 1);
        this.pagination.total -= 1;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
