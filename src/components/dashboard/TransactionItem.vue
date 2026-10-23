<template>
  <div
    class="transaction-item d-flex justify-content-between align-items-center p-3 border-bottom"
    @click="emit('select', transaction)"
    role="button"
    :aria-label="`Edit ${transaction.category} transaction of ₹${formatNumber(transaction.amount)}`"
  >
    <div class="transaction-details">
      <div class="category-info d-flex flex-column">
        <span class="category text-muted small">{{ transaction.category }}</span>
        <span class="subcategory text-muted small">{{ transaction.subcategory }}</span>
      </div>
    </div>
    <div class="payment-description text-center">
      <div class="payment-method small text-muted">{{ transaction.account }}</div>
      <div v-if="transaction.description" class="description small">{{ transaction.description }}</div>
    </div>
    <div class="d-flex align-items-center gap-2">
      <div
        class="amount fw-bold"
        :class="{
          'text-danger': transaction.type === 'expense',
          'text-success': transaction.type === 'income',
          'text-primary': transaction.type === 'transfer'
        }"
      >
        ₹ {{ formatNumber(transaction.amount) }}
      </div>
      <i class="bi bi-chevron-right edit-chevron"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '@/types/transaction'

interface Props {
  transaction: Transaction
  formatNumber: (amount: number) => string
}

defineProps<Props>()
const emit = defineEmits<{ select: [transaction: Transaction] }>()
</script>

<style scoped>
.transaction-item {
  background-color: white;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.transaction-item:hover {
  background-color: #fff5f6;
}

.transaction-item:active {
  background-color: #ffe0e3;
}

.category {
  font-weight: 500;
}

.edit-chevron {
  color: #dee2e6;
  font-size: 0.75rem;
  transition: color 0.15s ease, transform 0.15s ease;
  flex-shrink: 0;
}

.transaction-item:hover .edit-chevron {
  color: #dc3545;
  transform: translateX(2px);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .transaction-item {
    padding: 0.75rem !important;
  }
}
</style>
