<template>
  <div class="day-group">
    <!-- Day Header -->
    <div class="day-header d-flex justify-content-between align-items-center p-3 bg-light">
      <div class="d-flex align-items-center">
        <div class="date-number me-2">{{ day.dateNumber }}</div>
        <div class="day-badge badge bg-secondary">{{ day.dayName }}</div>
      </div>
      <div class="day-summary d-flex gap-3">
        <span class="text-primary fw-bold">₹ {{ formatNumber(day.income) }}</span>
        <span class="text-danger fw-bold">₹ {{ formatNumber(day.expenses) }}</span>
      </div>
    </div>

    <!-- Transactions for the day -->
    <TransactionItem
      v-for="transaction in day.items"
      :key="transaction.id"
      :transaction="transaction"
      :formatNumber="formatNumber"
    />
  </div>
</template>

<script setup lang="ts">
import type { TransactionDay } from '@/types/transaction'
import TransactionItem from './TransactionItem.vue'

interface Props {
  day: TransactionDay
  formatNumber: (amount: number) => string
}

defineProps<Props>()
</script>

<style scoped>
.day-header {
  border-bottom: 1px solid #e9ecef;
}

.date-number {
  font-size: 1.5rem;
  font-weight: bold;
}

.day-badge {
  font-size: 0.75rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .day-header {
    padding: 0.75rem !important;
  }
}
</style>
