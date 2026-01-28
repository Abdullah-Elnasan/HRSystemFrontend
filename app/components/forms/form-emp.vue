<script setup lang="ts">
  import { employeeSchema } from "~/schemas/employees.schema";
  import type { EmployeeForm } from "~/types/employee";
  import type { Field } from "~/components/generic-form.vue";
  import { useFormModel } from "~/composables/useFormModel";
  import { CalendarDate } from "@internationalized/date";
  import { fetchDepartmentsList, fetchBranchesList } from "~/service/fetchSelectOptions";

  /* ================== Props / Emits ================== */

  const props = defineProps<{
    modelValue: EmployeeForm;
    mode?: "create" | "edit";
    loading?: boolean;
    columns?: 1 | 2 | 3 | 4;
  }>();

  const emit = defineEmits<{
    (e: "update:modelValue", v: EmployeeForm): void;
    (e: "submit", v: EmployeeForm): void;
  }>();

  const model = useFormModel(toRef(props, "modelValue"), emit);

  /* ================== Birth Date Handling ================== */

  const birthDateCalendar = computed({
    get: (): CalendarDate => {
      if (model.value.birth_date) {
        const parts = model.value.birth_date.split("-");
        if (parts.length === 3) {
          const year = Number(parts[0]);
          const month = Number(parts[1]);
          const day = Number(parts[2]);
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            return new CalendarDate(year, month, day);
          }
        }
      }
      return new CalendarDate(2000, 1, 1);
    },
    set: (value: CalendarDate) => {
      model.value.birth_date = value.toString(); // "YYYY-MM-DD"
    },
  });

  /* ================== Select Data ================== */

  const departmentItems = ref<any[]>([]);
  const branchItems = ref<any[]>([]);
  const loadingDepartments = ref(false);
  const loadingBranches = ref(false);

  // جلب القوائم الأولية
  const fetchDepartments = async (searchQuery?: string) => {
    loadingDepartments.value = true;
    try {
      console.log("[fetchDepartments] Starting fetch...");
      const data = await fetchDepartmentsList(searchQuery);
      console.log("[fetchDepartments] Data received:", data.length, "items", data.slice(0, 2));
      departmentItems.value = data;
      console.log("[fetchDepartments] departmentItems.value updated:", departmentItems.value.length);
    } catch (error) {
      console.error("Error fetching departments:", error);
      departmentItems.value = [];
    } finally {
      loadingDepartments.value = false;
    }
  };

  const fetchBranches = async (searchQuery?: string) => {
    loadingBranches.value = true;
    try {
      console.log("[fetchBranches] Starting fetch...");
      const data = await fetchBranchesList(searchQuery);
      console.log("[fetchBranches] Data received:", data.length, "items", data.slice(0, 2));
      branchItems.value = data;
      console.log("[fetchBranches] branchItems.value updated:", branchItems.value.length);
    } catch (error) {
      console.error("Error fetching branches:", error);
      branchItems.value = [];
    } finally {
      loadingBranches.value = false;
    }
  };

  // جلب البيانات عند التحميل
  onMounted(async () => {
    console.log("EmployeeForm: Mounted, fetching data...");
    // استدعاء متسلسل بدلاً من متوازي لتجنب أي مشاكل في الكاش
    await fetchDepartments();
    console.log("EmployeeForm: Departments fetched", departmentItems.value.length, departmentItems.value[0]);
    // تأخير صغير بين الاستدعاءات
    await new Promise(resolve => setTimeout(resolve, 100));
    await fetchBranches();
    console.log("EmployeeForm: Branches fetched", branchItems.value.length, branchItems.value[0]);
    console.log("EmployeeForm: Data fetched", {
      departments: departmentItems.value.length,
      branches: branchItems.value.length
    });

    // عند التعديل، تأكد من وجود القيمة المحددة في القائمة
    if (props.mode === "edit") {
      // إذا كان department_id موجود ولكن ليس في القائمة، أضفه
      if (model.value.department_id && !departmentItems.value.find(d => d.id === model.value.department_id)) {
        // جلب القسم المحدد إذا لم يكن في القائمة
        try {
          const allDepartments = await fetchDepartmentsList();
          const selectedDept = allDepartments.find(d => d.id === model.value.department_id);
          if (selectedDept) {
            departmentItems.value = [selectedDept, ...departmentItems.value];
          }
        } catch (error) {
          console.error("Error fetching selected department:", error);
        }
      }

      // إذا كان branch_id موجود ولكن ليس في القائمة، أضفه
      if (model.value.branch_id && !branchItems.value.find(b => b.id === model.value.branch_id)) {
        // جلب الفرع المحدد إذا لم يكن في القائمة
        try {
          const allBranches = await fetchBranchesList();
          const selectedBranch = allBranches.find(b => b.id === model.value.branch_id);
          if (selectedBranch) {
            branchItems.value = [selectedBranch, ...branchItems.value];
          }
        } catch (error) {
          console.error("Error fetching selected branch:", error);
        }
      }
    }
  });

  // مراقبة التغييرات في modelValue لإضافة القيم المحددة عند التعديل
  watch(
    () => props.modelValue,
    async (newValue) => {
      if (props.mode === "edit") {
        // تأكد من وجود department_id في القائمة
        if (newValue.department_id && !departmentItems.value.find(d => d.id === newValue.department_id)) {
          try {
            const allDepartments = await fetchDepartmentsList();
            const selectedDept = allDepartments.find(d => d.id === newValue.department_id);
            if (selectedDept) {
              departmentItems.value = [selectedDept, ...departmentItems.value];
            }
          } catch (error) {
            console.error("Error fetching selected department:", error);
          }
        }

        // تأكد من وجود branch_id في القائمة
        if (newValue.branch_id && !branchItems.value.find(b => b.id === newValue.branch_id)) {
          try {
            const allBranches = await fetchBranchesList();
            const selectedBranch = allBranches.find(b => b.id === newValue.branch_id);
            if (selectedBranch) {
              branchItems.value = [selectedBranch, ...branchItems.value];
            }
          } catch (error) {
            console.error("Error fetching selected branch:", error);
          }
        }
      }
    },
    { immediate: true, deep: true }
  );

  /* ================== Fields ================== */

  const fields = reactive<Field<EmployeeForm>[]>([
    {
      name: "first_name",
      label: "الاسم الأول",
      colSpan: 1,
    },
    {
      name: "last_name",
      label: "اسم العائلة",
      colSpan: 1,
    },
    {
      name: "pin",
      label: "الرقم التعريفي",
      colSpan: 1,
      componentProps: { type: "number" },
    },
    {
      name: "national_id",
      label: "الرقم الوطني",
      colSpan: 1,
    },
    {
      name: "phone",
      label: "رقم الهاتف",
      colSpan: 1,
    },
    {
      name: "email",
      label: "البريد الإلكتروني",
      colSpan: 1,
      componentProps: { type: "email" },
    },
    {
      name: "position",
      label: "المسمى الوظيفي",
      colSpan: 1,
    },
    /* ================== Department ================== */
    {
      name: "department_id",
      label: "القسم",
      colSpan: 1,
      component: "select-menu",
      searchable: true,
      items: [],
      searchApi: async (q: string) => {
        const results = await fetchDepartmentsList(q);
        // تحديث departmentItems بالنتائج الجديدة
        if (q && q.trim() !== "") {
          departmentItems.value = results;
        }
        return results;
      },
      componentProps: computed(() => ({
        items: departmentItems.value,
        valueKey: "id",
        labelKey: "name_ar",
        placeholder: "اختر القسم",
        icon: "lucide:folder-tree",
      })),
    },
    /* ================== Branch ================== */
    {
      name: "branch_id",
      label: "الفرع",
      colSpan: 1,
      component: "select-menu",
      searchable: true,
      items: [],
      searchApi: async (q: string) => {
        const results = await fetchBranchesList(q);
        // تحديث branchItems بالنتائج الجديدة
        if (q && q.trim() !== "") {
          branchItems.value = results;
        }
        return results;
      },
      componentProps: computed(() => ({
        items: branchItems.value,
        valueKey: "id",
        labelKey: "name_ar",
        placeholder: "اختر الفرع",
        icon: "gravity-ui:branches-down",
      })),
    },
    /* ================== Birth Date ================== */
    {
      name: "birth_date",
      label: "تاريخ الميلاد",
      colSpan: 1,
      component: "custom",
    },
    /* ================== Image ================== */
    {
      name: "image",
      label: "صورة الموظف",
      colSpan: 2,
      component: "file",
      componentProps: {
        icon: "i-lucide-image",
        description: "PNG, JPG, WEBP (max 2MB)",
        accept: "image/png,image/jpeg,image/jpg,image/webp",
        class: "w-full min-h-48",
      },
    },
  ]);

  // تحديث items في fields عند تحديث departmentItems و branchItems
  watch(departmentItems, (newItems) => {
    console.log("EmployeeForm: departmentItems updated", newItems.length);
    const field = fields.find((f) => f.name === "department_id");
    if (field) {
      field.items = [...newItems];
      console.log("EmployeeForm: field.items updated", field.items.length);
    }
  }, { immediate: true });

  watch(branchItems, (newItems) => {
    console.log("EmployeeForm: branchItems updated", newItems.length);
    const field = fields.find((f) => f.name === "branch_id");
    if (field) {
      field.items = [...newItems];
      console.log("EmployeeForm: field.items updated", field.items.length);
    }
  }, { immediate: true });

  /* ================== Expose ================== */

  const formRef = ref<{ submit: () => void } | null>(null);

  defineExpose({
    submit: () => formRef.value?.submit(),
  });
  </script>

  <template>
    <ClientOnly>
      <GenericForm
        ref="formRef"
        v-model="model"
        :schema="employeeSchema"
        :fields="fields"
        :loading="loading"
        :columns="props.columns"
        :select-loading="{
          department_id: loadingDepartments,
          branch_id: loadingBranches,
        }"
        @submit="emit('submit', $event)"
        dir="rtl"
      >
        <!-- Custom slot for birth_date -->
        <template #field-birth_date="{ model: slotModel }">
          <UInputDate v-model="birthDateCalendar">
            <template #trailing>
              <UPopover>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  icon="i-lucide-calendar"
                  aria-label="Select a date"
                  class="px-0"
                />
                <template #content>
                  <UCalendar v-model="birthDateCalendar" class="p-2" />
                </template>
              </UPopover>
            </template>
          </UInputDate>
        </template>
      </GenericForm>
    </ClientOnly>
  </template>

