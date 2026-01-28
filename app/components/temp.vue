<script setup lang="ts" generic="T">
import def from "~/assets/images/default-user.webp";

/**
 * =========================================================
 * Imports
 * =========================================================
 * h                : لإنشاء VNode ديناميكي (خاصة للهيدر و الخلايا)
 * resolveComponent : للوصول إلى مكونات Nuxt UI بشكل ديناميكي
 * computed, watch  : لإدارة الحالة التفاعلية
 */
import { h, resolveComponent, computed, watch } from "vue";
import { useClipboard } from "@vueuse/core";
// type pageCol = {
//   left?: string[];
//   right?: string[];
// }

/**
 * Column / ColumnDef
 * ------------------
 * أنواع أساسية من TanStack Table
 * Column     : يمثل عموداً فعلياً داخل الجدول (runtime)
 * ColumnDef  : تعريف العمود (configuration)
 */
import type { Column } from "@tanstack/vue-table";
import type { ColumnDef } from "@tanstack/vue-table";
import type { TableColumn, TableRow, DropdownMenuItem } from "@nuxt/ui";
import { refDebounced } from "@vueuse/core";
/**
 * أنواع مخصصة للمشروع
 * ------------------
 * DataTableColumn : امتداد لتعريف العمود مع خصائص إضافية
 * StatusConfig    : تعريف شكل و لون و اسم الحالة
 */
import type { StatusConfig } from "../types/table";

/**
 * TableMeta
 * ---------
 * يسمح بتمرير بيانات إضافية (context) للجدول
 * مثل permissions أو callbacks
 */
import type { TableMeta } from "@tanstack/table-core";
import type { Employee } from "~/types/employee";
import type { Department } from "~/types/deparment";
// import type { Employee } from "~/pages/about.vue";

/**
 * =========================================================
 * Resolve UI Components
 * =========================================================
 * نستخدم resolveComponent لتفادي import مباشر
 * وتحسين التوافق مع Nuxt Auto Imports
 */
const UBadge = resolveComponent("UBadge");

/* =========================================================
   Props (مدخلات المكون)
========================================================= */
const props = defineProps<{
  /**
   * تعريف الأعمدة (TanStack ColumnDef)
   */
  columns: ColumnDef<any>[];

  /**
   * بيانات الصفوف
   */
  data: T[];

  /**
   * إجمالي عدد العناصر (للباجينيشن)
   */
  total: number;

  /**
   * خريطة حالات (status => label + color)
   * تستخدم لعرض Badge بدلاً من نص عادي
   */
  statusMap?: Record<string, StatusConfig>;

  /**
   * أعمدة مسموح لها بالفلاتر
   */
  filterableColumns?: string[];

  /**
   * عمود البحث السريع
   */
  searchColumn?: string;

  /**
   * الأعمدة التي يمكن تثبيتها (Pin)
   */
  pinnableColumnsleft?: string[];
  pinnableColumnsRight?: string[];

  /**
   * الصفحة الحالية
   */
  page: number;

  /**
   * عدد العناصر في الصفحة
   */
  pageSize: number;

  /**
   * الخيارات المتاحة لحجم الصفحة
   */
  pageSizes?: number[];

  /**
   * التحكم الابتدائي في إظهار/إخفاء الأعمدة
   */
  initialVisibility?: Record<string, boolean>;

  /**
   * Meta data للجدول (صلاحيات – callbacks – flags)
   */
  meta?: TableMeta<T>;

  /**
   * حالة الفرز
   */
  sorting?: any[];

  /**
   * فلتر البحث العام
   */
  globalFilter?: string;
  titleBtnCreate: string;
  titleBtnEdit: string;
  linkPageAdd?: string;

  /**
   * فلاتر الأعمدة
   */
  columnFilters?: any[];

  /**
   * حالة التحميل
   */
  loading?: boolean;
}>();

/* =========================================================
   Emits (الأحداث الخارجة)
========================================================= */
const emit = defineEmits<{
  /**
   * فلترة عمود محدد
   */
  (e: "filter", payload: { column: string; value: any }): void;

  /**
   * تغيير الصفحة
   */
  (e: "update:page", value: number): void;

  /**
   * تغيير حجم الصفحة
   */
  (e: "update:pageSize", value: number): void;
  (e: "update:data", payload: { title: string; row?: any }): void;
  (e: "delete:row", value: number): void;
  (e: "view:row", value: number): void;

  /**
   * تحديث حالة الفرز
   */
  (e: "update:sorting", value: any): void;

  /**
   * تحديث البحث العام
   */
  (e: "update:globalFilter", value: any): void;

  /**
   * تحديث فلاتر الأعمدة
   */
  (e: "update:columnFilters", value: any): void;

  (e: "drower:open", payload: { title: string; row?: any }): void;
}>();

/* =========================================================
   Table State (الحالة الداخلية للجدول)
========================================================= */

/**
 * مرجع لمكون UTable
 * يسمح بالوصول إلى tableApi
 */
const tableRef = useTemplateRef("table");

/**
 * التحكم في إظهار/إخفاء الأعمدة
 * - إذا لم يتم تمرير initialVisibility
 * - يتم الاعتماد على meta.hiddenByDefault
 */
const columnVisibility = ref(
  props.initialVisibility ??
  Object.fromEntries(
    props.columns.map((c) => [c.id!, !(c.meta as any)?.hiddenByDefault]),
  ),
);

/**
 * تثبيت الأعمدة (Pinning)
 * - إما من props
 * - أو من meta.pinnable
 */
const columnPinning = ref({
  left:
    props.pinnableColumnsleft ??
    props.columns.filter((c) => (c.meta as any)?.pinnable).map((c) => c.id!),
  right:
    props.pinnableColumnsRight ??
    props.columns.filter((c) => (c.meta as any)?.pinnable).map((c) => c.id!),
});

/**
 * حالة الفرز (Reactive)
 */
const sorting = ref(props.sorting ?? []);

/**
 * الفلتر العام
 */
const globalFilter = ref(props.globalFilter ?? "");

/**
 * فلاتر الأعمدة
 */
const columnFilters = ref(props.columnFilters ?? []);

/* =========================================================
   Watchers (مزامنة الحالة مع props)
========================================================= */

/**
 * عند تغيير حجم الصفحة من الخارج
 * يتم تحديث TanStack Table مباشرة
 */
watch(
  () => props.pageSize,
  (size) => {
    tableRef.value?.tableApi?.setPageSize(size);
  },
);

/**
 * مزامنة الفرز
 */
watch(
  () => props.sorting,
  (val) => {
    sorting.value = val ?? [];
  },
);

/**
 * مزامنة البحث العام
 */
watch(
  () => props.globalFilter,
  (val) => {
    globalFilter.value = val ?? "";
  },
);

/**
 * مزامنة فلاتر الأعمدة
 */
watch(
  () => props.columnFilters,
  (val) => {
    columnFilters.value = val ?? [];
  },
);

/* =========================================================
   Helpers (دوال مساعدة)
========================================================= */

/**
 * statusCell
 * ----------
 * - يحول قيمة الحالة إلى Badge
 * - يعتمد على statusMap
 */
function statusCell(value: unknown) {
  // console.log("value");
  // console.log(value);
  if (typeof value !== "string") return value;

  const cfg = props.statusMap?.[value];
  if (!cfg) return value;

  return h(UBadge, { color: cfg.color, variant: "soft" }, () => cfg.label);
}

/**
 * getHeader
 * ---------
 * Header تفاعلي مع Dropdown
 * - فرز تصاعدي
 * - فرز تنازلي
 * - إلغاء الفرز
 */
function getHeader(column: Column<T>, label: string) {
  const isSorted = column.getIsSorted();

  return h(
    "UDropdownMenu",
    {
      content: { align: "start" },
      items: [
        {
          label: "Asc",
          type: "checkbox",
          checked: isSorted === "asc",
          onSelect: () =>
            isSorted === "asc"
              ? column.clearSorting()
              : column.toggleSorting(false),
        },
        {
          label: "Desc",
          type: "checkbox",
          checked: isSorted === "desc",
          onSelect: () =>
            isSorted === "desc"
              ? column.clearSorting()
              : column.toggleSorting(true),
        },
      ],
    },
    () =>
      h("UButton", {
        variant: "ghost",
        label,
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up"
            : "i-lucide-arrow-down"
          : "i-lucide-arrow-up-down",
      }),
  );
}

/**
 * getHeaderPin
 * ------------
 * زر لتثبيت أو فك تثبيت العمود
 */

function resolveObjectValue(value: unknown, key?: string) {
  if (!value || typeof value !== "object" || !key) return "";

  return (value as any)[key] ?? "";
}

const anchor = ref({ x: 0, y: 0 });

const reference = computed(() => ({
  getBoundingClientRect: () =>
    ({
      width: 0,
      height: 0,
      left: anchor.value.x,
      right: anchor.value.x,
      top: anchor.value.y,
      bottom: anchor.value.y,
      ...anchor.value,
    }) as DOMRect,
}));

const selectedRow = ref<TableRow<Employee> | null>(null);
const open = ref(false);
const openDebounced = refDebounced(open, 50);

function onHover(_e: Event, row: TableRow<Employee> | null) {
  selectedRow.value = row;

  open.value = !!row;
}

const toast = useToast();
const { copy } = useClipboard();

function getDropdownActions(row: Department): DropdownMenuItem[][] {
  return [
    [
      {
        label: "Copy user Id",
        icon: "i-lucide-copy",
        onSelect: () => {
          copy(row.id.toString());

          toast.add({
            title: "User ID copied to clipboard!",
            color: "success",
            icon: "i-lucide-circle-check",
          });
        },
      },
    ],
    [
      {
        label: "View",
        icon: "i-lucide-eye",
        onSelect: () => emit("view:row", row.id),
      },
      {
        label: "Edit",
        icon: "i-lucide-edit",
        onSelect: () =>
          emit("update:data", {
            title: props.titleBtnEdit,
            row: row, // أو row.original إذا تريد الصف بالكامل
          }),
      },
      {
        label: "Delete",
        icon: "i-lucide-trash",
        color: "error",
        onSelect: () => emit("delete:row", row.id),
      },
    ],
  ];
}
</script>

<template>
  <div class="flex flex-col w-full">
    <!-- Toolbar -->
    <div class="flex gap-2 px-4 pb-3 justify-between border-default">
      <!-- Page Size -->
      <div class="flex gap-2">
        <USelect :model-value="pageSize" :items="pageSizes ?? [15, 20, 50]" class="w-24"
          @update:model-value="emit('update:pageSize', $event)" />

        <!-- Columns Visibility -->
        <UDropdownMenu :items="tableRef?.tableApi
            ?.getAllColumns()
            .filter((c) => c.getCanHide())
            .map((c) => ({
              type: 'checkbox',
              label: c.columnDef.meta?.label ?? String(c.id),
              checked: c.getIsVisible(),
              onUpdateChecked: (v) =>
                tableRef?.tableApi?.getColumn(c.id)?.toggleVisibility(v),
            }))
          ">
          <UButton label="الأعمدة" variant="outline" color="neutral" />
        </UDropdownMenu>

        <!-- Column Filter -->
        <UInput v-if="searchColumn" placeholder="Search..." @update:model-value="
          emit('filter', { column: searchColumn, value: $event })
          " />

        <!-- Global Filter -->
        <UInput v-model="globalFilter" placeholder="البحث بالاسم أو ال id ..."
          @update:model-value="emit('update:globalFilter', $event)" />
      </div>
      <div>
        <template v-if="linkPageAdd">
          <!-- إذا كان هناك رابط -->
          <NuxtLink :to="linkPageAdd">
            <UButton :label="titleBtnCreate" variant="outline" color="neutral"
              icon="material-symbols:group-add-outline-rounded" />
          </NuxtLink>
        </template>
        <template v-else>
          <!-- إذا لم يكن هناك رابط -->
          <UButton :label="titleBtnCreate" variant="outline" color="neutral"
            icon="material-symbols:group-add-outline-rounded" @click="emit('drower:open', { title: titleBtnCreate })" />
        </template>
      </div>
    </div>

    <ClientOnly>
      <div class="flex w-full flex-1 gap-1">
        <!-- Table -->
        <UTable ref="table" class="flex-1 max-h-135" sticky :loading="props.loading" loading-color="primary"
          loading-animation="carousel" :ui="{
            thead: 'head-table',
            tr: 'hover-Poper',
          }" :columns="columns" :data="data" :meta="meta" v-model:column-visibility="columnVisibility"
          v-model:column-pinning="columnPinning" v-model:sorting="sorting" v-model:column-filters="columnFilters"
          @sort="emit('update:sorting', $event)" @update:global-filter="emit('update:globalFilter', $event)"
          @update:column-filters="emit('update:columnFilters', $event)" @pointermove="
            (ev: PointerEvent) => {
              anchor.x = ev.clientX;
              anchor.y = ev.clientY;
            }
          " @hover="onHover">
          <!-- Dynamic Slots for Custom Cells -->
          <template v-for="col in columns" :key="col.id" #[`${col.id}-cell`]="{ getValue, row }">
            <!-- Status -->
            <component v-if="col.meta?.type === 'status'" :is="statusCell(getValue())" />

            <div class="flex items-center gap-1" v-else-if="col.id === 'full_name'">
              <!-- :src="def" -->
              <UAvatar :icon="row.original.status === 'active'
                  ? 'material-symbols-light:account-circle-outline'
                  : 'material-symbols-light:no-accounts-outline'
                " size="md" :alt="`${row.original.full_name} avatar`" :ui="{
                  root: 'p-0 bg-transparent',
                  icon:
                    row.original.status === 'active'
                      ? 'w-full h-full bg-info' /* إذا كان active استخدم أخضر */
                      : 'w-full h-full bg-error' /* إذا غير active استخدم info */,
                }" />
              <div>
                <!-- <img :src="def" alt=""> -->
                <p class="font-medium text-highlighted">
                  {{ row.original.full_name }}
                </p>
                <!-- <p>
              {{ row.original.position }}
            </p> -->
              </div>
            </div>
            <div class="flex items-center gap-1" v-else-if="col.id === 'location_ar'">
              <!-- <img :src="def" alt=""> -->
              <UIcon name="material-symbols:location-on-outline-rounded" class="size-5 bg-info/70" />
              {{ row.original.location_ar }}
              <!-- <p>
              {{ row.original.position }}
            </p> -->
            </div>

            <UDropdownMenu v-else-if="col.id === 'action'" :items="getDropdownActions(row.original)" :content="{
              align: 'center',
              side: 'left',
              sideOffset: 0,
            }" :ui="{
                content: 'w-24',
              }">
              <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Actions" />
            </UDropdownMenu>

            <!-- Object (branch, department, etc) -->
            <span v-else-if="col.meta?.type === 'object'">
              {{ resolveObjectValue(getValue(), col.meta?.valueKey) }}
            </span>

            <!-- Default -->
            <slot v-else :name="`${col.id}-cell`" :getValue="getValue">
              {{ getValue() }}
            </slot>
          </template>
        </UTable>

        <UPopover :content="{
          side: 'top',
          sideOffset: 16,
          updatePositionStrategy: 'always',
        }" :open="openDebounced" :reference="reference" :ui="{ arrow: 'hover-Poper' }">
          <template #content>
            <!-- <div class="p-4">
              {{ selectedRow?.original?.id }}
            </div> -->
          </template>
        </UPopover>
      </div>
    </ClientOnly>
    <!-- Pagination -->
    <div class="px-4 pt-4 border-t border-default">
      <UPagination :page="page" :items-per-page="pageSize" :total="total" @update:page="emit('update:page', $event)" />
    </div>
  </div>
</template>

<style>
.head-table::after {
  height: 2px !important;
}

/* .hover-Poper:hover {
    background-color: rgb(225, 224, 224) !important;
} */
</style>





<script setup lang="ts" generic="T">
import def from "~/assets/images/default-user.webp";

/**
 * =========================================================
 * Imports
 * =========================================================
 */
import { h, resolveComponent, computed, watch, ref } from "vue";
import { useClipboard, refDebounced } from "@vueuse/core";
import type { Column } from "@tanstack/vue-table";
import type { ColumnDef } from "@tanstack/vue-table";
import type { TableColumn, TableRow, DropdownMenuItem } from "@nuxt/ui";
import type { StatusConfig } from "../types/table";
import type { TableMeta } from "@tanstack/table-core";
import type { Employee } from "~/types/employee";
import type { Department } from "~/types/deparment";

/**
 * =========================================================
 * Resolve UI Components
 * =========================================================
 */
const UBadge = resolveComponent("UBadge");

/* =========================================================
   Props
========================================================= */
const props = defineProps<{
  columns: ColumnDef<any>[];
  data: T[];
  total: number;
  statusMap?: Record<string, StatusConfig>;
  filterableColumns?: string[];
  searchColumn?: string;
  pinnableColumnsleft?: string[];
  pinnableColumnsRight?: string[];
  page: number;
  pageSize: number;
  pageSizes?: number[];
  initialVisibility?: Record<string, boolean>;
  meta?: TableMeta<T>;
  sorting?: any[];
  globalFilter?: string;
  titleBtnCreate: string;
  titleBtnEdit: string;
  linkPageAdd?: string;
  columnFilters?: any[];
  loading?: boolean;
}>();

/* =========================================================
   Emits
========================================================= */
const emit = defineEmits<{
  (e: "filter", payload: { column: string; value: any }): void;
  (e: "update:page", value: number): void;
  (e: "update:pageSize", value: number): void;
  (e: "update:data", payload: { title: string; row?: any }): void;
  (e: "delete:row", value: number): void;
  (e: "view:row", value: number): void;
  (e: "update:sorting", value: any): void;
  (e: "update:globalFilter", value: any): void;
  (e: "update:columnFilters", value: any): void;
  (e: "drower:open", payload: { title: string; row?: any }): void;
}>();

/* =========================================================
   Table State
========================================================= */
const tableRef = useTemplateRef("table");

const columnVisibility = ref<Record<string, boolean>>(
  props.initialVisibility ??
    Object.fromEntries(
      props.columns.map((c: ColumnDef<any>) => [c.id!, !(c.meta as any)?.hiddenByDefault])
    )
);

const columnPinning = ref({
  left:
    props.pinnableColumnsleft ??
    props.columns
      .filter((c: ColumnDef<any>) => (c.meta as any)?.pinnable)
      .map((c: ColumnDef<any>) => c.id!),
  right:
    props.pinnableColumnsRight ??
    props.columns
      .filter((c: ColumnDef<any>) => (c.meta as any)?.pinnable)
      .map((c: ColumnDef<any>) => c.id!),
});


const sorting = ref(props.sorting ?? []);
const globalFilter = ref(props.globalFilter ?? "");
const columnFilters = ref(props.columnFilters ?? []);

/* =========================================================
   Watchers
========================================================= */
watch(() => props.pageSize, (size) => {
  tableRef.value?.tableApi?.setPageSize(size);
});

watch(() => props.sorting, (val) => {
  sorting.value = val ?? [];
});

watch(() => props.globalFilter, (val) => {
  globalFilter.value = val ?? "";
});

watch(() => props.columnFilters, (val) => {
  columnFilters.value = val ?? [];
});

/* =========================================================
   Helpers
========================================================= */
function statusCell(value: unknown) {
  if (typeof value !== "string") return value;

  const cfg = props.statusMap?.[value];
  if (!cfg) return value;

  return h(UBadge, { color: cfg.color, variant: "soft" }, () => cfg.label);
}

function getHeader(column: Column<T>, label: string) {
  const isSorted = column.getIsSorted();

  return h(
    "UDropdownMenu",
    {
      content: { align: "start" },
      items: [
        {
          label: "Asc",
          type: "checkbox",
          checked: isSorted === "asc",
          onSelect: () =>
            isSorted === "asc" ? column.clearSorting() : column.toggleSorting(false),
        },
        {
          label: "Desc",
          type: "checkbox",
          checked: isSorted === "desc",
          onSelect: () =>
            isSorted === "desc" ? column.clearSorting() : column.toggleSorting(true),
        },
      ],
    },
    () =>
      h("UButton", {
        variant: "ghost",
        label,
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up"
            : "i-lucide-arrow-down"
          : "i-lucide-arrow-up-down",
      })
  );
}

function resolveObjectValue(value: unknown, key?: string) {
  if (!value || typeof value !== "object" || !key) return "";
  return (value as any)[key] ?? "";
}

const anchor = ref({ x: 0, y: 0 });

const reference = computed(() => ({
  getBoundingClientRect: () =>
    ({
      width: 0,
      height: 0,
      left: anchor.value.x,
      right: anchor.value.x,
      top: anchor.value.y,
      bottom: anchor.value.y,
      ...anchor.value,
    }) as DOMRect,
}));

const selectedRow = ref<TableRow<Employee> | null>(null);
const open = ref(false);
const openDebounced = refDebounced(open, 50);

function onHover(_e: Event, row: TableRow<Employee> | null) {
  selectedRow.value = row;
  open.value = !!row;
}

const toast = useToast();
const { copy } = useClipboard();

function getDropdownActions(row: Department): DropdownMenuItem[][] {
  return [
    [
      {
        label: "Copy user Id",
        icon: "i-lucide-copy",
        onSelect: () => {
          copy(row.id.toString());
          toast.add({
            title: "User ID copied to clipboard!",
            color: "success",
            icon: "i-lucide-circle-check",
          });
        },
      },
    ],
    [
      {
        label: "View",
        icon: "i-lucide-eye",
        onSelect: () => emit("view:row", row.id),
      },
      {
        label: "Edit",
        icon: "i-lucide-edit",
        onSelect: () =>
          emit("update:data", {
            title: props.titleBtnEdit,
            row: row,
          }),
      },
      {
        label: "Delete",
        icon: "i-lucide-trash",
        color: "error",
        onSelect: () => emit("delete:row", row.id),
      },
    ],
  ];
}
</script>
