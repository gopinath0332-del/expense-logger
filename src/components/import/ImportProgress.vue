<template>
  <div class="import-progress-container text-center py-5 px-3">
    <div class="spinner-border text-danger mb-3" style="width: 3rem; height: 3rem;" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>

    <h5 class="fw-bold mb-2">Saving Transactions</h5>
    <p class="text-muted mb-3">
      Saving {{ progress.current }} of {{ progress.total }} transactions...
    </p>

    <div class="progress progress-bar-wrapper mx-auto">
      <div
        class="progress-bar bg-danger progress-bar-striped progress-bar-animated"
        role="progressbar"
        :style="{ width: `${percentage}%` }"
        :aria-valuenow="percentage"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        {{ percentage }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ImportProgress } from '@/types/pdfImport'

const props = defineProps<{
  progress: ImportProgress
}>()

const percentage = computed(() => {
  if (props.progress.total === 0) return 0
  return Math.round((props.progress.current / props.progress.total) * 100)
})
</script>

<style scoped>
.import-progress-container {
  max-width: 480px;
  margin: 0 auto;
}

.progress-bar-wrapper {
  height: 1.25rem;
  border-radius: 1rem;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
