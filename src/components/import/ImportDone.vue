<template>
  <div class="import-done-container text-center py-5 px-3">
    <div class="success-icon-wrapper mb-3 mx-auto">
      <i class="bi bi-check-circle-fill text-success"></i>
    </div>

    <h4 class="fw-bold mb-2">Import Complete!</h4>
    <p class="text-muted mb-4">
      Successfully saved <strong class="text-dark">{{ savedCount }}</strong> transaction(s) to your account.
      <span v-if="skippedCount > 0" class="d-block mt-1 text-secondary">
        ({{ skippedCount }} duplicate transaction(s) were skipped)
      </span>
    </p>

    <div class="d-flex flex-column gap-2 max-w-sm mx-auto">
      <button class="btn btn-danger py-2 fw-semibold" @click="$emit('go-to-dashboard')">
        <i class="bi bi-house-door me-2"></i>Go to Dashboard
      </button>

      <button class="btn btn-outline-secondary py-2" @click="$emit('import-more')">
        <i class="bi bi-file-earmark-plus me-2"></i>Import Another Statement
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  savedCount: number
  skippedCount: number
}>()

defineEmits<{
  'go-to-dashboard': []
  'import-more': []
}>()
</script>

<style scoped>
.import-done-container {
  max-width: 480px;
  margin: 0 auto;
}

.success-icon-wrapper {
  font-size: 4rem;
  line-height: 1;
}

.max-w-sm {
  max-width: 320px;
}
</style>
