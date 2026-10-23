<template>
  <div class="import-pdf-container">
    <!-- Header -->
    <div class="header">
      <button class="btn btn-link back-btn" @click="handleBack" aria-label="Go back">
        <i class="bi bi-chevron-left"></i>
      </button>
      <h5 class="header-title">Import Statement</h5>
      <div style="width: 24px"></div>
    </div>

    <!-- Step Indicator -->
    <ImportStepIndicator :step="step" />

    <!-- Step 1: Upload -->
    <div v-if="step === 'upload' || step === 'parsing'" class="content-section">
      <div v-if="step === 'parsing'" class="text-center py-5">
        <div class="spinner-border text-danger mb-3" style="width: 3rem; height: 3rem" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <h5 class="fw-semibold">Extracting Statement Data</h5>
        <p class="text-muted">Parsing pages from {{ fileName }}...</p>
      </div>

      <PdfUploadZone v-else @file-selected="importFile" @error="onUploadError" />
    </div>

    <!-- Step 2: Review Table -->
    <div v-else-if="step === 'reviewing'" class="content-section">
      <div class="px-3 pt-3 d-flex align-items-center justify-content-between">
        <div>
          <span class="badge bg-secondary mb-1">
            <i class="bi bi-file-earmark-pdf me-1"></i>{{ fileName }}
          </span>
          <p class="text-muted small mb-0">Review and edit before saving</p>
        </div>
        <button class="btn btn-sm btn-outline-secondary" @click="reset">
          <i class="bi bi-arrow-counterclockwise me-1"></i>Start Over
        </button>
      </div>

      <ImportReviewTable
        :transactions="transactions"
        :categories="categories"
        :accounts="accounts"
        @update="updateTransaction"
        @remove="removeTransaction"
      />

      <!-- Sticky Save Footer -->
      <div class="save-footer fixed-bottom bg-white border-top p-3 shadow-lg">
        <div class="d-flex gap-2 max-w-md mx-auto">
          <button class="btn btn-outline-secondary flex-1" @click="reset">
            Cancel
          </button>
          <button
            class="btn btn-danger flex-2 fw-semibold"
            :disabled="toSaveCount === 0"
            @click="saveAll"
          >
            Save {{ toSaveCount }} Transaction{{ toSaveCount === 1 ? '' : 's' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3: Saving Progress -->
    <div v-else-if="step === 'saving'" class="content-section">
      <ImportProgress :progress="progress" />
    </div>

    <!-- Step 4: Done -->
    <div v-else-if="step === 'done'" class="content-section">
      <ImportDone
        :saved-count="savedCount"
        :skipped-count="skippedCount"
        @go-to-dashboard="router.push({ name: 'dashboard' })"
        @import-more="reset"
      />
    </div>

    <!-- Toast Notification -->
    <ToastNotification
      v-if="error"
      :message="error"
      type="error"
      @dismiss="error = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ImportStepIndicator from '@/components/import/ImportStepIndicator.vue'
import PdfUploadZone from '@/components/import/PdfUploadZone.vue'
import ImportReviewTable from '@/components/import/ImportReviewTable.vue'
import ImportProgress from '@/components/import/ImportProgress.vue'
import ImportDone from '@/components/import/ImportDone.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import { usePdfImport } from '@/composables/usePdfImport'

const router = useRouter()
const {
  step,
  transactions,
  categories,
  accounts,
  error,
  progress,
  savedCount,
  skippedCount,
  fileName,
  loadOptions,
  importFile,
  updateTransaction,
  removeTransaction,
  saveAll,
  reset
} = usePdfImport()

const toSaveCount = computed(() => {
  return transactions.value.filter((t) => !t.isDuplicate).length
})

onMounted(() => {
  loadOptions()
})

function handleBack() {
  if (step.value === 'reviewing') {
    reset()
  } else {
    router.push({ name: 'dashboard' })
  }
}

function onUploadError(message: string) {
  error.value = message
}
</script>

<style scoped>
.import-pdf-container {
  max-width: 100%;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid #e9ecef;
}

.back-btn {
  color: #6c757d;
  font-size: 1.25rem;
  padding: 0;
}

.header-title {
  margin: 0;
  font-weight: 600;
  color: #212529;
}

.content-section {
  padding-bottom: 2rem;
}

.save-footer {
  z-index: 1000;
}

.max-w-md {
  max-width: 540px;
}

.flex-1 {
  flex: 1;
}

.flex-2 {
  flex: 2;
}
</style>
