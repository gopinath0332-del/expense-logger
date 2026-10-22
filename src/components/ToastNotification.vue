<template>
  <div class="toast-wrapper" :class="`toast-${type}`" role="alert" aria-live="polite">
    <div class="toast-content">
      <i :class="iconClass" class="toast-icon"></i>
      <span class="toast-message">{{ message }}</span>
    </div>
    <button class="toast-close" @click="$emit('dismiss')" aria-label="Dismiss">
      <i class="bi bi-x-lg"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number // auto-dismiss ms; 0 = never auto-dismiss
}>()

const emit = defineEmits<{ dismiss: [] }>()

const iconClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bi bi-check-circle-fill'
    case 'error':
      return 'bi bi-exclamation-circle-fill'
    case 'warning':
      return 'bi bi-exclamation-triangle-fill'
    default:
      return 'bi bi-info-circle-fill'
  }
})

let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  const delay = props.duration !== undefined ? props.duration : 4000
  if (delay > 0) {
    timer = setTimeout(() => emit('dismiss'), delay)
  }
})

onUnmounted(() => {
  if (timer !== null) clearTimeout(timer)
})
</script>

<style scoped>
.toast-wrapper {
  position: fixed;
  bottom: 5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  min-width: 280px;
  max-width: calc(100vw - 2rem);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.toast-success {
  background-color: #198754;
  color: white;
}

.toast-error {
  background-color: #dc3545;
  color: white;
}

.toast-warning {
  background-color: #ffc107;
  color: #212529;
}

.toast-info {
  background-color: #0dcaf0;
  color: #212529;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.toast-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.toast-message {
  font-size: 0.9rem;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  opacity: 0.8;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.toast-close:hover {
  opacity: 1;
}
</style>
