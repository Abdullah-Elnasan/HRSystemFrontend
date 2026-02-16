import { defineStore } from "pinia";
import type { Employee, EmployeeForm } from "~/types/employee";
import type { PaginatedResponse } from "~/types/table";
import { fetchList } from "~/service/useAsyncData";
import { createResource } from "~/service/createResource";
import { updateResource } from "~/service/updateResource";

// function getErrorMessage(err: any): string {
//   if (err?.data?.errors && typeof err.data.errors === 'object') {
//     return Object.values(err.data.errors).flat().join(', ');
//   }
//   return err?.data?.messageAr ?? err?.data?.message ?? err?.message ?? 'حدث خطأ غير متوقع';
// }

export const useEmployeesStore = defineStore("employees", {
  state: () => ({
    employees: [] as Employee[],
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
    getEmployees: (state) => state.employees,
    getEmployeeById: (state) => (id: number | string) =>
      state.employees.find((e) => e.id === id),
    isLoading: (state) => state.loading,
  },

  actions: {
    /* ================== Fetch Employees (Paginated) ================== */
    async fetchEmployees(params?: Record<string, any>) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        const response = await fetchList<PaginatedResponse<Employee>>({
          endpoint: '/api/employees/employees',
          page: params?.page ?? 1,
          perPage: params?.per_page ?? 10,
          search: params?.filter?.search,
        });

        this.employees = response.data;
        this.pagination = response.pagination;

        if ((response as any).messageAr) {
          toast.add({ title: (response as any).messageAr, color: 'success' });
        }

        return response;
      } catch (err: any) {
        handleApiError(err, toast)
        // this.error = getErrorMessage(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Fetch Single Employee ================== */
    async fetchEmployeeById(id: number | string) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      try {
        const response = await fetchList<{ data: Employee }>({
          endpoint: `/api/employees/employees/${id}`,
        });

        const employee = response.data;
        const index = this.employees.findIndex((e) => e.id === employee.id);
        if (index !== -1) this.employees[index] = employee;

        if ((response as any).messageAr) {
          toast.add({ title: (response as any).messageAr, color: 'success' });
        }

        return employee;
      } catch (err: any) {
        handleApiError(err, toast)
        // this.error = getErrorMessage(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Create Employee ================== */
    async createEmployee(payload: EmployeeForm | FormData) {
      this.loading = true;
      this.error = null;
const toast = useToast();
      try {
        return await createResource<Employee>({
          endpoint: '/sanctum/employees/employees',
          payload,
          toast: useToast(),
          onSuccess: (data) => {
            this.employees.unshift(data);
            this.pagination.total += 1;
          },
        });
      } catch (err: any) {
        handleApiError(err, toast)
        // this.error = getErrorMessage(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Update Employee ================== */
    async updateEmployee(id: number, payload: Partial<EmployeeForm> | FormData) {
      this.loading = true;
      this.error = null;
      const toast = useToast();
      try {
        return await updateResource<Employee>({
          endpoint: `/sanctum/employees/${id}`,
          payload,
          toast: useToast(),
          onSuccess: (data) => {
            const index = this.employees.findIndex((e) => e.id === data.id);
            if (index !== -1) this.employees[index] = data;
          },
        });
      } catch (err: any) {
        handleApiError(err, toast)
        // this.error = getErrorMessage(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Delete Employee ================== */
    async deleteEmployee(id: number) {
      this.loading = true;
      this.error = null;
      const toast = useToast();

      const index = this.employees.findIndex((e) => e.id === id);
      const backup = index !== -1 ? this.employees[index] : null;

      try {
        if (index !== -1) {
          this.employees.splice(index, 1);
          this.pagination.total -= 1;
        }

        await $fetch(`/sanctum/employees/${id}`, { method: 'DELETE' });

        toast.add({ title: 'تم حذف الموظف بنجاح', color: 'success' });
        return true;
      } catch (err: any) {
        if (backup && index !== -1) {
          this.employees.splice(index, 0, backup);
          this.pagination.total += 1;
        }

        handleApiError(err, toast)
        // this.error = getErrorMessage(err);
        // toast.add({ title: this.error, color: 'error' });
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /* ================== Local State Management ================== */
    setEmployees(payload: PaginatedResponse<Employee>) {
      this.employees = payload.data;
      this.pagination = payload.pagination;
    },

    addEmployee(employee: Employee) {
      this.employees.unshift(employee);
      this.pagination.total += 1;
    },

    removeEmployee(id: number | string) {
      const index = this.employees.findIndex((e) => e.id === id);
      if (index !== -1) {
        this.employees.splice(index, 1);
        this.pagination.total -= 1;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
