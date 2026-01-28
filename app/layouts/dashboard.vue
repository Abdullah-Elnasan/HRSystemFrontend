<template>
  <UDashboardGroup>
    <AppSidebar> </AppSidebar>
    <UDashboardPanel>
      <template #header>
        <AppNavbar></AppNavbar>
      </template>
      <template #body>
        <UDashboardSearch />
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>


