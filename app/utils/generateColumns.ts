import type { ColumnDef, Column } from '@tanstack/vue-table'
import { h } from "vue";
import '@tanstack/table-core'

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData, TValue> {
    label?: string
    hiddenByDefault?: boolean
    filterable?: boolean
    pinnable?: boolean
    type?: 'text' | 'number' | 'date' | 'status' | 'object'
    valueKey?: string
  }
}

export type ColumnOptions = {
  label?: string
  hidden?: boolean
  hideable?: boolean
  filterable?: boolean
  pinnable?: boolean
  sortable?: boolean
  type?: 'text' | 'number' | 'date' | 'status' | 'object'
  cell?: (props: any) => any
  header?: (column: any) => any
  valueKey?: string
}

export type GenerateColumnsOptions<T> = {
  labels?: Partial<Record<keyof T, string>>
  exclude?: (keyof T)[]
  columns?: Partial<Record<keyof T, ColumnOptions>>
}

/**
 * دالة توليد زر التثبيت في الهيدر
 */
function getHeaderPin<T>(column: Column<T>, position: 'left' | 'right', UButton: any) {
  const isPinned = column.getIsPinned()
  return h(UButton, {
    color: "primary",
    variant: "ghost",
    icon: isPinned ? "i-lucide-pin-off" : "i-lucide-pin",
    class: "-mx-2.5",
    size: 172,
    onClick() {
      column.pin(isPinned === position ? false : position);
    },
  })
}

/**
 * دالة توليد الأعمدة
 */
export function generateColumns<T extends Record<string, any>>(
  data: readonly T[],
  options: GenerateColumnsOptions<T> = {},
  UButton: any
): ColumnDef<T>[] {
  if (!data.length) return []

  const [first] = data
  if (!first) return []

  const keys = [...Object.keys(first), 'action'] as (keyof T | 'action')[]


  return keys
    .filter((key) => !options.exclude?.includes(key))
    .map((key) => {
      const col = options.columns?.[key]

      const column: ColumnDef<T> = {
        id: key as string,
        size: 700,
        accessorKey: key as string,
        accessorFn: (row) => row[key],

        header: (ctx) => {
          if (col?.header) return col.header!(ctx.column)

          const label = options.labels?.[key] ?? col?.label ?? String(key)

          // ⚡ لا تغلف div جديد بالكامل، أضف زر التثبيت كـ fragment
          const children = []
          if (col?.pinnable) {
            children.push(getHeaderPin(ctx.column, 'left', UButton))
          }
          children.push(label)

          return children.length === 1 ? children[0] : children
        },

        enableSorting: col?.sortable ?? true,

        meta: {
          label: options.labels?.[key] ?? col?.label ?? String(key),
          hiddenByDefault: col?.hidden ?? false,
          filterable: col?.filterable ?? false,
          pinnable: col?.pinnable ?? false,
          type: col?.type ?? 'text',
          valueKey: col?.valueKey,
        },
      }

      if (col?.cell) {
        column.cell = col.cell
      }

      return column
    })
}
