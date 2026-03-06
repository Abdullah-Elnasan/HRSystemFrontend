<script setup lang="ts" generic="T extends { id: number }">
/**
 * =========================================================
 * @component   DataTable
 * @description Advanced, fully customizable data table with
 *              filtering, sorting, pagination, and per-row
 *              actions.
 * @generic     T – Row type; must include a numeric `id`.
 * =========================================================
 */

// ─── Libraries ───────────────────────────────────────────
import { h, resolveComponent, computed, watch, ref } from "vue";
import { useClipboard, refDebounced } from "@vueuse/core";
import type { Column, ColumnDef, TableMeta } from "@tanstack/vue-table";
import type { TableRow, DropdownMenuItem } from "@nuxt/ui";
import type { StatusConfig, TableActionsConfig } from "../types/table";
import type { Employee } from "~/types/employee";

// ─── Nuxt UI components resolved at runtime ──────────────
const UBadge = resolveComponent("UBadge");

// =========================================================
// Props
// =========================================================

const props = withDefaults(
  defineProps<{
    /** Column definitions (TanStack Table spec) */
    columns: ColumnDef<any>[];
    /** Row dataset provided by the parent */
    data: T[];
    /** Total record count used for pagination */
    total: number;
    /** Maps a status string → Badge color & label */
    statusMap?: Record<string, StatusConfig>;
    /** IDs of columns that support individual filtering */
    filterableColumns?: string[];
    /** Column ID used by the targeted search input */
    searchColumn?: string;
    /** Show or hide the global search input */
    searchTable?: boolean;
    /** Column IDs pinned to the left edge */
    pinnableColumnsleft?: string[];
    /** Column IDs pinned to the right edge */
    pinnableColumnsRight?: string[];
    /** Current active page number (1-based) */
    page: number;
    /** Number of rows displayed per page */
    pageSize: number;
    /** Selectable page-size options */
    pageSizes?: number[];
    /** Initial column visibility map – { column_id: boolean } */
    initialVisibility?: Record<string, boolean>;
    /** Extra meta forwarded to TanStack Table */
    meta?: TableMeta<T>;
    /** Current sort state */
    sorting?: any[];
    /** Current global filter string */
    globalFilter?: string;
    /** Show or hide the floating create button */
    btnCreate?: boolean;
    /** Label shown on hover over the FAB */
    titleBtnCreate: string;
    /** Icon for the FAB */
    titleBtnIcon: string;
    /** Drawer title used when editing a record */
    titleBtnEdit: string;
    /** External route for the add page (skips the Drawer) */
    linkPageAdd?: string;
    /** Current per-column filter values */
    columnFilters?: any[];
    /** Toggles the table loading skeleton */
    loading?: boolean;
    /** Action config per row (copy / view / edit / delete) */
    actions?: TableActionsConfig;
    /** Whether clicking a row fires the row-click handler */
    rowClickable?: boolean;
    /** Optional callback invoked on row click */
    onRowClick?: (row: T) => void;
  }>(),
  {
    searchTable: true,
    btnCreate: true,
  },
);

// =========================================================
// Emits
// =========================================================

const emit = defineEmits<{
  /** A column-level filter was applied */
  (e: "filter", payload: { column: string; value: any }): void;
  /** Active page number changed */
  (e: "update:page", value: number): void;
  /** Page size selection changed */
  (e: "update:pageSize", value: number): void;
  /** A record was created or edited via the Drawer */
  (e: "update:data", payload: { title: string; row?: any }): void;
  /** User requested deletion of a record */
  (e: "delete:row", value: number): void;
  /** User requested viewing a record's details */
  (e: "view:row", value: number): void;
  /** Sort state changed */
  (e: "update:sorting", value: any): void;
  /** Global filter string changed */
  (e: "update:globalFilter", value: any): void;
  /** Column filter values changed */
  (e: "update:columnFilters", value: any): void;
  /** Drawer should open with the given title and optional row */
  (e: "drower:open", payload: { title: string; row?: any }): void;
  /** A row was clicked – for external listeners */
  (e: "row:click", row: T): void;
}>();

// =========================================================
// Internal Table State
// =========================================================

/** Template ref to UTable – exposes the underlying tableApi */
const tableRef = useTemplateRef("table");

/**
 * Column visibility map.
 * Prefers `initialVisibility` prop; falls back to each column's
 * `meta.hiddenByDefault` flag.
 */
const columnVisibility = ref<Record<string, boolean>>(
  props.initialVisibility ??
  Object.fromEntries(
    props.columns.map((col: ColumnDef<any>) => [
      col.id!,
      !(col.meta as any)?.hiddenByDefault,
    ]),
  ),
);

/**
 * Column pinning (left / right).
 * Prefers explicit props; falls back to `meta.pinnable` columns.
 */
const columnPinning = ref({
  left:
    props.pinnableColumnsleft ??
    props.columns
      .filter((col: ColumnDef<any>) => (col.meta as any)?.pinnable)
      .map((col: ColumnDef<any>) => col.id!),
  right:
    props.pinnableColumnsRight ??
    props.columns
      .filter((col: ColumnDef<any>) => (col.meta as any)?.pinnable)
      .map((col: ColumnDef<any>) => col.id!),
});

/** Local mirrors kept in sync with parent props */
const sorting = ref(props.sorting ?? []);
const globalFilter = ref(props.globalFilter ?? "");
const columnFilters = ref(props.columnFilters ?? []);

// =========================================================
// Watchers – sync internal state with external props
// =========================================================

/** Push updated page size directly into tableApi */
watch(
  () => props.pageSize,
  (size) => tableRef.value?.tableApi?.setPageSize(size),
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

// =========================================================
// Helper Utilities
// =========================================================

const toast = useToast();
const { copy } = useClipboard();

/**
 * Renders a Status Badge using the `statusMap`.
 * Accepts both string and boolean cell values.
 */
function statusCell(value: unknown) {
  if (typeof value === "boolean") value = String(value);
  if (typeof value !== "string") return value;
  const config = props.statusMap?.[value];
  if (!config) return value;
  return h(
    UBadge,
    { color: config.color, variant: "soft" },
    () => config.label,
  );
}

/**
 * Returns "-" for null, undefined, or zero values;
 * otherwise passes the value through unchanged.
 */
function displayValue(value: unknown) {
  return value === null || value === undefined || value === 0 ? "-" : value;
}

/**
 * Extracts a nested value from an object by key.
 * Example: resolveObjectValue({ city: "Riyadh" }, "city") → "Riyadh"
 */
function resolveObjectValue(value: unknown, key?: string): string {
  if (!value || typeof value !== "object" || !key) return "";
  return (value as Record<string, any>)[key] ?? "";
}

// =========================================================
// Row Actions
// =========================================================

/** Returns the count of enabled row actions. */
function getEnabledActionsCount(): number {
  const { copy, view, edit, delete: del } = props.actions ?? {};
  return [copy, view, edit, del].filter((a) => a !== false).length;
}

/**
 * Resolves whether actions render inline (buttons) or as a dropdown.
 *   "inline"   → always buttons
 *   "dropdown" → always dropdown
 *   "auto"     → inline only when exactly one action is enabled
 */
const shouldShowInline = computed(() => {
  const mode = props.actions?.displayMode ?? "auto";
  if (mode === "inline") return true;
  if (mode === "dropdown") return false;
  return getEnabledActionsCount() === 1;
});

/**
 * Builds a flat action list for inline rendering.
 * Order: Copy → View → Edit → Delete
 */
function getInlineActions(row: T): DropdownMenuItem[] {
  const actions: DropdownMenuItem[] = [];

  // Copy ID
  const copyConfig = props.actions?.copy;
  if (copyConfig !== false) {
    const cfg = typeof copyConfig === "object" ? copyConfig : {};
    actions.push({
      label: cfg.label ?? "نسخ ID",
      icon: cfg.icon ?? "i-lucide-copy",
      onSelect: () => {
        copy(String(row.id));
        toast.add({
          title: "ID copied!",
          color: "success",
          icon: "i-lucide-circle-check",
        });
      },
    });
  }

  // View
  const viewConfig = props.actions?.view;
  if (viewConfig !== false) {
    const cfg = typeof viewConfig === "object" ? viewConfig : {};
    actions.push({
      label: cfg.label ?? "View",
      icon: cfg.icon ?? "i-lucide-eye",
      onSelect: () => emit("view:row", row.id),
    });
  }

  // Edit
  const editConfig = props.actions?.edit;
  if (editConfig !== false) {
    const cfg = typeof editConfig === "object" ? editConfig : {};
    actions.push({
      label: cfg.label ?? "Edit",
      icon: cfg.icon ?? "i-lucide-edit",
      onSelect: () => emit("update:data", { title: props.titleBtnEdit, row }),
    });
  }

  // Delete
  const deleteConfig = props.actions?.delete;
  if (deleteConfig !== false) {
    const cfg = typeof deleteConfig === "object" ? deleteConfig : {};
    actions.push({
      label: cfg.label ?? "Delete",
      icon: cfg.icon ?? "i-lucide-trash",
      color: "error",
      onSelect: () => emit("delete:row", row.id),
    });
  }

  return actions;
}

/**
 * Builds a grouped action list for the dropdown menu.
 *   Group 1: Copy ID
 *   Group 2: View / Edit / Delete
 */
function getDropdownActions(row: T): DropdownMenuItem[][] {
  const groups: DropdownMenuItem[][] = [];

  // Group 1 – Copy
  const copyConfig = props.actions?.copy;
  if (copyConfig !== false) {
    const cfg = typeof copyConfig === "object" ? copyConfig : {};
    groups.push([
      {
        label: cfg.label ?? "Copy ID",
        icon: cfg.icon ?? "i-lucide-copy",
        onSelect: () => {
          copy(String(row.id));
          toast.add({
            title: "ID copied!",
            color: "success",
            icon: "i-lucide-circle-check",
          });
        },
      },
    ]);
  }

  // Group 2 – View / Edit / Delete
const main: DropdownMenuItem[] = [];

const viewConfig = props.actions?.view;
if (viewConfig !== false) {
  const cfg = typeof viewConfig === "object" ? viewConfig : {};
  main.push({
    label: cfg.label ?? "عرض",
    icon: cfg.icon ?? "solar:eye-linear",
    class: cfg.class ?? "text-sky-500 hover:text-sky-600",
    onSelect: () => emit("view:row", row.id),
  });
}

const editConfig = props.actions?.edit;
if (editConfig !== false) {
  const cfg = typeof editConfig === "object" ? editConfig : {};
  main.push({
    label: cfg.label ?? "تعديل",
    icon: cfg.icon ?? "solar:pen-new-round-linear",
    class: cfg.class ?? "text-amber-500 hover:text-amber-600",
    onSelect: () => emit("update:data", { title: props.titleBtnEdit, row }),
  });
}

const deleteConfig = props.actions?.delete;
if (deleteConfig !== false) {
  const cfg = typeof deleteConfig === "object" ? deleteConfig : {};
  main.push({
    label: cfg.label ?? "حذف",
    icon: cfg.icon ?? "solar:trash-bin-minimalistic-linear",
    class: cfg.class ?? "text-red-500 hover:text-red-600",
    color: "error",
    onSelect: () => emit("delete:row", row.id),
  });
}

if (main.length) groups.push(main);
return groups;
}

// =========================================================
// Sortable Column Header
// =========================================================

/**
 * Renders a header cell with an asc / desc sort toggle button.
 * Clicking the active direction again clears the sort.
 */
function getHeader(column: Column<T>, label: string) {
  const isSorted = column.getIsSorted();
  return h(
    "UDropdownMenu",
    {
      content: { align: "start" },
      items: [
        {
          label: "Ascending",
          type: "checkbox",
          checked: isSorted === "asc",
          onSelect: () =>
            isSorted === "asc"
              ? column.clearSorting()
              : column.toggleSorting(false),
        },
        {
          label: "Descending",
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

// =========================================================
// Row Click Handler
// =========================================================

/**
 * Fires the row-click callback and emits `row:click`.
 * No-ops when `rowClickable` is false.
 */
function handleRowClick(row: T): void {
  if (!props.rowClickable) return;
  props.onRowClick?.(row);
  emit("row:click", row);
}

// =========================================================
// Hover Popover
// =========================================================

/** Tracks pointer position to anchor the cursor-following popover */
const anchor = ref({ x: 0, y: 0 });

/**
 * Virtual reference element that mirrors the mouse cursor.
 * Required by UPopover to position itself relative to the pointer.
 */
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
/** Debounced 50 ms – prevents flicker when the pointer briefly leaves a row */
const openDebounced = refDebounced(open, 50);

/** Updates the hovered row reference and popover open state */
function onHover(_e: Event, row: TableRow<Employee> | null): void {
  selectedRow.value = row;
  open.value = !!row;
}

// =========================================================
// FAB hover state
// =========================================================

/** Controls whether the FAB label is visible */
const fabHovered = ref(false);
</script>

<template>
  <!-- Outer wrapper – position:relative so the FAB is contained -->
  <div class="dt-wrapper flex flex-col w-full relative">
    <!-- =====================================================
         Toolbar
    ===================================================== -->
    <div class="dt-toolbar flex gap-2 px-4 py-2.5 items-center">
      <div class="flex gap-2 items-center flex-wrap">
        <!-- Global search -->
        <UInput v-if="searchTable" v-model="globalFilter" placeholder="ابحث بالاسم أو ال ID ..."
          @update:model-value="emit('update:globalFilter', $event)" />

        <!-- Page size selector -->
        <USelect  size="sm" :model-value="pageSize" :items="pageSizes ?? [10, 20, 50]" class="w-16"
          @update:model-value="emit('update:pageSize', $event)" />

        <!-- Column visibility dropdown -->
        <UDropdownMenu :items="tableRef?.tableApi
            ?.getAllColumns()
            .filter((col: Column<T>) => col.getCanHide())
            .map((col: Column<T>) => ({
              type: 'checkbox',
              label: col.columnDef.meta?.label ?? String(col.id),
              checked: col.getIsVisible(),
              onUpdateChecked: (v: boolean) =>
                tableRef?.tableApi?.getColumn(col.id)?.toggleVisibility(v),
            }))
          "
          size="sm">
          <UButton size="sm" label="الأعمدة" variant="outline" color="neutral" />
        </UDropdownMenu>

        <!-- Targeted column search -->
        <UInput v-if="searchColumn" placeholder="Search..." @update:model-value="
          emit('filter', { column: searchColumn, value: $event })
          " />

        <!-- Slot for extra toolbar controls -->
        <slot name="toolbar-prepend" />
      </div>
    </div>

    <!-- =====================================================
         Table
    ===================================================== -->
    <ClientOnly>
      <div class="flex w-full flex-1 gap-1 " :class="total > 10 ? 'items-center' :'items-start'">
        <UTable ref="table" class="dt-table flex-1 max-h-135" sticky :loading="props.loading" loading-color="primary"
          loading-animation="carousel" :ui="{ thead: 'dt-thead', tr: 'hover-Poper' }" :columns="columns" :data="data"
          :meta="meta" v-model:column-visibility="columnVisibility" v-model:column-pinning="columnPinning"
          v-model:sorting="sorting" v-model:column-filters="columnFilters" @sort="emit('update:sorting', $event)"
          @update:global-filter="emit('update:globalFilter', $event)"
          @update:column-filters="emit('update:columnFilters', $event)" @pointermove="
            (ev: PointerEvent) => {
              anchor.x = ev.clientX;
              anchor.y = ev.clientY;
            }
          " @hover="onHover">
          <!-- Dynamic cell slots -->
          <template v-for="col in columns" :key="col.id" #[`${col.id}-cell`]="{ getValue, row }">
            <!-- Status Badge cell -->
            <component v-if="col.meta?.type === 'status'" :is="statusCell(getValue())" />

            <!-- Employee name + avatar cell -->
            <div v-else-if="col.id === 'full_name'" class="flex items-center text-start gap-2"
              :class="{ 'cursor-pointer': rowClickable }" @click="rowClickable && handleRowClick(row.original)">
              <UAvatar :src="row.original.image || undefined" :icon="!row.original.image
                  ? row.original.status === 'active'
                    ? 'material-symbols-light:account-circle-outline'
                    : 'material-symbols-light:no-accounts-outline'
                  : undefined
                " size="sm" :alt="row.original.full_name" :ui="{
                  root: 'p-0 bg-transparent',
                  icon: !row.original.image
                    ? row.original.status === 'active'
                      ? 'w-full h-full bg-secondary-500'
                      : 'w-full h-full bg-error'
                    : '',
                }" />
              <div>
                <p class="font-medium text-highlighted text-xs leading-tight">
                  {{ row.original.full_name }}
                </p>
                <p class="text-[11px] text-muted leading-tight pt-[0.4px]">
                  {{ row.original.position }}
                </p>
              </div>
            </div>

            <!-- Location cell -->
            <div v-else-if="col.id === 'location_ar'" class="flex items-center gap-1"
              :class="{ 'cursor-pointer': rowClickable }" @click="rowClickable && handleRowClick(row.original)">
              <UIcon name="material-symbols:location-on-outline-rounded" class="size-4 text-info/70" />
              <span class="text-xs">{{ row.original.location_ar }}</span>
            </div>

            <!-- Row actions cell -->
            <template v-else-if="col.id === 'action'">
              <!-- Inline mode – side-by-side buttons -->
              <div v-if="shouldShowInline" class="flex items-center gap-1">
                <UButton v-for="(action, idx) in getInlineActions(row.original)" :key="idx" :label="action.label"
                  :icon="action.icon" :color="(action.color as any) || 'neutral'" variant="ghost" size="xs"
                  @click="action.onSelect" />
              </div>

              <!-- Dropdown mode -->
              <UDropdownMenu v-else :items="getDropdownActions(row.original)"
                :content="{ align: 'center', side: 'left', sideOffset: 0 }" :ui="{ content: 'w-24' }">
                <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="xs"
                  aria-label="Actions" />
              </UDropdownMenu>
            </template>

            <!-- Nested object cell -->
            <span v-else-if="col.meta?.type === 'object'" class="text-xs" :class="{ 'cursor-pointer': rowClickable }"
              @click="rowClickable && handleRowClick(row.original)">
              {{ resolveObjectValue(getValue(), col.meta?.valueKey) }}
            </span>

            <!-- Default text cell with optional named slot override -->
            <slot v-else :name="`${col.id}-cell`" :getValue="getValue">
              <div class="text-xs" :class="{ 'cursor-pointer': rowClickable }"
                @click="rowClickable && handleRowClick(row.original)">
                {{ displayValue(getValue()) }}
              </div>
            </slot>
          </template>
        </UTable>

        <!-- Cursor-anchored hover popover -->
        <UPopover :content="{
          side: 'top',
          sideOffset: 16,
          updatePositionStrategy: 'always',
        }" :open="openDebounced" :reference="reference" :ui="{ arrow: 'hover-Poper' }">
          <template #content />
        </UPopover>
      </div>
    </ClientOnly>

    <!-- =====================================================
         Footer – pagination only
    ===================================================== -->
    <div class="dt-footer flex justify-between items-center px-4 py-2.5 border-t border-default">
      <UPagination size="sm" :siblingCount="1" :page="page" :items-per-page="pageSize" :total="total"
        @update:page="emit('update:page', $event)" />
      <div class="text-sm text-gray-600 font-medium">
        <span class="text-gray-900 font-semibold">{{ total }}</span>
        سجل
        <template v-if="pageSizes">
          <span class="mx-2 text-gray-400">|</span>
          الصفحة
          <span class="text-gray-900 font-semibold">{{ page }}</span>
          من
          <span class="text-gray-900 font-semibold">
            {{ Math.ceil(total / pageSize) }}
          </span>
        </template>
      </div>
    </div>

    <!-- =====================================================
         Floating Action Button (FAB) – bottom-right
         Shows a tooltip label on hover.
    ===================================================== -->
    <template v-if="btnCreate">
      <!-- FAB via external route -->
      <NuxtLink v-if="linkPageAdd" :to="linkPageAdd" class="dt-fab-wrapper">
        <div class="dt-fab" @mouseenter="fabHovered = true" @mouseleave="fabHovered = false">
          <span class="dt-fab-label" :class="{ 'dt-fab-label--visible': fabHovered }">
            {{ titleBtnCreate }}
          </span>
          <div class="dt-fab-btn">
            <UIcon :name="titleBtnIcon || 'i-lucide-plus'" class="dt-fab-icon" />
          </div>
        </div>
      </NuxtLink>

      <!-- FAB via internal Drawer -->
      <div class="dt-fab-wrapper" @mouseenter="fabHovered = true" @mouseleave="fabHovered = false"
        @click="emit('drower:open', { title: titleBtnCreate })">
        <div class="dt-fab-btn" :class="{ 'dt-fab-btn--expanded': fabHovered }">
          <UIcon :name="titleBtnIcon || 'i-lucide-plus'" class="dt-fab-icon" />
          <span class="dt-fab-label" :class="{ 'dt-fab-label--visible': fabHovered }">
            {{ titleBtnCreate }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* =========================================================
   Brand Color Tokens
   ========================================================= */
.dt-wrapper {
  height: 100%;
  /* Sky blue family */
  --dt-blue-1: #0ea5e9;
  --dt-blue-2: #0989cf;
  --dt-blue-3: #5bdbf0;
  --dt-blue-4: #82edf4;
  --dt-blue-5: #a8f7f5;
  --dt-blue-6: #cffbf6;

  /* Gold / amber family */
  --dt-gold-1: #e4c13c;
  --dt-gold-2: #edc27a;
  --dt-gold-3: #f5d5b9;
  --dt-gold-4: #fae5d8;

  /* Olive family */
  --dt-olive-1: #787418;
  --dt-olive-2: #948b20;
  --dt-olive-3: #b09f28;
  --dt-olive-4: #cab132;

  /* Semantic tokens */
  --dt-header-bg: linear-gradient(135deg,
      var(--dt-blue-2) 0%,
      var(--dt-blue-1) 100%);
  --dt-header-text: #ffffff;
  --dt-header-border: var(--dt-blue-3);
  --dt-header-accent: var(--dt-gold-1);

  --dt-row-odd: #ffffff;
  --dt-row-even: #f4fdfe;
  --dt-row-hover: #e6fafb;
  --dt-row-border: #e4f7f9;

  --dt-toolbar-bg: #f8feff;
  --dt-footer-bg: #f8feff;
}


:deep(.dt-thead th:not([data-column-id='full_name'])) {
  text-align: center !important;
}

:deep(.dt-thead th[data-column-id='full_name']),
:deep(.dt-table tbody td[data-column-id='full_name']) {
  text-align: start !important;
}


/* =========================================================
   Toolbar
   ========================================================= */
.dt-toolbar {
  background: var(--dt-toolbar-bg);
  border-bottom: 1.5px solid var(--dt-blue-5);
}

:deep(.dt-thead)::after {
  height: 2px !important;
}

:deep(.dt-thead th) {
  color: var(--dt-blue-2) !important;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  /* text-align: start; */
  /* padding: 10px 14px; */
  /* border-right: 1px solid rgba(130, 237, 244, 0.25); */
  white-space: nowrap;
}

:deep(.dt-thead th:last-child) {
  border-right: none;
}

/* Sort toggle buttons */
:deep(.dt-thead th button) {
  color: rgba(255, 255, 255, 0.85) !important;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  transition: color 0.15s;
}

:deep(.dt-thead th button:hover) {
  color: #ffffff !important;
}


/* =========================================================
   Table Body – compact rows, zebra striping, hover
   ========================================================= */
:deep(.dt-table tbody tr:nth-child(odd)) {
  background-color: var(--dt-row-odd);
}

/* :deep(.dt-table tbody tr:nth-child(even)) {
  background-color: var(--dt-row-even);
} */

:deep(.dt-table tbody tr) {
  border-bottom: 1px solid var(--dt-row-border);
  transition: background-color 0.12s ease;
}

:deep(.dt-table tbody tr:hover) {
  background-color: var(--dt-row-hover);
}

/* Compact cell padding */
:deep(.dt-table tbody td) {
  padding: 7.5px 14px;
  font-size: 0.75rem;
  color: #1e293b;
  line-height: 1.35;
}

/* =========================================================
   Footer
   ========================================================= */
.dt-footer {
  background: var(--dt-footer-bg);
  border-top: 1.5px solid var(--dt-blue-5);
}

/* =========================================================
   Floating Action Button (FAB)
   ========================================================= */
.dt-fab-wrapper {
  position: fixed;
  bottom: 5.3rem;
  left: 2rem;
  z-index: 50;
  cursor: pointer;
}

/* الزر الدائري يتحول إلى pill */
.dt-fab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 40px;
  width: 40px;
  border-radius: 24px;
  background: linear-gradient(135deg, var(--dt-blue-1), var(--dt-blue-2));
  /* box-shadow:
    0 4px 14px rgba(9, 137, 207, 0.45),
    0 1px 3px rgba(9, 137, 207, 0.3); */
  overflow: hidden;
  transition:
    width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    border-radius 0.35s ease,
    box-shadow 0.2s ease;
  white-space: nowrap;
}

.dt-fab-btn--expanded {
  width: 160px;
  /* اضبطها حسب طول النص */
  border-radius: 24px;
  /* box-shadow:
    0 6px 20px rgba(9, 137, 207, 0.55),
    0 2px 6px rgba(9, 137, 207, 0.35); */
}

.dt-fab-icon {
  width: 22px;
  height: 22px;
  color: #fff;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.dt-fab-wrapper:hover .dt-fab-icon {
  transform: rotate(90deg);
}

/* النص داخل نفس الزر */
.dt-fab-label {
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.25s ease 0.05s;
}

.dt-fab-label--visible {
  max-width: 120px;
  opacity: 1;
}
</style>
