<script setup lang="ts" generic="T extends { id: number }">
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
  titleBtnIcon: string;
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
      props.columns.map((c: ColumnDef<any>) => [
        c.id!,
        !(c.meta as any)?.hiddenByDefault,
      ]),
    ),
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
watch(
  () => props.pageSize,
  (size) => {
    tableRef.value?.tableApi?.setPageSize(size);
  },
);

watch(
  () => props.sorting,
  (val) => {
    sorting.value = val ?? [];
  },
);

watch(
  () => props.globalFilter,
  (val) => {
    globalFilter.value = val ?? "";
  },
);

watch(
  () => props.columnFilters,
  (val) => {
    columnFilters.value = val ?? [];
  },
);

/* =========================================================
   Helpers
========================================================= */
function statusCell(value: unknown) {
  console.log(value);
  console.log(typeof value);

  // ✅ نحول boolean إلى string
  if (typeof value === "boolean") {
    value = String(value);
  }

  // بعد التحويل نتأكد أنه string
  if (typeof value !== "string") return value;

  const cfg = props.statusMap?.[value];
  if (!cfg) return value;

  return h(
    UBadge,
    { color: cfg.color, variant: "soft" },
    () => cfg.label
  );
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

function getDropdownActions(row: T): DropdownMenuItem[][] {
  return [
    [
      {
        label: "Copy ID",
        icon: "i-lucide-copy",
        onSelect: () => {
          copy(String(row.id));
          toast.add({
            title: "ID copied to clipboard!",
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
            row,
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
        <USelect
          :model-value="pageSize"
          :items="pageSizes ?? [10, 20, 50]"
          class="w-24"
          @update:model-value="emit('update:pageSize', $event)"
        />

        <!-- Columns Visibility -->
        <UDropdownMenu
          :items="
            tableRef?.tableApi
              ?.getAllColumns()
              .filter((c: Column<T>) => c.getCanHide())
              .map((c: Column<T>) => ({
                type: 'checkbox',
                label: c.columnDef.meta?.label ?? String(c.id),
                checked: c.getIsVisible(),
                onUpdateChecked: (v: boolean) =>
                  tableRef?.tableApi?.getColumn(c.id)?.toggleVisibility(v),
              }))
          "
        >
          <UButton label="الأعمدة" variant="outline" color="neutral" />
        </UDropdownMenu>

        <!-- Column Filter -->
        <UInput
          v-if="searchColumn"
          placeholder="Search..."
          @update:model-value="
            emit('filter', { column: searchColumn, value: $event })
          "
        />

        <!-- Global Filter -->
        <UInput
          v-model="globalFilter"
          placeholder="البحث بالاسم أو ال id ..."
          @update:model-value="emit('update:globalFilter', $event)"
        />
      </div>

      <div>
        <template v-if="linkPageAdd">
          <NuxtLink :to="linkPageAdd">
            <UButton
              :label="titleBtnCreate"
              variant="outline"
              color="neutral"
              :icon="titleBtnIcon"
            />
          </NuxtLink>
        </template>
        <template v-else>
          <UButton
            :label="titleBtnCreate"
            variant="outline"
            color="neutral"
            :icon="titleBtnIcon"
            @click="emit('drower:open', { title: titleBtnCreate })"
          />
        </template>
      </div>
    </div>

    <ClientOnly>
      <div class="flex w-full flex-1 gap-1">
        <UTable
          ref="table"
          class="flex-1 max-h-135"
          sticky
          :loading="props.loading"
          loading-color="primary"
          loading-animation="carousel"
          :ui="{ thead: 'head-table', tr: 'hover-Poper' }"
          :columns="columns"
          :data="data"
          :meta="meta"
          v-model:column-visibility="columnVisibility"
          v-model:column-pinning="columnPinning"
          v-model:sorting="sorting"
          v-model:column-filters="columnFilters"
          @sort="emit('update:sorting', $event)"
          @update:global-filter="emit('update:globalFilter', $event)"
          @update:column-filters="emit('update:columnFilters', $event)"
          @pointermove="
            (ev: PointerEvent) => {
              anchor.x = ev.clientX;
              anchor.y = ev.clientY;
            }
          "
          @hover="onHover"
        >
          <!-- Dynamic Slots for Custom Cells -->
          <template
            v-for="col in columns"
            :key="col.id"
            #[`${col.id}-cell`]="{ getValue, row }"
          >
            <component
              v-if="col.meta?.type === 'status'"
              :is="statusCell(getValue())"
            />

            <div
              class="flex items-center gap-1"
              v-else-if="col.id === 'full_name'"
            >
              <UAvatar
                :src="row.original.image || undefined"
                :icon="
                  !row.original.image
                    ? row.original.status === 'active'
                      ? 'material-symbols-light:account-circle-outline'
                      : 'material-symbols-light:no-accounts-outline'
                    : undefined
                "
                size="md"
                :alt="row.original.full_name"
                :ui="{
                  root: 'p-0 bg-transparent',
                  icon: !row.original.image
                    ? row.original.status === 'active'
                      ? 'w-full h-full bg-info'
                      : 'w-full h-full bg-error'
                    : '',
                }"
              />
              <div>
                <p class="font-medium text-highlighted">
                  {{ row.original.full_name }}
                </p>
                <p class="text-muted">{{ row.original.position }}</p>
              </div>
            </div>

            <div
              class="flex items-center gap-1"
              v-else-if="col.id === 'location_ar'"
            >
              <UIcon
                name="material-symbols:location-on-outline-rounded"
                class="size-5 bg-info/70"
              />
              {{ row.original.location_ar }}
            </div>

            <UDropdownMenu
              v-else-if="col.id === 'action'"
              :items="getDropdownActions(row.original)"
              :content="{ align: 'center', side: 'left', sideOffset: 0 }"
              :ui="{ content: 'w-24' }"
            >
              <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                aria-label="Actions"
              />
            </UDropdownMenu>

            <span v-else-if="col.meta?.type === 'object'">
              {{ resolveObjectValue(getValue(), col.meta?.valueKey) }}
            </span>

            <slot v-else :name="`${col.id}-cell`" :getValue="getValue">
              {{ getValue() }}
            </slot>
          </template>
        </UTable>

        <UPopover
          :content="{
            side: 'top',
            sideOffset: 16,
            updatePositionStrategy: 'always',
          }"
          :open="openDebounced"
          :reference="reference"
          :ui="{ arrow: 'hover-Poper' }"
        >
          <template #content></template>
        </UPopover>
      </div>
    </ClientOnly>

    <div class="px-4 pt-4 border-t border-default">
      <UPagination
        :page="page"
        :items-per-page="pageSize"
        :total="total"
        @update:page="emit('update:page', $event)"
      />
    </div>
  </div>
</template>

<style>
.head-table::after {
  height: 2px !important;
}
</style>
