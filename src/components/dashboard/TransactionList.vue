<template>
  <div class="transaction-list">
    <TransactionDayGroup
      v-for="day in transactions"
      :key="day.date"
      :day="day"
      :formatNumber="formatNumber"
    />
  </div>
</template>

<script setup lang="ts">
import type { TransactionDay } from '@/types/transaction'
import TransactionDayGroup from './TransactionDayGroup.vue'

interface Props {
  transactions: TransactionDay[]
  formatNumber: (amount: number) => string
}

defineProps<Props>()
</script>
