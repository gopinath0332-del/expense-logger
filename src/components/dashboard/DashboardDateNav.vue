<template>
  <div class="date-nav d-flex justify-content-between align-items-center p-3">
    <i class="bi bi-chevron-left fs-5"></i>
    <h6 class="mb-0 fw-semibold">{{ currentMonth }}</h6>
    <i class="bi bi-chevron-right fs-5"></i>
  </div>
</template>

<script setup lang="ts">
defineProps<{ currentMonth: string }>()
</script>
