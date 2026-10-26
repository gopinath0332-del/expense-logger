<template>
  <div class="category-detail-container">
    <!-- Top Header: < Back | Category Name -->
    <div class="category-header d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
      <button
        type="button"
        class="back-btn d-flex align-items-center gap-1 border-0 bg-transparent text-dark p-0"
        @click="emit('back')"
      >
        <i class="bi bi-chevron-left fs-5"></i>
        <span class="fw-semibold">Back</span>
      </button>

      <h5 class="mb-0 fw-bold category-title">{{ categoryName }}</h5>

      <!-- Spacer for centered title alignment -->
      <div style="width: 50px;"></div>
    </div>

    <!-- Date Navigation: < Oct 2026 > -->
    <div class="date-nav d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
      <i class="bi bi-chevron-left fs-5 cursor-pointer" @click="emit('prevMonth')"></i>
      <h6 class="mb-0 fw-semibold">{{ currentMonthLabel }}</h6>
      <i class="bi bi-chevron-right fs-5 cursor-pointer" @click="emit('nextMonth')"></i>
    </div>

    <!-- Monthly Trend Line Chart -->
    <div class="trend-section border-bottom">
      <CategoryMonthlyTrendChart
        :months="monthlyTrendData"
        :formatNumber="formatNumber"
        @selectMonth="handleSelectTrendMonth"
        @shiftNext="handleShiftNext"
      />
    </div>

    <!-- Category Summary Row -->
    <div class="category-summary-row d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
      <span class="category-name-text">{{ categoryName }}</span>
      <span class="category-total-text">₹ {{ formatNumber(categoryTotal) }}</span>
    </div>

    <!-- Subcategories Breakdown List -->
    <div class="subcategories-section">
      <div v-if="subcategoryItems.length === 0" class="text-center text-muted py-4">
        No transactions recorded for this category in {{ currentMonthLabel }}
      </div>

      <div v-else class="subcategory-list">
        <div
          v-for="sub in subcategoryItems"
          :key="sub.id"
          class="subcategory-row d-flex align-items-center justify-content-between px-3 py-3 border-bottom cursor-pointer"
          @click="handleSelectSubcategory(sub)"
        >
          <!-- Left: Percentage badge + Subcategory Label -->
          <div class="d-flex align-items-center gap-3 min-width-0">
            <span
              class="percent-badge"
              :style="{ backgroundColor: sub.badgeColor }"
            >
              {{ Math.round(sub.percent) }}%
            </span>

            <span class="subcategory-label text-truncate fw-semibold">
              {{ sub.label }}
            </span>
          </div>

          <!-- Right: Total Amount -->
          <div class="subcategory-amount fw-bold">
            ₹ {{ formatNumber(sub.total) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Subcategory Transactions Modal -->
    <div
      v-if="activeDrilldownSubcategory"
      class="subcat-modal-backdrop"
      @click.self="activeDrilldownSubcategory = null"
    >
      <div class="subcat-modal-card">
        <div class="subcat-modal-header d-flex justify-content-between align-items-center p-3 border-bottom">
          <div>
            <h6 class="mb-0 fw-bold">{{ categoryName }} &gt; {{ activeDrilldownSubcategory.label }}</h6>
            <small class="text-muted">
              {{ filteredSubcategoryTransactions.length }} transactions • ₹ {{ formatNumber(activeDrilldownSubcategory.total) }}
            </small>
          </div>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="activeDrilldownSubcategory = null"
          ></button>
        </div>

        <div class="subcat-modal-body p-0">
          <div v-if="filteredSubcategoryTransactions.length === 0" class="p-4 text-center text-muted">
            No transactions found
          </div>
          <TransactionItem
            v-for="transaction in filteredSubcategoryTransactions"
            :key="transaction.id"
            :transaction="transaction"
            :formatNumber="formatNumber"
            @select="emit('editTransaction', transaction)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CategoryMonthlyTrendChart, { type MonthTrendData } from './CategoryMonthlyTrendChart.vue'
import TransactionItem from '@/components/dashboard/TransactionItem.vue'
import type { CategoryOption } from '@/types/category'
import type { Transaction, TransactionDay } from '@/types/transaction'
import { transactionCache } from '@/services/transactionCache'
import { fetchTransactionsByMonth } from '@/firebase/transactions'
import { isFirebaseConfigured, useSampleData } from '@/firebase/config'

interface Props {
  categoryName: string
  currentDate: Date
  currentMonthLabel: string
  activeType: 'expense' | 'income'
  transactions: TransactionDay[]
  allSampleTransactions?: TransactionDay[]
  categoryOptions: CategoryOption[]
  formatNumber: (n: number) => string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'prevMonth'): void
  (e: 'nextMonth'): void
  (e: 'selectDate', date: Date): void
  (e: 'editTransaction', transaction: Transaction): void
}>()

// Window shift offset for the 7-month trend chart
const trendWindowOffset = ref(0)

// Active subcategory drilldown modal
interface SubcategoryItem {
  id: string
  label: string
  total: number
  percent: number
  badgeColor: string
}
const activeDrilldownSubcategory = ref<SubcategoryItem | null>(null)

// Current month flattened transactions matching active type
const currentMonthTransactions = computed<Transaction[]>(() => {
  const list: Transaction[] = []
  props.transactions.forEach(day => {
    day.items.forEach(item => {
      if (item.type === props.activeType && isMatchingCategory(item.category, props.categoryName)) {
        list.push(item)
      }
    })
  })
  return list
})

// Current month category total
const categoryTotal = computed(() => {
  return currentMonthTransactions.value.reduce((acc, cur) => acc + cur.amount, 0)
})

// Matched CategoryOption for defined subcategories
const matchedCategoryOption = computed(() => {
  const target = props.categoryName.trim().toLowerCase()
  return props.categoryOptions.find(
    cat => cat.id.toLowerCase() === target || cat.label.toLowerCase() === target
  )
})

// Normalize string helper
function normalize(str?: string): string {
  return (str || '').trim().toLowerCase().replace(/\s+/g, '-')
}

// Category matching helper
function isMatchingCategory(transactionCategory?: string, targetName?: string): boolean {
  if (!transactionCategory || !targetName) return false
  const tCat = normalize(transactionCategory)
  const target = normalize(targetName)
  if (tCat === target) return true

  // Check against matched option id/label
  if (matchedCategoryOption.value) {
    if (tCat === normalize(matchedCategoryOption.value.id) || tCat === normalize(matchedCategoryOption.value.label)) {
      return true
    }
  }
  return false
}

// Subcategory breakdown items
const subcategoryItems = computed<SubcategoryItem[]>(() => {
  const total = categoryTotal.value
  const definedSubs = matchedCategoryOption.value?.subcategories || []

  // Pre-seed with all configured subcategories
  const subMap = new Map<string, { id: string; label: string; total: number }>()
  definedSubs.forEach(sub => {
    subMap.set(normalize(sub.id), {
      id: sub.id,
      label: sub.label,
      total: 0
    })
  })

  // Distribute transactions into subcategories
  currentMonthTransactions.value.forEach(item => {
    const rawSub = item.subcategory?.trim() || ''
    if (!rawSub) {
      const key = '__no_sub__'
      const cur = subMap.get(key) || { id: '__no_sub__', label: 'Other', total: 0 }
      cur.total += item.amount
      subMap.set(key, cur)
      return
    }

    const normSub = normalize(rawSub)
    let foundKey: string | null = null

    // Check if matches an existing defined subcategory
    for (const [key, val] of subMap.entries()) {
      if (key === normSub || normalize(val.label) === normSub) {
        foundKey = key
        break
      }
    }

    if (foundKey) {
      subMap.get(foundKey)!.total += item.amount
    } else {
      // Custom subcategory not in default definitions
      const cur = subMap.get(normSub) || { id: rawSub, label: rawSub, total: 0 }
      cur.total += item.amount
      subMap.set(normSub, cur)
    }
  })

  // Convert to array
  const list = Array.from(subMap.values()).map(sub => {
    const percent = total > 0 ? (sub.total / total) * 100 : 0
    return {
      id: sub.id,
      label: sub.label,
      total: sub.total,
      percent,
      badgeColor: '#f59846'
    }
  })

  // Sort descending by total amount; if 0, preserve order
  list.sort((a, b) => b.total - a.total)

  // Assign colors matching reference image (100% / highest gets red/coral, then orange, then amber/yellow)
  const BADGE_COLORS = ['#f06c59', '#f59846', '#f8cb47', '#f8cb47', '#fae545', '#9fdb5c']
  list.forEach((item, idx) => {
    if (item.percent >= 50) {
      item.badgeColor = '#f06c59' // red/coral for high percentage
    } else if (item.percent > 0) {
      item.badgeColor = BADGE_COLORS[Math.min(idx, BADGE_COLORS.length - 1)]
    } else {
      // 0% items match screenshot (alternating orange/yellow pills)
      item.badgeColor = idx % 2 === 0 ? '#f59846' : '#f8cb47'
    }
  })

  return list
})

// Transactions filtered for active drilldown subcategory
const filteredSubcategoryTransactions = computed<Transaction[]>(() => {
  if (!activeDrilldownSubcategory.value) return []
  const sub = activeDrilldownSubcategory.value

  return currentMonthTransactions.value.filter(item => {
    if (sub.id === '__no_sub__') {
      return !item.subcategory || !item.subcategory.trim()
    }
    const rawSub = (item.subcategory || '').trim()
    return normalize(rawSub) === normalize(sub.id) || normalize(rawSub) === normalize(sub.label)
  })
})

// 7-Month Trend Data Computation & Background Fetching
const trendMonthsCache = ref<Record<string, TransactionDay[]>>({})

async function loadTrendMonths() {
  if (!isFirebaseConfigured() || useSampleData()) return

  const baseDate = new Date(props.currentDate)
  const startOffset = -4 + trendWindowOffset.value

  const promises: Promise<void>[] = []

  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + startOffset + i, 1)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const key = `${y}-${String(m).padStart(2, '0')}`

    const isSelected =
      y === props.currentDate.getFullYear() &&
      m === props.currentDate.getMonth() + 1

    if (isSelected) {
      trendMonthsCache.value[key] = props.transactions
      continue
    }

    const cached = transactionCache.get(y, m)
    if (cached) {
      trendMonthsCache.value[key] = cached
      continue
    }

    promises.push(
      fetchTransactionsByMonth(y, m)
        .then(data => {
          transactionCache.set(y, m, data)
          trendMonthsCache.value = {
            ...trendMonthsCache.value,
            [key]: data
          }
        })
        .catch(err => {
          console.error(`Failed to load trend data for ${key}:`, err)
        })
    )
  }

  if (promises.length > 0) {
    await Promise.all(promises)
  }
}

watch(
  [() => props.currentDate, trendWindowOffset],
  () => {
    loadTrendMonths()
  },
  { immediate: true }
)

const monthlyTrendData = computed<MonthTrendData[]>(() => {
  const result: MonthTrendData[] = []
  const baseDate = new Date(props.currentDate)

  // 7 months window: 4 months prior, current month, 2 months forward
  // plus trendWindowOffset if user shifts
  const startOffset = -4 + trendWindowOffset.value

  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + startOffset + i, 1)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const key = `${y}-${String(m).padStart(2, '0')}`
    const monthName = d.toLocaleDateString('en-US', { month: 'short' })

    const isSelected =
      y === props.currentDate.getFullYear() &&
      m === props.currentDate.getMonth() + 1

    let monthAmount = 0

    if (useSampleData() && props.allSampleTransactions) {
      const pad = (n: number) => String(n).padStart(2, '0')
      const prefix = `${y}-${pad(m)}`
      const sampleDays = props.allSampleTransactions.filter(day => day.date.startsWith(prefix))
      sampleDays.forEach(day => {
        day.items.forEach(item => {
          if (item.type === props.activeType && isMatchingCategory(item.category, props.categoryName)) {
            monthAmount += item.amount
          }
        })
      })
    } else {
      const cached = isSelected
        ? props.transactions
        : (trendMonthsCache.value[key] || transactionCache.get(y, m))

      if (cached) {
        cached.forEach(day => {
          day.items.forEach(item => {
            if (item.type === props.activeType && isMatchingCategory(item.category, props.categoryName)) {
              monthAmount += item.amount
            }
          })
        })
      }
    }

    result.push({
      year: y,
      month: m,
      monthName,
      amount: monthAmount,
      isSelected
    })
  }

  return result
})

function handleSelectTrendMonth(payload: { year: number; month: number }) {
  const newDate = new Date(payload.year, payload.month - 1, 1)
  emit('selectDate', newDate)
}

function handleShiftNext() {
  trendWindowOffset.value += 1
}

function handleSelectSubcategory(sub: SubcategoryItem) {
  if (sub.total > 0) {
    activeDrilldownSubcategory.value = sub
  }
}
</script>

<style scoped>
.category-detail-container {
  background-color: #ffffff;
  min-height: 100%;
}

.back-btn {
  font-size: 0.95rem;
  color: #212529;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.back-btn:hover {
  opacity: 0.7;
}

.category-title {
  color: #1a1a1a;
  font-size: 1.15rem;
}

.date-nav {
  background-color: #ffffff;
}

.cursor-pointer {
  cursor: pointer;
  color: #6c757d;
  transition: color 0.15s ease;
}

.cursor-pointer:hover {
  color: #ea5455;
}

.category-summary-row {
  background-color: #ffffff;
}

.category-name-text {
  font-size: 0.95rem;
  color: #6c757d;
  font-weight: 500;
}

.category-total-text {
  font-size: 0.95rem;
  color: #212529;
  font-weight: 600;
}

.subcategory-row {
  transition: background-color 0.15s ease;
}

.subcategory-row:hover {
  background-color: #fafbfc;
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

.subcategory-label {
  font-size: 0.92rem;
  color: #212529;
}

.subcategory-amount {
  font-size: 0.92rem;
  color: #212529;
  white-space: nowrap;
}

/* Subcategory Modal */
.subcat-modal-backdrop {
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

.subcat-modal-card {
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

.subcat-modal-body {
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
