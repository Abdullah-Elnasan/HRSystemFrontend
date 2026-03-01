<template>
  <UDashboardSidebar
    collapsible
    side="left"
    toggleSide="right"
    mode="modal"
    :min-size="22"
    :default-size="35"
    :max-size="40"
    :ui="{
      root: 'max-w-64 border-r border-default',
      header: 'px-2',
      footer: 'border-t border-default',
    }"
  >
    <!-- Logo -->
    <template #header="{ collapsed }">
      <div class="flex items-center justify-center py-2">
        <img
          v-if="!collapsed"
          key="full-logo"
          src="/logo-512.png"
          width="100"
          class="w-full object-contain"
          alt="Al-Diwan Logo"
        />
        <img
          v-else
          key="shape-logo"
          src="/shape.png"
          class="w-8 h-8 object-contain"
          alt="Al-Diwan Logo"
        />
      </div>
    </template>

    <!-- Main Content -->
    <template #default="{ collapsed }">
      <UDashboardSearchButton :collapsed="collapsed" class="mb-2" />

      <UNavigationMenu
        :collapsed="collapsed"
        :items="mainNavItems"
        orientation="vertical"
      />

      <UNavigationMenu
        :collapsed="collapsed"
        :items="bottomNavItems"
        orientation="vertical"
        class="mt-auto"
      />
    </template>

    <!-- User Info -->
    <template #footer="{ collapsed }">
      <UButton
        :avatar="{ src: userAvatar, alt: userName }"
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
import { useAttendancePending } from "~/composables/attendances/useAttendancePending";
import { useAuthStore } from "~/stores/auth/auth";

const { pagination, fetchRecords } = useAttendancePending();
const authStore = useAuthStore();
const config = useRuntimeConfig();

const pendingTotal = computed(() => pagination.value?.total ?? 0);

// --- User Data ---------------------------------------------------
const userName = computed(() => authStore.user?.name || "المستخدم");

const userAvatar = computed(() => {
  const apiBase = config.public.apiBase || "";
  const image = authStore.user?.employee?.image;

  if (!image) return "https://github.com/benjamincanac.png";

  if (!image.startsWith("http")) {
    return image.startsWith("/") ? `${apiBase}${image}` : `${apiBase}/${image}`;
  }

  return image;
});

// --- Main Navigation --------------------------------------------
const mainNavItems = computed<NavigationMenuItem[]>(() => [
  {
    label: "الرئيسية",
    icon: "i-lucide-layout-dashboard",
    to: "/",
  },
  {
    label: "سجلات للمراجعة",
    icon: "i-lucide-bell-dot",
    badge: pendingTotal.value || undefined,
    to: "/attendances/pending",
  },

  // Employees
  {
    label: "الموظفون",
    icon: "i-lucide-users-round",
    defaultOpen: false,
    children: [
      { label: "قائمة الموظفين", icon: "i-lucide-user-round", to: "/employees" },
      { label: "الأفرع",         icon: "i-lucide-git-branch",  to: "/employees/branches" },
      { label: "الأقسام",        icon: "i-lucide-network",     to: "/employees/departments" },
    ],
  },

  // Attendance
  {
    label: "الحضور والانصراف",
    icon: "i-lucide-scan-face",
    defaultOpen: false,
    children: [
      {
        label: "الإعدادات",
        icon: "i-lucide-settings",
        defaultOpen: false,
        children: [
          { label: "أنظمة الدوام", icon: "i-lucide-timer",      to: "/attendances/settings/work-schedules" },
          { label: "إسناد الدوام", icon: "i-lucide-user-check", to: "/attendances/settings/work-schedules/manage-assign" },
        ],
      },
      {
        label: "السجلات",
        icon: "i-lucide-table-2",
        defaultOpen: false,
        children: [
          { label: "حضور اليوم",  icon: "i-lucide-calendar-check-2", to: "/attendances/attendances-today" },
          { label: "كل السجلات", icon: "i-lucide-calendar-range",    to: "/attendances/" },
        ],
      },
    ],
  },

  // Payroll
  {
    label: "الرواتب",
    icon: "i-lucide-circle-dollar-sign",
    defaultOpen: false,
    children: [
      {
        label: "الإعدادات",
        icon: "i-lucide-settings",
        defaultOpen: false,
        children: [
          { label: "أنظمة الرواتب", icon: "i-lucide-file-cog",       to: "/payroll/settings/payroll-systems" },
          { label: "إسناد الرواتب", icon: "i-lucide-user-round-cog", to: "/payroll/settings/payroll-systems/manage-assign" },
        ],
      },
      {
        label: "القوائم",
        icon: "i-lucide-receipt-text",
        defaultOpen: false,
        children: [
          { label: "قائمة الشهر",     icon: "i-lucide-calendar-days", to: "/payroll/payroll-items" },
          { label: "قوائم الاعتماد",  icon: "i-lucide-badge-check",   to: "/payroll/payroll-runs" },
          { label: "قوائم الإضافي",   icon: "i-lucide-clock-plus",    to: "/payroll/overtime/pending" },
          { label: "الإضافي المعتمد", icon: "i-lucide-clock-check",   to: "/payroll/overtime/approved" },
        ],
      },
    ],
  },

  // Access Control
  {
    label: "إدارة الوصول",
    icon: "i-lucide-shield-check",
    defaultOpen: false,
    children: [
      { label: "مجموعات المستخدمين", icon: "i-lucide-users-round", to: "/user-groups" },
      { label: "الصلاحيات",          icon: "i-lucide-key-round",   to: "/access-controller/permissions" },
    ],
  },
]);

// --- Bottom Navigation ------------------------------------------
const bottomNavItems = computed<NavigationMenuItem[]>(() => [
  {
    label: "الإعدادات",
    icon: "i-lucide-settings",
    to: "/settings",
  },
  {
    label: "المساعدة والدعم",
    icon: "i-lucide-circle-help",
    to: "https://github.com/nuxt/ui",
    target: "_blank",
  },
]);

// --- Lifecycle --------------------------------------------------
onMounted(fetchRecords);
</script>
