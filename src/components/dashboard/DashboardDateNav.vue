<template>
  <div class="date-nav d-flex justify-content-between align-items-center p-3">
    <i class="bi bi-chevron-left fs-5 cursor-pointer" @click="$emit('previousMonth')"></i>
    <h6 class="mb-0 fw-semibold">{{ currentMonth }}</h6>
    <i class="bi bi-chevron-right fs-5 cursor-pointer" @click="$emit('nextMonth')"></i>
  </div>
</template>

<script setup lang="ts">
defineProps<{ currentMonth: string }>()

defineEmits<{
  previousMonth: []
  nextMonth: []
}>()
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  color: #6c757d;
  transition: color 0.2s ease;
}

.cursor-pointer:hover {
  color: #dc3545;
}
</style>
