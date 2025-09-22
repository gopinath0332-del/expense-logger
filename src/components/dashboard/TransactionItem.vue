<template>
  <div class="transaction-item d-flex justify-content-between align-items-center p-3 border-bottom">
    <div class="transaction-details">
      <div class="category-info d-flex flex-column">
        <span class="category text-muted small">{{ transaction.category }}</span>
        <span class="subcategory text-muted small">{{ transaction.subcategory }}</span>
      </div>
    </div>
    <div class="payment-description text-center">
      <div class="payment-method small text-muted">{{ transaction.paymentMethod }}</div>
      <div v-if="transaction.description" class="description small">{{ transaction.description }}</div>
    </div>
    <div class="amount text-danger">
      ₹ {{ formatNumber(transaction.amount) }}
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
</script>

<style scoped>
.transaction-item {
  background-color: white;
}

.transaction-item:hover {
  background-color: #f8f9fa;
}

.category {
  font-weight: 500;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .transaction-item {
    padding: 0.75rem !important;
  }
}
</style>
