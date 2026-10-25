<template>
  <div class="budget-overview-container">
    <!-- Remaining Header Card -->
    <div class="remaining-card p-3 mb-2 bg-white">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <div class="remaining-label text-muted small fw-medium">Remaining(Monthly)</div>
          <div class="remaining-val fw-bold" :class="{ 'text-danger': overall.totalRemaining < 0 }">
            ₹ {{ formatNumber(overall.totalRemaining) }}
          </div>
        </div>

        <button
          type="button"
          class="btn btn-outline-secondary budget-setting-btn d-flex align-items-center gap-1"
          @click="emit('openSettings')"
        >
          <span>Budget Setting</span>
          <i class="bi bi-chevron-right fs-7"></i>
        </button>
      </div>
    </div>

    <!-- Monthly Overall Progress Row -->
    <div class="monthly-summary-card p-3 mb-2 bg-white border-bottom">
      <div class="d-flex align-items-center mb-1">
        <!-- Left: Monthly Total Budget -->
        <div class="budget-meta me-3">
          <div class="meta-label text-muted small">Monthly</div>
          <div class="meta-amount fw-bold">
            ₹ {{ formatNumber(overall.totalBudget) }}
          </div>
        </div>

        <!-- Right: Progress Bar with Floating 'Today' Bubble -->
        <div class="flex-grow-1">
          <!-- Floating 'Today' Indicator (Only for current month) -->
          <div class="today-marker-container">
            <div
              v-if="overall.monthProgressPercentage > 0 && overall.monthProgressPercentage < 100"
              class="today-bubble"
              :style="{ left: `${overall.monthProgressPercentage}%` }"
            >
              Today
            </div>
          </div>

          <!-- Progress Bar Track -->
          <div class="d-flex align-items-center gap-2">
            <div class="progress flex-grow-1 custom-progress-track">
              <div
                class="progress-bar custom-progress-fill"
                :class="{
                  'bg-primary-custom': overall.percentage <= 100,
                  'bg-danger-custom': overall.percentage > 100
                }"
                role="progressbar"
                :style="{ width: `${Math.min(100, overall.percentage)}%` }"
                :aria-valuenow="overall.percentage"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <!-- Percentage Text -->
            <div class="progress-percent-label fw-bold">
              {{ Math.round(overall.percentage) }}%
            </div>
          </div>

          <!-- Bottom: Spent and Remaining -->
          <div class="d-flex justify-content-between mt-1 sub-values">
            <span
              class="spent-val"
              :class="{
                'text-primary-custom': overall.percentage <= 100,
                'text-danger-custom': overall.percentage > 100
              }"
            >
              {{ formatNumber(overall.totalSpent) }}
            </span>
            <span
              class="rem-val"
              :class="{ 'text-danger-custom': overall.totalRemaining < 0 }"
            >
              {{ formatNumber(overall.totalRemaining) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State if no categories are budgeted -->
    <div v-if="budgetedCategoryList.length === 0" class="text-center py-5 bg-white px-3">
      <i class="bi bi-wallet2 text-muted fs-1 d-block mb-2"></i>
      <h6 class="fw-bold">No Monthly Budget Set</h6>
      <p class="text-muted small mb-3">
        Set up category budgets to track your spending and monitor your monthly progress.
      </p>
      <button
        type="button"
        class="btn btn-danger px-4 py-2 fw-semibold"
        @click="emit('openSettings')"
      >
        Set Up Budget
      </button>
    </div>

    <!-- Per-Category Budget Progress Rows -->
    <div v-else class="category-budget-list bg-white">
      <div
        v-for="cat in budgetedCategoryList"
        :key="cat.categoryId"
        class="category-budget-item px-3 py-3 border-bottom"
        @click="emit('openSettings')"
      >
        <div class="d-flex align-items-center">
          <!-- Left: Category Name and Budget -->
          <div class="cat-left me-3">
            <div class="cat-name text-muted small text-truncate">
              {{ cat.categoryName }}
            </div>
            <div class="cat-budget fw-bold text-nowrap">
              ₹ {{ formatNumber(cat.budget) }}
            </div>
          </div>

          <!-- Right: Progress bar and values -->
          <div class="cat-right flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-1">
              <div class="progress flex-grow-1 custom-progress-track">
                <div
                  class="progress-bar custom-progress-fill"
                  :class="{
                    'bg-primary-custom': !cat.isOverBudget,
                    'bg-danger-custom': cat.isOverBudget
                  }"
                  role="progressbar"
                  :style="{ width: `${Math.min(100, cat.percentage)}%` }"
                  :aria-valuenow="cat.percentage"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <div class="progress-percent-label fw-bold">
                {{ Math.round(cat.percentage) }}%
              </div>
            </div>

            <div class="d-flex justify-content-between sub-values">
              <span
                class="spent-val"
                :class="{
                  'text-primary-custom': !cat.isOverBudget,
                  'text-danger-custom': cat.isOverBudget
                }"
              >
                {{ formatNumber(cat.spent) }}
              </span>
              <span
                class="rem-val"
                :class="{ 'text-danger-custom': cat.remaining < 0 }"
              >
                {{ formatNumber(cat.remaining) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CategoryBudgetProgress, OverallBudgetProgress } from '@/types/budget'

const props = defineProps<{
  overall: OverallBudgetProgress
  categories: CategoryBudgetProgress[]
  formatNumber: (amount: number) => string
}>()

const emit = defineEmits<{
  openSettings: []
}>()

// List of categories that have a budget set (> 0)
const budgetedCategoryList = computed(() => {
  return props.categories.filter(c => c.budget > 0)
})
</script>

<style scoped>
.budget-overview-container {
  background-color: #f8f9fa;
}

.remaining-card {
  border-bottom: 1px solid #edf2f7;
}

.remaining-label {
  color: #8e8e93;
  font-size: 0.85rem;
  letter-spacing: -0.2px;
}

.remaining-val {
  font-size: 1.75rem;
  color: #1a1a1a;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.budget-setting-btn {
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.35rem 0.75rem;
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #495057;
}

.budget-setting-btn:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
  color: #212529;
}

.monthly-summary-card {
  background-color: white;
}

.budget-meta {
  width: 110px;
  flex-shrink: 0;
}

.meta-label {
  font-size: 0.8rem;
  color: #8e8e93;
}

.meta-amount {
  font-size: 0.95rem;
  color: #212529;
}

.today-marker-container {
  position: relative;
  height: 20px;
  margin-bottom: 2px;
}

.today-bubble {
  position: absolute;
  transform: translateX(-50%);
  background-color: #8e8e93;
  color: white;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 6px;
  white-space: nowrap;
}

.today-bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: #8e8e93 transparent transparent transparent;
}

.custom-progress-track {
  height: 14px;
  background-color: #f1f3f5;
  border-radius: 4px;
}

.custom-progress-fill {
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bg-primary-custom {
  background-color: #5b9ffc !important;
}

.text-primary-custom {
  color: #3880ff !important;
}

.bg-danger-custom {
  background-color: #ff6b6b !important;
}

.text-danger-custom {
  color: #ff6b6b !important;
}

.progress-percent-label {
  font-size: 0.85rem;
  color: #212529;
  min-width: 38px;
  text-align: right;
}

.sub-values {
  font-size: 0.8rem;
  font-weight: 500;
}

.rem-val {
  color: #212529;
}

.category-budget-item {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.category-budget-item:hover,
.category-budget-item:active {
  background-color: #f8f9fa;
}

.cat-left {
  width: 110px;
  flex-shrink: 0;
}

.cat-name {
  font-size: 0.85rem;
}

.cat-budget {
  font-size: 0.95rem;
  color: #212529;
}
</style>
