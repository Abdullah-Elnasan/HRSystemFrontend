<script setup lang="ts">
import { h, resolveComponent } from "vue";
import { upperFirst } from "scule";
import type { TableColumn, DropdownMenuItem } from "@nuxt/ui";
import type { Column } from "@tanstack/vue-table";
import { useClipboard } from "@vueuse/core";
import type { TableMeta, Row } from "@tanstack/vue-table";
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UButton = resolveComponent("UButton");
const UAvatar = resolveComponent("UAvatar");
const pageSizes = [5, 10, 20, 50];
const pageSize = ref(10);
watch(pageSize, (size) => {
  table?.value?.tableApi?.setPageSize(size);
});

type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar: { src: string };
  company: { name: string };
};

const toast = useToast();
const { copy } = useClipboard();

const { data, status } = await useFetch<User[]>(
  "https://jsonplaceholder.typicode.com/users",
  {
    key: "table-users",
    transform: (data) => {
      return (
        data?.map((user) => ({
          ...user,
          avatar: {
            src: `https://i.pravatar.cc/120?img=${user.id}`,
            alt: `${user.name} avatar`,
          },
        })) || []
      );
    },
    lazy: true,
  }
);

const columns: TableColumn<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ getValue }) => getValue(),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return h("div", { class: "flex items-center gap-3" }, [
        h(UAvatar, {
          ...row.original.avatar,
          size: "lg",
        }),
        h("div", undefined, [
          h("p", { class: "font-medium text-highlighted" }, row.original.name),
          h("p", { class: "" }, `@${row.original.username}`),
        ]),
      ]);
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) =>
      h("div", { class: "flex items-center gap-2" }, [
        getHeaderPin(column, "", "left"),
        getHeader(column, "Email"),
      ]),
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => row.original.company.name,
  },
  {
    id: "action",
    header: "",
    enableSorting: false,
    enableHiding: false,
  },
];

const meta: TableMeta<User> = {
  class: {
    tr: (row: Row<User>) => {
      // if (row.original.status === 'error') {
      //   return 'bg-error/10'
      // }

      // if (row.original.status === 'refunded') {
      //   return 'bg-warning/10'
      // }

      // const base = `
      //   shadow-sm rounded-lg
      //   transition hover:shadow-md
      // `;

      const zebra =
        row.index % 2 === 0
          ? "bg-gray-50 dark:bg-gray-800"
          : "bg-white dark:bg-gray-900";

      return `
        ${zebra}
        shadow-sm ring-1 ring-default/10
        rounded-lg
        transition-shadow
        `;
    },
  },
};

const table = useTemplateRef("table");

const columnVisibility = ref({
  id: false,
});

const columnFilters = ref([
  {
    id: "email",
    value: "james",
  },
]);

function getHeader(column: Column<User>, label: string) {
  const isSorted = column.getIsSorted();

  return h(
    UDropdownMenu,
    {
      content: {
        align: "start",
      },
      "aria-label": "Actions dropdown",
      items: [
        {
          label: "Asc",
          type: "checkbox",
          icon: "i-lucide-arrow-up-narrow-wide",
          checked: isSorted === "asc",
          onSelect: () => {
            if (isSorted === "asc") {
              column.clearSorting();
            } else {
              column.toggleSorting(false);
            }
          },
        },
        {
          label: "Desc",
          icon: "i-lucide-arrow-down-wide-narrow",
          type: "checkbox",
          checked: isSorted === "desc",
          onSelect: () => {
            if (isSorted === "desc") {
              column.clearSorting();
            } else {
              column.toggleSorting(true);
            }
          },
        },
      ],
    },
    () =>
      h(UButton, {
        color: "neutral",
        variant: "ghost",
        label,
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5 data-[state=open]:bg-elevated",
        "aria-label": `Sort by ${
          isSorted === "asc" ? "descending" : "ascending"
        }`,
      })
  );
}

function getHeaderPin(
  column: Column<User>,
  label: string,
  position: "left" | "right"
) {
  const isPinned = column.getIsPinned();

  return h(UButton, {
    color: "neutral",
    variant: "ghost",
    label,
    icon: isPinned ? "i-lucide-pin-off" : "i-lucide-pin",
    class: "-mx-2.5",
    onClick() {
      column.pin(isPinned === position ? false : position);
    },
  });
}

const columnPinning = ref({
  left: ["id"],
  right: ["amount"],
});

const sorting = ref([
  {
    id: "id",
    desc: false,
  },
]);

const globalFilter = ref("");

function getDropdownActions(user: User): DropdownMenuItem[][] {
  return [
    [
      {
        label: "Copy user Id",
        icon: "i-lucide-copy",
        onSelect: () => {
          copy(user.id.toString());

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
        label: "Edit",
        icon: "i-lucide-edit",
      },
      {
        label: "Delete",
        icon: "i-lucide-trash",
        color: "error",
      },
    ],
  ];
}
</script>

<template>
  <div class="flex flex-col flex-1 w-full">
    <div class="flex justify-start px-4 py-3.5 border-b border border-default">
      <USelect
        v-model="pageSize"
        :items="pageSizes"
        class="max-w-30 me-2"
        placeholder="Rows"
      />

      <UDropdownMenu
        class="me-2"
        :items="
          table?.tableApi
            ?.getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => ({
              label: upperFirst(column.id),
              type: 'checkbox' as const,
              checked: column.getIsVisible(),
              onUpdateChecked(checked: boolean) {
                table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
              },
              onSelect(e: Event) {
                e.preventDefault()
              }
            }))
        "
        :content="{ align: 'end' }"
      >
        <UButton
          label="Columns"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-chevron-down"
        />
      </UDropdownMenu>
      <UInput
        :model-value="table?.tableApi?.getColumn('email')?.getFilterValue() as string"
        class="max-w-sm me-2"
        placeholder="Filter emails..."
        @update:model-value="
          table?.tableApi?.getColumn('email')?.setFilterValue($event)
        "
      />

      <UInput
        v-model="globalFilter"
        class="max-w-sm me-2"
        placeholder="Filter..."
      />
    </div>

    <UTable
      ref="table"
      v-model:column-visibility="columnVisibility"
      v-model:sorting="sorting"
      v-model:column-pinning="columnPinning"
      :data="data"
      :meta="meta"
      :columns="columns"
    >
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar
            :src="`https://i.pravatar.cc/120?img=${row.original.id}`"
            size="lg"
            :alt="`${row.original.name} avatar`"
          />
          <div>
            <p class="font-medium text-highlighted">
              {{ row.original.name }}
            </p>
            <!-- <p>
              {{ row.original.position }}
            </p> -->
          </div>
        </div>
      </template>
      <template #action-cell="{ row }">
        <UDropdownMenu :items="getDropdownActions(row.original)">
          <UButton
            icon="i-lucide-ellipsis-vertical"
            color="neutral"
            variant="ghost"
            aria-label="Actions"
          />
        </UDropdownMenu>
      </template>
    </UTable>
    <div class="flex justify-start border-t border-default pt-4 px-4">
      <UPagination
        :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>
  </div>
</template>
