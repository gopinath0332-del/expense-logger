<template>
  <div class="dashboard-container">
    <DashboardHeader @openSettings="handleOpenSettings" />
    <DashboardDateNav :currentMonth="currentMonth" @previousMonth="goToPreviousMonth" @nextMonth="goToNextMonth" />
    <DashboardTabs :tabs="tabs" :activeTab="activeTab" @update:activeTab="activeTab = $event" />
    <DashboardSummary :summary="{ income: summary.income, expenses: summary.expenses, balance: summary.total }" :formatCurrency="formatCurrency" />

    <!-- Tab Views -->
    <TransactionList
      v-if="activeTab === 'Daily'"
      :transactions="transactions"
      :formatNumber="formatNumber"
      @select="handleEditTransaction"
    />

    <DashboardCalendar
      v-else-if="activeTab === 'Calendar'"
      :transactions="transactions"
      :currentDate="currentDate"
      :formatNumber="formatNumber"
      @selectTransaction="handleEditTransaction"
    />

    <div v-else class="text-center text-muted py-5">
      <i class="bi bi-clock-history fs-1 d-block mb-2"></i>
      <p class="mb-0">{{ activeTab }} view is coming soon</p>
    </div>

    <!-- Floating Action Button -->
    <FloatingActionButton :onClick="handleAddTransaction" />

    <!-- Bottom Navigation -->
    <BottomNavigation :navItems="navItems" :onNavClick="handleNavClick" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardHeader from '../components/dashboard/DashboardHeader.vue'
import DashboardDateNav from '../components/dashboard/DashboardDateNav.vue'
import DashboardTabs from '../components/dashboard/DashboardTabs.vue'
import DashboardSummary from '../components/dashboard/DashboardSummary.vue'
import TransactionList from '../components/dashboard/TransactionList.vue'
import DashboardCalendar from '../components/dashboard/DashboardCalendar.vue'
import FloatingActionButton from '../components/dashboard/FloatingActionButton.vue'
import BottomNavigation from '../components/dashboard/BottomNavigation.vue'
import { useTransactionData } from '@/composables/useTransactionData'
import { useFormatting } from '@/composables/useFormatting'
import type { TabConfig, NavItem, Transaction } from '@/types/transaction'

// Router
const router = useRouter()

// Composables
const { transactions, summary, loadTransactionsByMonth } = useTransactionData()
const { formatCurrency, formatNumber, formatMonthYear } = useFormatting()

// Reactive data
const activeTab = ref('Daily')
const currentDate = ref(new Date())

// Tabs configuration
const tabs: TabConfig[] = [
  { name: 'Daily', label: 'Daily' },
  { name: 'Calendar', label: 'Calendar' },
  { name: 'Monthly', label: 'Monthly' },
  { name: 'Summary', label: 'Summary' },
  { name: 'Description', label: 'Description' }
]

// Navigation items
const todayLabel = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace('/', '/')

const navItems = ref<NavItem[]>([
  {
    id: 'calendar',
    icon: 'bi bi-journal-text',
    label: todayLabel,
    active: true
  },
  {
    id: 'stats',
    icon: 'bi bi-bar-chart',
    label: 'Stats',
    active: false
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

// Computed properties
const currentMonth = computed(() => {
  return formatMonthYear(currentDate.value)
})

// Event handlers
const handleAddTransaction = () => {
  router.push({ name: 'addTransaction' })
}

const handleEditTransaction = (transaction: Transaction) => {
  if (transaction.firestoreId) {
    router.push({ name: 'editTransaction', params: { firestoreId: transaction.firestoreId } })
  }
}

const handleNavClick = (item: NavItem) => {
  // Update active state
  navItems.value.forEach(navItem => {
    navItem.active = navItem.id === item.id
  })

  if (item.id === 'stats') {
    router.push({ name: 'stats' })
  } else if (item.id === 'more') {
    router.push({ name: 'settings' })
  }
}

const handleOpenSettings = () => {
  router.push({ name: 'settings' })
}

// Month navigation handlers
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

// Load transactions for the current month
const loadCurrentMonthTransactions = () => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1 // Convert to 1-based month
  loadTransactionsByMonth(year, month)
}

// Watch for changes in currentDate and reload transactions
watch(currentDate, () => {
  loadCurrentMonthTransactions()
}, { immediate: true })
</script>

<style scoped>
.dashboard-container {
  max-width: 100%;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 80px; /* Space for bottom nav */
}

.header {
  background-color: white !important;
  border-bottom: 1px solid #e9ecef;
}

.date-nav {
  background-color: white;
  border-bottom: 1px solid #e9ecef;
}

.tab-nav {
  background-color: white;
  border-bottom: 1px solid #e9ecef;
}

.tab-nav .nav-tabs {
  border-bottom: none;
}

.tab-nav .nav-link {
  border: none;
  color: #6c757d;
  padding: 0.75rem 1rem;
  border-bottom: 3px solid transparent;
}

.tab-nav .nav-link.active {
  color: #dc3545;
  border-bottom-color: #dc3545;
  background-color: transparent;
}

.summary-section {
  background-color: white;
  border-bottom: 1px solid #e9ecef;
}

.summary-card {
  padding: 0.5rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .dashboard-container {
    font-size: 0.9rem;
  }

  .tab-nav .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 576px) {
  .tab-nav .nav-link {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .summary-section .col-4 {
    padding: 0.25rem;
  }
}
</style>
