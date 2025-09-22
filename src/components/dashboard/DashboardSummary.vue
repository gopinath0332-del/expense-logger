<template>
  <div class="summary-section p-3">
    <div class="row text-center">
      <div class="col-4">
        <div class="summary-card">
          <div class="text-muted small">Income</div>
          <div class="fw-bold text-primary">{{ formatCurrency(summary.income) }}</div>
        </div>
      </div>
      <div class="col-4">
        <div class="summary-card">
          <div class="text-muted small">Exp.</div>
          <div class="fw-bold text-danger">{{ formatCurrency(summary.expenses) }}</div>
        </div>
      </div>
      <div class="col-4">
        <div class="summary-card">
          <div class="text-muted small">Balance</div>
          <div class="fw-bold">{{ formatCurrency(summary.balance) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ summary: { income: number, expenses: number, balance: number }, formatCurrency: (n: number) => string }>()
</script>
