<template>
  <div
    class="transaction-item"
    @click="emit('select', transaction)"
    role="button"
    :aria-label="`Edit ${transaction.category} transaction of ₹${formatNumber(transaction.amount)}`"
  >
    <!-- Left: Category + Subcategory -->
    <div class="col-category">
      <span class="category">
        <span class="category-icon me-1">{{ getCategoryIcon(transaction.category) }}</span>
        <span>{{ transaction.category }}</span>
      </span>
      <span v-if="transaction.subcategory" class="subcategory">{{ transaction.subcategory }}</span>
    </div>

    <!-- Middle: Description + Account -->
    <div class="col-account">
      <span v-if="transaction.description" class="description-label">{{ transaction.description }}</span>
      <span class="account-label">{{ transaction.account }}</span>
    </div>

    <!-- Right: Amount + chevron -->
    <div class="col-amount">
      <span
        class="amount"
        :class="{
          'amount-expense': transaction.type === 'expense',
          'amount-income': transaction.type === 'income',
          'amount-transfer': transaction.type === 'transfer'
        }"
      >
        ₹ {{ formatNumber(transaction.amount) }}
      </span>
      <i class="bi bi-chevron-right edit-chevron"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '@/types/transaction'
import { getCategoryIcon } from '@/utils/categoryMetadata'

interface Props {
  transaction: Transaction
  formatNumber: (amount: number) => string
}

defineProps<Props>()
const emit = defineEmits<{ select: [transaction: Transaction] }>()
</script>

<style scoped>
.transaction-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: white;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.transaction-item:hover {
  background-color: #fff5f6;
}

.transaction-item:active {
  background-color: #ffe0e3;
}

/* Left column */
.col-category {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.category {
  font-size: 0.875rem;
  font-weight: 600;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  display: flex;
  align-items: center;
}

.category-icon {
  font-size: 1rem;
  line-height: 1;
  flex-shrink: 0;
}

.subcategory {
  font-size: 0.78rem;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* Middle column */
.col-account {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.description-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.account-label {
  font-size: 0.75rem;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* Right column */
.col-amount {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.amount {
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
}

.amount-expense  { color: #dc3545; }
.amount-income   { color: #198754; }
.amount-transfer { color: #0d6efd; }

.edit-chevron {
  color: #dee2e6;
  font-size: 0.7rem;
  transition: color 0.15s ease, transform 0.15s ease;
  flex-shrink: 0;
}

.transaction-item:hover .edit-chevron {
  color: #dc3545;
  transform: translateX(2px);
}

@media (max-width: 576px) {
  .transaction-item {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) auto;
    padding: 0.65rem 0.75rem;
    gap: 0.35rem;
  }
}
</style>
