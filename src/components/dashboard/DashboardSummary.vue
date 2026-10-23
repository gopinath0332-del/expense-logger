<template>
  <div class="summary-section">
    <div class="row g-0 text-center">
      <div class="col-4">
        <div class="summary-card">
          <div class="summary-label">Income</div>
          <div class="summary-val val-income">{{ formatCurrency(summary.income) }}</div>
        </div>
      </div>
      <div class="col-4">
        <div class="summary-card">
          <div class="summary-label">Exp.</div>
          <div class="summary-val val-expense">{{ formatCurrency(summary.expenses) }}</div>
        </div>
      </div>
      <div class="col-4">
        <div class="summary-card">
          <div class="summary-label">Total</div>
          <div class="summary-val val-total">{{ formatCurrency(summary.balance) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ summary: { income: number, expenses: number, balance: number }, formatCurrency: (n: number) => string }>()
</script>

<style scoped>
.summary-section {
  background-color: #ffffff;
  border-bottom: 1px solid #edf2f7;
  padding: 0.6rem 0.5rem;
}

.summary-card {
  padding: 0.25rem;
}

.summary-label {
  font-size: 0.8rem;
  color: #8e8e93;
  margin-bottom: 0.2rem;
}

.summary-val {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.2;
}

.val-income {
  color: #3880ff;
}

.val-expense {
  color: #ea5455;
}

.val-total {
  color: #1a1a1a;
}
</style>
