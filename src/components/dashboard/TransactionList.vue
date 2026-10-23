<template>
  <div class="transaction-list">
    <TransactionDayGroup
      v-for="day in transactions"
      :key="day.date"
      :day="day"
      :formatNumber="formatNumber"
      @select="emit('select', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { TransactionDay, Transaction } from '@/types/transaction'
import TransactionDayGroup from './TransactionDayGroup.vue'

interface Props {
  transactions: TransactionDay[]
  formatNumber: (amount: number) => string
}

defineProps<Props>()
const emit = defineEmits<{ select: [transaction: Transaction] }>()
</script>
