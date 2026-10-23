<template>
  <div class="step-indicator">
    <div
      v-for="(s, index) in steps"
      :key="s.key"
      class="step-item"
      :class="{
        active: s.key === step,
        completed: isCompleted(s.key),
      }"
    >
      <div class="step-circle">
        <i v-if="isCompleted(s.key)" class="bi bi-check-lg"></i>
        <span v-else>{{ index + 1 }}</span>
      </div>
      <span class="step-label">{{ s.label }}</span>
      <div v-if="index < steps.length - 1" class="step-connector"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImportStep } from '@/types/pdfImport'

const props = defineProps<{
  step: ImportStep
}>()

const steps: { key: ImportStep; label: string }[] = [
  { key: 'upload', label: 'Upload' },
  { key: 'reviewing', label: 'Review' },
  { key: 'done', label: 'Done' },
]

const stepOrder: ImportStep[] = ['upload', 'parsing', 'reviewing', 'saving', 'done']

function isCompleted(stepKey: ImportStep): boolean {
  const currentIndex = stepOrder.indexOf(props.step)
  const stepIndex = stepOrder.indexOf(stepKey)
  return stepIndex < currentIndex
}
</script>

<style scoped>
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 1rem 0.75rem;
  background: white;
  border-bottom: 1px solid #e9ecef;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #adb5bd;
  background: white;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.step-label {
  font-size: 0.8rem;
  color: #adb5bd;
  font-weight: 500;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.step-connector {
  width: 2rem;
  height: 2px;
  background: #dee2e6;
  margin: 0 0.25rem;
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.step-item.active .step-circle {
  border-color: #dc3545;
  color: #dc3545;
  background: #fff5f5;
}

.step-item.active .step-label {
  color: #dc3545;
}

.step-item.completed .step-circle {
  border-color: #198754;
  background: #198754;
  color: white;
}

.step-item.completed .step-label {
  color: #198754;
}

.step-item.completed + .step-item .step-connector,
.step-item.completed .step-connector {
  background: #198754;
}
</style>
