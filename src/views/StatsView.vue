<template>
  <div class="stats-view-container">
    <!-- Top Bar: Segmented Control & Period Selector -->
    <div class="stats-top-bar d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
      <!-- Segmented Pill: Stats | Budget | Note -->
      <div class="segmented-control">
        <button
          type="button"
          class="segment-btn"
          :class="{ active: activeSegment === 'Stats' }"
          @click="activeSegment = 'Stats'"
        >
          Stats
        </button>
        <button
          type="button"
          class="segment-btn"
          :class="{ active: activeSegment === 'Budget' }"
          @click="activeSegment = 'Budget'"
        >
          Budget
        </button>
        <button
          type="button"
          class="segment-btn"
          :class="{ active: activeSegment === 'Note' }"
          @click="handleOtherSegment('Note')"
        >
          Note
        </button>
      </div>

      <!-- Period Filter Dropdown (M ⌄) -->
      <div class="dropdown">
        <button
          class="period-select-btn d-flex align-items-center gap-1"
          type="button"
          @click="isPeriodDropdownOpen = !isPeriodDropdownOpen"
        >
          <span>{{ periodType }}</span>
          <i class="bi bi-chevron-down fs-7"></i>
        </button>

        <div v-if="isPeriodDropdownOpen" class="period-dropdown-menu">
          <button class="dropdown-item" :class="{ active: periodType === 'M' }" @click="selectPeriod('M')">
            Monthly (M)
          </button>
          <button class="dropdown-item" :class="{ active: periodType === 'W' }" @click="selectPeriod('W')">
            Weekly (W)
          </button>
          <button class="dropdown-item" :class="{ active: periodType === 'Y' }" @click="selectPeriod('Y')">
            Yearly (Y)
          </button>
        </div>
      </div>
    </div>

    <!-- Date Navigation: < Aug 2026 > -->
    <div class="date-nav d-flex justify-content-between align-items-center px-3 py-2">
      <i class="bi bi-chevron-left fs-5 cursor-pointer" @click="goToPreviousMonth"></i>
      <h6 class="mb-0 fw-semibold">{{ currentMonthLabel }}</h6>
      <i class="bi bi-chevron-right fs-5 cursor-pointer" @click="goToNextMonth"></i>
    </div>

    <!-- Income / Expense Type Toggle Tabs -->
    <div class="type-toggle-tabs">
      <button
        class="type-tab-btn"
        :class="{ active: activeType === 'income' }"
        @click="activeType = 'income'"
      >
        Income
      </button>
      <button
        class="type-tab-btn"
        :class="{ active: activeType === 'expense' }"
        @click="activeType = 'expense'"
      >
        Exp. ₹ {{ formatNumber(summary.expenses) }}
      </button>
    </div>

    <!-- Main Content: Stats (Pie Chart & Breakdown) vs Budget -->
    <template v-if="activeSegment === 'Stats'">
      <div class="chart-section py-2">
        <StatsPieChart :slices="categorySlices" @selectCategory="handleSelectCategory" />
      </div>

      <!-- Category Breakdown List -->
      <div class="breakdown-section">
        <div v-if="categorySlices.length === 0" class="text-center text-muted py-4">
          No {{ activeType }} transactions in this period
        </div>
        <div v-else class="category-list">
          <div
            v-for="cat in categorySlices"
            :key="cat.id"
            class="category-row d-flex align-items-center justify-content-between px-3 py-2"
            @click="handleSelectCategory(cat.name)"
          >
            <!-- Left: Percentage badge + Category Name with emoji -->
            <div class="d-flex align-items-center gap-3 min-width-0">
              <span
                class="percent-badge"
                :style="{ backgroundColor: cat.color }"
              >
                {{ Math.round(cat.percent) }}%
              </span>

              <div class="category-info text-truncate">
                <span v-if="cat.emoji" class="category-emoji me-1">{{ cat.emoji }}</span>
                <span class="category-label fw-semibold">{{ cat.name }}</span>
              </div>
            </div>

            <!-- Right: Total Amount -->
            <div class="category-amount fw-bold">
              ₹ {{ formatNumber(cat.total) }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Budget Overview View -->
    <template v-else-if="activeSegment === 'Budget'">
      <BudgetOverview
        :overall="overallBudgetProgress"
        :categories="categoryBudgetList"
        :formatNumber="formatNumber"
        @openSettings="openBudgetSettings"
      />
    </template>

    <!-- Category Details Modal (Transactions in selected category) -->
    <div
      v-if="selectedCategoryName"
      class="cat-modal-backdrop"
      @click.self="selectedCategoryName = null"
    >
      <div class="cat-modal-card">
        <div class="cat-modal-header d-flex justify-content-between align-items-center p-3 border-bottom">
          <div class="d-flex align-items-center gap-2">
            <span v-if="selectedCategoryMeta?.emoji" class="fs-4">{{ selectedCategoryMeta.emoji }}</span>
            <div>
              <h6 class="mb-0 fw-bold">{{ selectedCategoryName }}</h6>
              <small class="text-muted">
                {{ selectedCategoryTransactions.length }} transactions • ₹ {{ formatNumber(selectedCategoryTotal) }}
              </small>
            </div>
          </div>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="selectedCategoryName = null"
          ></button>
        </div>

        <div class="cat-modal-body p-0">
          <TransactionItem
            v-for="transaction in selectedCategoryTransactions"
            :key="transaction.id"
            :transaction="transaction"
            :formatNumber="formatNumber"
            @select="handleEditTransaction"
          />
        </div>
      </div>
    </div>

    <!-- Toast Notification for Budget / Note info -->
    <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      type="info"
      @close="toastMessage = ''"
    />

    <!-- Bottom Navigation -->
    <BottomNavigation :navItems="navItems" :onNavClick="handleNavClick" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BottomNavigation from '@/components/dashboard/BottomNavigation.vue'
import TransactionItem from '@/components/dashboard/TransactionItem.vue'
import StatsPieChart, { type CategorySliceData } from '@/components/stats/StatsPieChart.vue'
import BudgetOverview from '@/components/budget/BudgetOverview.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import { useTransactionData } from '@/composables/useTransactionData'
import { useBudgetData } from '@/composables/useBudgetData'
import { useFormatting } from '@/composables/useFormatting'
import { getCategoryMeta } from '@/utils/categoryMetadata'
import type { NavItem, Transaction } from '@/types/transaction'

const route = useRoute()
const router = useRouter()
const { transactions, summary, loadTransactionsByMonth } = useTransactionData()
const { loadData: loadBudgetData, computeCategoryProgress, computeOverallProgress } = useBudgetData()
const { formatNumber, formatMonthYear } = useFormatting()

// Top bar controls
const activeSegment = ref<'Stats' | 'Budget' | 'Note'>(
  route.query.segment === 'Budget' ? 'Budget' : 'Stats'
)
const periodType = ref<'M' | 'W' | 'Y'>('M')
const isPeriodDropdownOpen = ref(false)
const toastMessage = ref('')

// Date navigation
const currentDate = ref(new Date())
const currentMonthLabel = computed(() => formatMonthYear(currentDate.value))

// Toggle type: 'expense' | 'income'
const activeType = ref<'expense' | 'income'>('expense')

// Category drilldown state
const selectedCategoryName = ref<string | null>(null)

// Bottom Navigation items
const todayLabel = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace('/', '/')
const navItems = ref<NavItem[]>([
  {
    id: 'calendar',
    icon: 'bi bi-journal-text',
    label: todayLabel,
    active: false
  },
  {
    id: 'stats',
    icon: 'bi bi-bar-chart',
    label: 'Stats',
    active: true
  },
  {
    id: 'accounts',
    icon: 'bi bi-database',
    label: 'Accounts',
    active: false
  },
  {
    id: 'more',
    icon: 'bi bi-three-dots',
    label: 'More',
    active: false
  }
])

// Flattened transactions for current period
const flatTransactions = computed<Transaction[]>(() => {
  const result: Transaction[] = []
  transactions.value.forEach(day => {
    day.items.forEach(item => {
      if (item.type === activeType.value) {
        result.push(item)
      }
    })
  })
  return result
})

// Compute category slices for chart and breakdown list
const categorySlices = computed<CategorySliceData[]>(() => {
  const map = new Map<string, number>()
  let grandTotal = 0

  flatTransactions.value.forEach(item => {
    const catName = item.category?.trim() || 'Other'
    const cur = map.get(catName) || 0
    map.set(catName, cur + item.amount)
    grandTotal += item.amount
  })

  if (grandTotal === 0) return []

  // Convert map to sorted array
  const list = Array.from(map.entries()).map(([name, total], index) => {
    const meta = getCategoryMeta(name, index)
    const percent = (total / grandTotal) * 100
    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      emoji: meta.emoji,
      color: meta.color,
      total,
      percent
    }
  })

  // Sort descending by total / percentage
  list.sort((a, b) => b.total - a.total)

  return list
})

// Drilldown details
const selectedCategoryMeta = computed(() => {
  if (!selectedCategoryName.value) return null
  return getCategoryMeta(selectedCategoryName.value)
})

const selectedCategoryTransactions = computed(() => {
  if (!selectedCategoryName.value) return []
  return flatTransactions.value.filter(
    t => (t.category?.trim() || 'Other').toLowerCase() === selectedCategoryName.value!.toLowerCase()
  )
})

const selectedCategoryTotal = computed(() => {
  return selectedCategoryTransactions.value.reduce((acc, cur) => acc + cur.amount, 0)
})

// Budget Computeds
const categoryBudgetList = computed(() => {
  return computeCategoryProgress(transactions.value, activeType.value, false)
})

const overallBudgetProgress = computed(() => {
  return computeOverallProgress(transactions.value, currentDate.value, activeType.value)
})

const openBudgetSettings = () => {
  router.push({ name: 'budgetSetting' })
}

onMounted(() => {
  loadBudgetData(activeType.value)
})

watch(activeType, (newType) => {
  loadBudgetData(newType)
})

// Handlers
const handleOtherSegment = (seg: 'Note') => {
  activeSegment.value = seg
  toastMessage.value = `${seg} feature is coming soon`
  setTimeout(() => {
    activeSegment.value = 'Stats'
  }, 1200)
}

const selectPeriod = (type: 'M' | 'W' | 'Y') => {
  periodType.value = type
  isPeriodDropdownOpen.value = false
}

const goToPreviousMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const goToNextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

const loadCurrentMonthTransactions = () => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  loadTransactionsByMonth(year, month)
}

watch(currentDate, () => {
  loadCurrentMonthTransactions()
}, { immediate: true })

const handleSelectCategory = (categoryName: string) => {
  selectedCategoryName.value = categoryName
}

const handleEditTransaction = (transaction: Transaction) => {
  if (transaction.firestoreId) {
    selectedCategoryName.value = null
    router.push({ name: 'editTransaction', params: { firestoreId: transaction.firestoreId } })
  }
}

const handleNavClick = (item: NavItem) => {
  navItems.value.forEach(navItem => {
    navItem.active = navItem.id === item.id
  })

  if (item.id === 'calendar') {
    router.push({ name: 'dashboard' })
  } else if (item.id === 'more') {
    router.push({ name: 'settings' })
  }
}
</script>

<style scoped>
.stats-view-container {
  max-width: 100%;
  margin: 0 auto;
  background-color: #ffffff;
  min-height: 100vh;
  padding-bottom: 90px;
}

/* Top Segmented Control (Stats | Budget | Note) */
.segmented-control {
  background-color: #ebeef2;
  border-radius: 24px;
  padding: 3px;
  display: inline-flex;
  align-items: center;
}

.segment-btn {
  border: none;
  background: transparent;
  color: #8e8e93;
  padding: 5px 18px;
  border-radius: 20px;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.segment-btn.active {
  background-color: #ffffff;
  color: #ea5455;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Period selector button (M ⌄) */
.period-select-btn {
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.86rem;
  font-weight: 600;
  color: #212529;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.period-select-btn:hover {
  background-color: #f8f9fa;
}

.period-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
  min-width: 130px;
}

.period-dropdown-menu .dropdown-item {
  width: 100%;
  padding: 0.5rem 0.9rem;
  border: none;
  background: none;
  text-align: left;
  font-size: 0.85rem;
  color: #212529;
  cursor: pointer;
}

.period-dropdown-menu .dropdown-item:hover {
  background-color: #f8f9fa;
}

.period-dropdown-menu .dropdown-item.active {
  color: #ea5455;
  font-weight: 600;
}

/* Date navigation */
.date-nav {
  border-bottom: 1px solid #edf2f7;
}

.cursor-pointer {
  cursor: pointer;
  color: #6c757d;
  transition: color 0.15s ease;
}

.cursor-pointer:hover {
  color: #ea5455;
}

/* Income / Exp. Type Tabs */
.type-toggle-tabs {
  display: flex;
  border-bottom: 1px solid #edf2f7;
  background-color: #ffffff;
}

.type-tab-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.65rem 0.5rem;
  font-size: 0.92rem;
  font-weight: 500;
  color: #8e8e93;
  border-bottom: 2.5px solid transparent;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
  text-align: center;
}

.type-tab-btn.active {
  color: #1a1a1a;
  border-bottom-color: #ea5455;
  font-weight: 700;
}

/* Chart section */
.chart-section {
  background-color: #ffffff;
}

/* Category Breakdown List */
.breakdown-section {
  background-color: #ffffff;
  border-top: 1px solid #edf2f7;
  margin-top: 0.5rem;
}

.category-row {
  border-bottom: 1px solid #f3f5f8;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.category-row:hover {
  background-color: #fafbfc;
}

.category-row:active {
  background-color: #f1f3f5;
}

.percent-badge {
  display: inline-block;
  min-width: 44px;
  padding: 3px 6px;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
}

.category-info {
  display: flex;
  align-items: center;
}

.category-emoji {
  font-size: 1.05rem;
}

.category-label {
  font-size: 0.92rem;
  color: #212529;
}

.category-amount {
  font-size: 0.92rem;
  color: #212529;
  white-space: nowrap;
}

/* Category transactions modal */
.cat-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1050;
  animation: fadeIn 0.15s ease-out;
}

.cat-modal-card {
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 16px 16px 0 0;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.2s ease-out;
}

.cat-modal-body {
  overflow-y: auto;
  padding-bottom: 2rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
