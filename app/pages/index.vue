<template>
  <!-- <AppTable></AppTable> -->
  <h1>الصفحة الرئيسية</h1>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
  title: "الصفحة الرئيسية ",
  auth: true,
  middleware: "auth" as any,
});
</script>
