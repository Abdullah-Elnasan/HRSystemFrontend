<template>
  <UDashboardSidebar
    collapsible
    :ui="{ footer: 'border-b border-default', root: ' max-w-64 border-2 border-default' }"
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
      <AppLogo width="100"  v-if="!collapsed" class="" />
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
        :avatar="{ src: 'https://github.com/benjamincanac.png' }"
        :label="collapsed ? undefined : 'Benjamin'"
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

// const { wrapMouseDown } = useRtlResize();

// function handleResize(original: (e: MouseEvent) => void, e: MouseEvent) {
//   console.log("mousedown event clientX:", e.clientX);
//   // نمرر اتجاه الـ sidebar (left أو right)
//   wrapMouseDown(original, { side: "left" })(e);
// }

const items: NavigationMenuItem[][] = [
  [
    { label: "الصفحة الرئيسية", icon: "i-lucide-house", to:'/'},
    { label: "Inbox", icon: "i-lucide-inbox", badge: "4" },
    { label: "إدارة الموظفين", icon: "i-lucide-users" , to: '/employees' },
    { label: "إدارة الأفرع", icon: "gravity-ui:branches-down" , to: '/branches' },
    { label: "إدارة الأقسام", icon: "lucide:folder-tree" , to: '/departments' },
    { label: "إدارة أنظمة الدوام", icon: "lucide:folder-tree" , to: '/work-schedules' },
    { label: "إدارة مجموعات المستخدمين", icon: "streamline-flex:user-collaborate-group-solid" , to: '/user-groups' },
    {
      label: "Settings",
      icon: "i-lucide-settings",
      defaultOpen: true,
      children: [
        { label: "General" },
        { label: "Members" },
        { label: "Notifications" },
      ],
    },
  ],
  [
    {
      label: "Feedback",
      icon: "i-lucide-message-circle",
      to: "https://github.com/nuxt-ui-templates/dashboard",
      target: "_blank",
    },
    {
      label: "Help & Support",
      icon: "i-lucide-info",
      to: "https://github.com/nuxt/ui",
      target: "_blank",
    },
  ],
];
</script>
