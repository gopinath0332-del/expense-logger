<template>
  <div class="upload-zone-container">
    <div
      class="drop-zone"
      :class="{ 'is-dragging': isDragging }"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
      role="button"
      tabindex="0"
      @keydown.enter="triggerFileInput"
      @keydown.space.prevent="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".pdf,application/pdf"
        class="file-input-hidden"
        @change="onFileChange"
      />

      <div class="drop-zone-icon">
        <i class="bi bi-file-earmark-pdf"></i>
      </div>

      <h5 class="drop-zone-title">Upload Bank Statement</h5>
      <p class="drop-zone-subtitle">
        Drag and drop your Axis Bank PDF statement here, or <span class="browse-link">browse</span>
      </p>

      <div class="file-badges">
        <span class="badge bg-light text-secondary border">PDF only</span>
        <span class="badge bg-light text-secondary border">Max 20 MB</span>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="localError" class="alert alert-danger mt-3 d-flex align-items-center" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <div>{{ localError }}</div>
      <button type="button" class="btn-close ms-auto" @click="localError = null" aria-label="Close"></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  'file-selected': [file: File]
  error: [message: string]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const localError = ref<string | null>(null)

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onDragOver() {
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    validateAndSelect(files[0])
  }
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    validateAndSelect(files[0])
  }
  // Reset input so same file can be re-selected if needed
  target.value = ''
}

function validateAndSelect(file: File) {
  localError.value = null

  // Validate MIME type or file extension
  const isPdfType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdfType) {
    const msg = 'Invalid file type. Please upload a PDF statement.'
    localError.value = msg
    emit('error', msg)
    return
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    const msg = 'File size exceeds 20 MB limit.'
    localError.value = msg
    emit('error', msg)
    return
  }

  emit('file-selected', file)
}
</script>

<style scoped>
.upload-zone-container {
  padding: 1.5rem;
}

.drop-zone {
  border: 2px dashed #ced4da;
  border-radius: 1rem;
  background-color: #ffffff;
  padding: 3rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.drop-zone:hover,
.drop-zone.is-dragging {
  border-color: #dc3545;
  background-color: #fff8f8;
  box-shadow: 0 4px 16px rgba(220, 53, 69, 0.08);
}

.drop-zone-icon {
  font-size: 3rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.drop-zone-title {
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.5rem;
}

.drop-zone-subtitle {
  color: #6c757d;
  font-size: 0.95rem;
  margin-bottom: 1.25rem;
}

.browse-link {
  color: #dc3545;
  font-weight: 600;
  text-decoration: underline;
}

.file-badges {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.file-input-hidden {
  display: none;
}
</style>
