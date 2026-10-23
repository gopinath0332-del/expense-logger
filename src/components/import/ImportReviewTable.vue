<template>
  <div class="review-table-container">
    <!-- Summary Header Cards -->
    <div class="row g-2 mb-3">
      <div class="col-4">
        <div class="card p-2 text-center bg-white border">
          <small class="text-muted d-block">Total</small>
          <span class="fw-bold">{{ transactions.length }}</span>
        </div>
      </div>
      <div class="col-4">
        <div class="card p-2 text-center bg-white border">
          <small class="text-muted d-block">To Save</small>
          <span class="fw-bold text-success">{{ toSaveCount }}</span>
        </div>
      </div>
      <div class="col-4">
        <div class="card p-2 text-center bg-white border">
          <small class="text-muted d-block">Duplicate</small>
          <span class="fw-bold text-warning">{{ duplicateCount }}</span>
        </div>
      </div>
    </div>

    <!-- Info note on duplicates -->
    <div v-if="duplicateCount > 0" class="alert alert-warning py-2 px-3 small d-flex align-items-center mb-3">
      <i class="bi bi-info-circle me-2"></i>
      <span>{{ duplicateCount }} transaction(s) match existing records and will be skipped automatically.</span>
    </div>

    <!-- Transaction cards list for mobile friendliness + table structure -->
    <div class="transaction-cards-list">
      <div
        v-for="tx in transactions"
        :key="tx.importId"
        class="transaction-review-card card mb-3 border shadow-sm"
        :class="{ 'border-warning bg-light-warning': tx.isDuplicate }"
      >
        <div class="card-header bg-white d-flex align-items-center justify-content-between py-2">
          <div class="d-flex align-items-center gap-2">
            <span
              class="badge"
              :class="tx.type === 'income' ? 'bg-success' : 'bg-danger'"
            >
              {{ tx.type.toUpperCase() }}
            </span>
            <span v-if="tx.isDuplicate" class="badge bg-warning text-dark">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>Duplicate (Skipped)
            </span>
          </div>

          <button
            type="button"
            class="btn btn-sm btn-outline-danger border-0 delete-btn"
            title="Remove transaction"
            @click="$emit('remove', tx.importId)"
          >
            <i class="bi bi-trash3"></i>
          </button>
        </div>

        <div class="card-body p-3">
          <div class="row g-2">
            <!-- Date Field -->
            <div class="col-6 col-md-3">
              <label class="form-label small text-muted mb-1">Date</label>
              <input
                type="date"
                class="form-control form-control-sm"
                :value="tx.date"
                @input="onFieldChange(tx.importId, 'date', ($event.target as HTMLInputElement).value)"
              />
            </div>

            <!-- Amount Field -->
            <div class="col-6 col-md-3">
              <label class="form-label small text-muted mb-1">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                class="form-control form-control-sm"
                :value="tx.amount"
                @input="onFieldChange(tx.importId, 'amount', parseFloat(($event.target as HTMLInputElement).value) || 0)"
              />
            </div>

            <!-- Type Selector -->
            <div class="col-6 col-md-3">
              <label class="form-label small text-muted mb-1">Type</label>
              <select
                class="form-select form-select-sm"
                :value="tx.type"
                @change="onFieldChange(tx.importId, 'type', ($event.target as HTMLSelectElement).value as 'income' | 'expense' | 'transfer')"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            <!-- Account Selector -->
            <div class="col-6 col-md-3">
              <label class="form-label small text-muted mb-1">Account</label>
              <select
                class="form-select form-select-sm"
                :value="tx.account"
                @change="onFieldChange(tx.importId, 'account', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                  {{ acc.label }}
                </option>
              </select>
            </div>

            <!-- Description Field -->
            <div class="col-12 col-md-6">
              <label class="form-label small text-muted mb-1">Description</label>
              <input
                type="text"
                class="form-control form-control-sm"
                :value="tx.description"
                placeholder="Description"
                @input="onFieldChange(tx.importId, 'description', ($event.target as HTMLInputElement).value)"
              />
            </div>

            <!-- Category Selector -->
            <div class="col-12 col-md-6">
              <label class="form-label small text-muted mb-1">Category</label>
              <select
                class="form-select form-select-sm"
                :value="getSelectedCategoryCombined(tx)"
                @change="onCategoryCombinedChange(tx.importId, ($event.target as HTMLSelectElement).value)"
              >
                <template v-for="cat in categories" :key="cat.id">
                  <option :value="cat.id">{{ getCategoryIcon(cat.label) }} {{ cat.label }}</option>
                  <option
                    v-for="sub in cat.subcategories || []"
                    :key="`${cat.id}:${sub.id}`"
                    :value="`${cat.id}:${sub.id}`"
                  >
                    &nbsp;&nbsp;↳ {{ getCategoryIcon(sub.label || cat.label) }} {{ cat.label }} > {{ sub.label }}
                  </option>
                </template>
              </select>
            </div>

            <!-- Raw narration preview (collapsible or small) -->
            <div class="col-12 mt-1">
              <details class="text-muted small">
                <summary class="cursor-pointer">Raw Statement Narration</summary>
                <div class="p-2 bg-light rounded mt-1 text-break font-monospace small">
                  {{ tx.rawNarration }}
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ImportedTransaction } from '@/types/pdfImport'
import type { CategoryOption } from '@/types/category'
import type { AccountOption } from '@/types/account'
import { getCategoryIcon } from '@/utils/categoryMetadata'

const props = defineProps<{
  transactions: ImportedTransaction[]
  categories: CategoryOption[]
  accounts: AccountOption[]
}>()

const emit = defineEmits<{
  update: [importId: string, patch: Partial<ImportedTransaction>]
  remove: [importId: string]
}>()

const duplicateCount = computed(() => {
  return props.transactions.filter((t) => t.isDuplicate).length
})

const toSaveCount = computed(() => {
  return props.transactions.filter((t) => !t.isDuplicate).length
})

function onFieldChange<K extends keyof ImportedTransaction>(
  importId: string,
  field: K,
  value: ImportedTransaction[K]
) {
  emit('update', importId, { [field]: value })
}

function getSelectedCategoryCombined(tx: ImportedTransaction): string {
  if (tx.subcategory) {
    return `${tx.category}:${tx.subcategory}`
  }
  return tx.category
}

function onCategoryCombinedChange(importId: string, combinedValue: string) {
  if (combinedValue.includes(':')) {
    const [catId, subId] = combinedValue.split(':')
    emit('update', importId, { category: catId, subcategory: subId })
  } else {
    emit('update', importId, { category: combinedValue, subcategory: '' })
  }
}
</script>

<style scoped>
.review-table-container {
  padding: 1rem;
  padding-bottom: 6rem; /* space for sticky save button */
}

.bg-light-warning {
  background-color: #fffdf5;
}

.cursor-pointer {
  cursor: pointer;
}

.delete-btn {
  padding: 0.25rem 0.5rem;
}

.delete-btn:hover {
  background-color: #fee2e2;
}
</style>
