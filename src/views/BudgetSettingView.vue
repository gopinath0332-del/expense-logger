<template>
  <div class="budget-setting-container">
    <!-- Top Bar: < Settings | Budget Setting | Period Dropdown -->
    <div class="top-nav-bar d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
      <!-- Back to Settings / Budget -->
      <button
        type="button"
        class="back-btn d-flex align-items-center gap-1 btn btn-link text-dark text-decoration-none p-0"
        @click="goBack"
      >
        <i class="bi bi-chevron-left fs-5"></i>
        <span class="fw-semibold">Settings</span>
      </button>

      <!-- Center Title -->
      <h5 class="mb-0 fw-bold header-title">Budget Setting</h5>

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
          <button
            class="dropdown-item"
            :class="{ active: periodType === 'M' }"
            @click="selectPeriod('M')"
          >
            Monthly (M)
          </button>
          <button
            class="dropdown-item"
            :class="{ active: periodType === 'W' }"
            @click="selectPeriod('W')"
          >
            Weekly (W)
          </button>
          <button
            class="dropdown-item"
            :class="{ active: periodType === 'Y' }"
            @click="selectPeriod('Y')"
          >
            Yearly (Y)
          </button>
        </div>
      </div>
    </div>

    <!-- Date Navigation: < Oct 2026 > -->
    <div class="date-nav d-flex justify-content-between align-items-center px-3 py-2">
      <i class="bi bi-chevron-left fs-5 cursor-pointer" @click="goToPreviousMonth"></i>
      <h6 class="mb-0 fw-semibold">{{ currentMonthLabel }}</h6>
      <i class="bi bi-chevron-right fs-5 cursor-pointer" @click="goToNextMonth"></i>
    </div>

    <!-- Type Toggle Tabs: Income | Exp. -->
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
        Exp.
      </button>
    </div>

    <!-- Planned Overall Budget Summary Card -->
    <div class="planned-budget-card bg-white px-3 py-3 border-bottom d-flex justify-content-between align-items-center">
      <div>
        <div class="text-muted small fw-medium">Planned Overall Budget</div>
        <div class="planned-budget-amount fw-bold text-dark mt-1">
          ₹ {{ formatNumber(totalPlannedBudget) }}
        </div>
      </div>
      <div class="text-end">
        <span class="badge bg-light text-secondary border px-2 py-1">
          {{ budgetedCount }} of {{ categories.length }} categories set
        </span>
      </div>
    </div>

    <!-- Category Budget List -->
    <div class="category-budget-list">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status"></div>
        <div class="text-muted small mt-2">Loading categories...</div>
      </div>

      <div v-else-if="categories.length === 0" class="text-center text-muted py-5">
        No active categories found
      </div>

      <div v-else class="list-group list-group-flush">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="category-budget-row d-flex align-items-center justify-content-between px-3 py-3 border-bottom cursor-pointer"
          @click="openEditModal(cat)"
        >
          <!-- Left: Category title and subcategories -->
          <div class="category-meta text-truncate pe-2">
            <div class="category-title fw-bold text-dark">
              {{ cat.label }}
            </div>
            <div class="category-subcategories text-muted small text-truncate">
              {{ formatSubcategories(cat) }}
            </div>
          </div>

          <!-- Right: Budget Amount -->
          <div class="category-amount-badge text-end text-nowrap">
            <span class="budget-value fw-semibold">
              ₹ {{ formatNumber(getBudgetAmount(cat.id)) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Budget Modal -->
    <BudgetEditModal
      :isVisible="isEditModalVisible"
      :categoryId="selectedCategory?.id || ''"
      :categoryName="selectedCategory?.label || ''"
      :initialAmount="selectedCategory ? getBudgetAmount(selectedCategory.id) : 0"
      :isSaving="saving"
      @close="isEditModalVisible = false"
      @save="handleSaveCategoryBudget"
    />

    <!-- Toast Notification -->
    <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :type="toastType"
      @close="toastMessage = ''"
    />

    <!-- Bottom Navigation -->
    <BottomNavigation :navItems="navItems" :onNavClick="handleNavClick" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBudgetData } from '@/composables/useBudgetData'
import { useFormatting } from '@/composables/useFormatting'
import BudgetEditModal from '@/components/budget/BudgetEditModal.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import BottomNavigation from '@/components/dashboard/BottomNavigation.vue'
import type { CategoryOption } from '@/types/category'
import type { NavItem } from '@/types/transaction'

const router = useRouter()
const {
  globalBudget,
  categories,
  loading,
  saving,
  loadData,
  setCategoryBudget
} = useBudgetData()
const { formatNumber, formatMonthYear } = useFormatting()

// Top bar controls
const periodType = ref<'M' | 'W' | 'Y'>('M')
const isPeriodDropdownOpen = ref(false)
const activeType = ref<'expense' | 'income'>('expense')
const currentDate = ref(new Date())

const currentMonthLabel = computed(() => formatMonthYear(currentDate.value))

// Modal state
const isEditModalVisible = ref(false)
const selectedCategory = ref<CategoryOption | null>(null)

// Toast state
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('success')

// Bottom Nav items
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

onMounted(() => {
  loadData(activeType.value)
})

watch(activeType, (newType) => {
  loadData(newType)
})

// Planned Overall Budget Computeds
const totalPlannedBudget = computed(() => {
  let total = 0
  categories.value.forEach((cat) => {
    const amt = globalBudget.value.categories[cat.id] ?? 0
    total += Number(amt) || 0
  })
  return total
})

const budgetedCount = computed(() => {
  return categories.value.filter((cat) => (globalBudget.value.categories[cat.id] ?? 0) > 0).length
})

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'settings' })
  }
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

const formatSubcategories = (cat: CategoryOption): string => {
  if (!cat.subcategories || cat.subcategories.length === 0) {
    return ''
  }
  return cat.subcategories.map(s => s.label).join(' ')
}

const getBudgetAmount = (categoryId: string): number => {
  return globalBudget.value.categories[categoryId] ?? 0
}

const openEditModal = (cat: CategoryOption) => {
  selectedCategory.value = cat
  isEditModalVisible.value = true
}

const handleSaveCategoryBudget = async (amount: number) => {
  if (!selectedCategory.value) return
  const cat = selectedCategory.value
  try {
    await setCategoryBudget(cat.id, amount, activeType.value)
    isEditModalVisible.value = false
    toastType.value = 'success'
    toastMessage.value = `${cat.label} budget updated to ₹ ${formatNumber(amount)}`
  } catch (err) {
    console.error('Failed to save category budget:', err)
    toastType.value = 'error'
    toastMessage.value = 'Failed to save budget. Please try again.'
  }
}

const handleNavClick = (item: NavItem) => {
  if (item.id === 'calendar') {
    router.push({ name: 'dashboard' })
  } else if (item.id === 'stats') {
    router.push({ name: 'stats' })
  } else if (item.id === 'more') {
    router.push({ name: 'settings' })
  }
}
</script>

<style scoped>
.budget-setting-container {
  max-width: 100%;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 90px;
}

.top-nav-bar {
  background-color: white;
  border-bottom: 1px solid #e9ecef;
}

.header-title {
  font-size: 1.1rem;
}

.back-btn {
  color: #212529;
  font-size: 0.95rem;
}

.period-select-btn {
  background-color: #f1f3f5;
  border: 1px solid #ced4da;
  border-radius: 6px;
  padding: 0.25rem 0.65rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
}

.period-dropdown-menu {
  position: absolute;
  right: 1rem;
  top: 3.2rem;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1050;
  overflow: hidden;
  min-width: 130px;
}

.period-dropdown-menu .dropdown-item {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
}

.period-dropdown-menu .dropdown-item.active {
  background-color: #dc3545;
  color: white;
}

.date-nav {
  background-color: white;
  border-bottom: 1px solid #e9ecef;
}

.cursor-pointer {
  cursor: pointer;
}

.type-toggle-tabs {
  display: flex;
  background-color: white;
  border-bottom: 1px solid #e9ecef;
}

.type-tab-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.65rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #6c757d;
  border-bottom: 3px solid transparent;
  transition: all 0.15s ease;
}

.type-tab-btn.active {
  color: #dc3545;
  font-weight: 700;
  border-bottom-color: #dc3545;
}

.category-budget-list {
  background-color: white;
}

.category-budget-row {
  transition: background-color 0.15s ease;
}

.category-budget-row:hover,
.category-budget-row:active {
  background-color: #f8f9fa;
}

.category-title {
  font-size: 0.95rem;
}

.category-subcategories {
  color: #6c757d;
  font-size: 0.8rem;
  margin-top: 2px;
}

.budget-value {
  font-size: 0.95rem;
  color: #212529;
}

.planned-budget-card {
  background-color: #ffffff;
}

.planned-budget-amount {
  font-size: 1.55rem;
  letter-spacing: -0.5px;
  line-height: 1.2;
}
</style>
