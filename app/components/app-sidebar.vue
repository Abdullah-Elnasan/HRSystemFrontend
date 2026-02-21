<template>
  <UDashboardSidebar
    collapsible
    :ui="{
      footer: 'border-b border-default',
      root: ' max-w-64 border-2 border-default',
    }"
    :min-size="22"
    :default-size="35"
    :max-size="40"
    mode="modal"
    toggleSide="right"
    side="left"
  >
    <!-- زر السحب -->
    <!-- <template #resize-handle="{ onMouseDown, ui }">
      <div :class="ui" @mousedown="handleResize(onMouseDown, $event)" />
    </template> -->

    <!-- الهيدر -->
    <template #header="{ collapsed }">
      <AppLogo width="100" v-if="!collapsed" class="" />
    </template>

    <!-- المحتوى -->
    <template #default="{ collapsed }">
      <UDashboardSearchButton :collapsed="collapsed" />

      <UNavigationMenu
        :collapsed="collapsed"
        :items="items[0]"
        orientation="vertical"
      />

      <UNavigationMenu
        :collapsed="collapsed"
        :items="items[1]"
        orientation="vertical"
        class="mt-auto"
      />
    </template>

    <!-- الفوتر -->
    <template #footer="{ collapsed }">
      <UButton
        :avatar="{
          src: userAvatar,
          alt: userName || 'User',
        }"
        :label="collapsed ? undefined : userName"
        color="neutral"
        variant="ghost"
        class="w-full"
        :block="collapsed"
      />
    </template>
  </UDashboardSidebar>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import { fa } from "zod/locales";
import { useAttendancePending } from "~/composables/attendances/useAttendancePending";
import { useAuthStore } from "~/stores/auth/auth";

const { data, pagination } = await useAttendancePending();
const safePagination = computed(() => ({
  total: pagination.value?.total ?? 0,
}));
console.log(safePagination);
console.log(safePagination.value.total);

// Get user data from auth store
const authStore = useAuthStore();
console.log(authStore.user);

// Computed properties for user name and avatar
const userName = computed(() => {
  return authStore.user?.name || "المستخدم";
});

const userAvatar = computed(() => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase || "";

  // Check if user has image property
  if (authStore.user?.employee?.image) {
    const imageUrl = authStore.user.employee?.image;
    // If image is a relative path, prepend API base URL
    if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
      return `${apiBase}/${imageUrl}`;
    }
    // If image starts with /, it's already a full path
    if (imageUrl && imageUrl.startsWith("/")) {
      return `${apiBase}${imageUrl}`;
    }
    return imageUrl;
  }
  // Check if user has avatar property
  console.log(authStore.user);
  if (authStore.user?.employee && authStore.user.employee?.image) {
    const avatarUrl = authStore.user.employee?.image;
    console.log("avatarUrl");
    console.log(avatarUrl);
    // If avatar is a relative path, prepend API base URL
    if (
      avatarUrl &&
      !avatarUrl.startsWith("http") &&
      !avatarUrl.startsWith("/")
    ) {
      return `${apiBase}/${avatarUrl}`;
    }
    // If avatar starts with /, it's already a full path
    if (avatarUrl && avatarUrl.startsWith("/")) {
      return `${apiBase}${avatarUrl}`;
    }
    return avatarUrl;
  }
  // Default avatar or placeholder
  return "https://github.com/benjamincanac.png";
});

// const { wrapMouseDown } = useRtlResize();

// function handleResize(original: (e: MouseEvent) => void, e: MouseEvent) {
//   console.log("mousedown event clientX:", e.clientX);
//   // نمرر اتجاه الـ sidebar (left أو right)
//   wrapMouseDown(original, { side: "left" })(e);
// }

const items = computed<NavigationMenuItem[][]>(() => [
  [
    { label: "الصفحة الرئيسية", icon: "i-lucide-house", to: "/" },
    {
      label: "سجلات للمراجعة",
      icon: "i-lucide-inbox",
      badge: safePagination.value.total,
      to: "/attendances/pending",
    },
    {
      label: "الموظفين",
      icon: "lucide:folder-tree",
      // to: "/work-schedules",
      defaultOpen: false,
      children: [
        {
          label: "إدارة الموظفين",
          icon: "i-lucide-users",
          to: "/employees",
        },
        {
          label: "الأفرع",
          icon: "gravity-ui:branches-down",
          to: "/employees/branches",
        },
        {
          label: "الأقسام",
          icon: "lucide:folder-tree",
          to: "/employees/departments",
        },
      ],
    },
    {
      label: "إدارة الوصول",
      icon: "lucide:folder-tree",
      defaultOpen: false,
      children: [
        {
          label: "إدارة مجموعات المستخدمين",
          icon: "streamline-flex:user-collaborate-group-solid",
          to: "/user-groups",
        },
        {
          label: "الصلاحيات",
          icon: "lucide:link",
          to: "/access-controller/permissions",
        },
      ],
    },
    {
      label: "الحضور والانصراف",
      icon: "lucide:folder-tree",
      defaultOpen: false,
      children: [
        // ⚙️ الإعدادات
        {
          label: "الإعدادات",
          icon: "lucide:settings",
          defaultOpen: false,

          children: [
            {
              label: "أنظمة الدوام",
              icon: "lucide:clock",
              to: "/attendances/settings/work-schedules",
            },
            // {
            //   label: "جداول الدوام",
            //   icon: "lucide:calendar-clock",
            //   to: "/attendance/settings/work-schedules",
            // },
            {
              label: "إسناد الدوام",
              icon: "lucide:link",
              to: "/attendances/settings/work-schedules/manage-assign",
            },
          ],
        },

        // 📋 السجلات
        {
          label: "السجلات",
          icon: "lucide:clipboard-list",
          defaultOpen: false,

          children: [
            {
              label: "حضور اليوم",
              icon: "lucide:calendar-check",
              to: "/attendances/today",
            },
            {
              label: "سجلات الحضور",
              icon: "lucide:list",
              to: "/attendances/",
            },
          ],
        },
      ],
    },
    {
      label: "الرواتب",
      icon: "lucide:folder-tree",
      defaultOpen: false,
      children: [
        // ⚙️ الإعدادات
        {
          label: "الإعدادات",
          icon: "lucide:settings",
          defaultOpen: false,

          children: [
            {
              label: "أنظمة الرواتب",
              icon: "lucide:clock",
              to: "/payroll/settings/payroll-systems",
            },
            // {
            //   label: "جداول الدوام",
            //   icon: "lucide:calendar-clock",
            //   to: "/attendance/settings/work-schedules",
            // },
            {
              label: "إسناد الرواتب",
              icon: "lucide:link",
              to: "/payroll/settings/manage-assign",
            },
          ],
        },

        // 📋 السجلات
        {
          label: "القوائم",
          icon: "lucide:clipboard-list",
          defaultOpen: false,

          children: [
            {
              label: "قائمة الشهر",
              icon: "lucide:calendar-check",
              to: "/payroll/payroll-items",
            },
            {
              label: "قوائم الاعتماد",
              icon: "lucide:list",
              to: "/payroll/payroll-runs",
            },
            {
              label: "قوائم الاضافي",
              icon: "lucide:list",
              to: "/payroll/overtime/pending",
            },
            {
              label: "معتمد الاضافي",
              icon: "lucide:list",
              to: "/payroll/overtime/approved",
            },
          ],
        },
      ],
    },
  ],

  // {
  //   label: "إدارة أنظمة الدوام",
  //   icon: "lucide:folder-tree",
  //   // to: "/work-schedules",
  //   defaultOpen: false,
  //   children: [
  //     {
  //       label: "أنظمة الدوام",
  //       icon: "lucide:folder-tree",
  //       to: "/work-schedules",
  //     },
  //     {
  //       label: "إسناد الدوام",
  //       icon: "lucide:folder-tree",
  //       to: "/work-schedules/manage-assign",
  //     },
  //   ],
  // },
  // {
  //   label: "إدارة أنظمة الرواتب",
  //   icon: "lucide:folder-tree",
  //   // to: "/payroll-systems",
  //   defaultOpen: true,
  //   children: [
  //     {
  //       label: "أنظمة الرواتب",
  //       icon: "lucide:folder-tree",
  //       to: "/payroll-systems",
  //     },
  //     {
  //       label: "إسناد الرواتب",
  //       icon: "lucide:folder-tree",
  //       to: "/payroll-systems/manage-assign",
  //     },
  //   ],
  // },
  // {
  //   label: "إدارة سجلات الرواتب",
  //   icon: "lucide:folder-tree",
  //   // to: "/payroll-systems",
  //   defaultOpen: true,
  //   children: [
  //     {
  //       label: "قوائم الرواتب",
  //       icon: "lucide:folder-tree",
  //       to: "/payroll/payroll-items",
  //     },
  //     {
  //       label: "قوائم الاعتماد",
  //       icon: "lucide:folder-tree",
  //       to: "/payroll/payroll-runs",
  //     },
  //   ],
  // },

  // { label: "إدارة الموظفين", icon: "i-lucide-users", to: "/employees" },
  // {
  //   label: "إدارة الأفرع",
  //   icon: "gravity-ui:branches-down",
  //   to: "/branches",
  // },
  // { label: "إدارة الأقسام", icon: "lucide:folder-tree", to: "/departments" },
  // {
  //   label: "إدارة السجلات",
  //   icon: "lucide:folder-tree",
  //   to: "/attendances/attendances-today",
  // },
  // [
  //   {
  //     label: "Feedback",
  //     icon: "i-lucide-message-circle",
  //     to: "https://github.com/nuxt-ui-templates/dashboard",
  //     target: "_blank",
  //   },
  //   {
  //     label: "Help & Support",
  //     icon: "i-lucide-info",
  //     to: "https://github.com/nuxt/ui",
  //     target: "_blank",
  //   },
  // ],
]);
</script>
