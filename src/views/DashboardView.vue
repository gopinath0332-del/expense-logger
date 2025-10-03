<template>
  <div class="dashboard-container">
    <DashboardHeader />
    <DashboardDateNav :currentMonth="currentMonth" @previousMonth="goToPreviousMonth" @nextMonth="goToNextMonth" />
    <DashboardTabs :tabs="tabs" :activeTab="activeTab" @update:activeTab="activeTab = $event" />
    <DashboardSummary :summary="{ income: summary.income, expenses: summary.expenses, balance: summary.total }" :formatCurrency="formatCurrency" />

    <!-- Transaction List -->
    <TransactionList :transactions="transactions" :formatNumber="formatNumber" />

    <!-- Floating Action Button -->
    <FloatingActionButton :onClick="handleAddTransaction" />

    <!-- Bottom Navigation -->
    <BottomNavigation :navItems="navItems" :onNavClick="handleNavClick" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardHeader from '../components/dashboard/DashboardHeader.vue'
import DashboardDateNav from '../components/dashboard/DashboardDateNav.vue'
import DashboardTabs from '../components/dashboard/DashboardTabs.vue'
import DashboardSummary from '../components/dashboard/DashboardSummary.vue'
import TransactionList from '../components/dashboard/TransactionList.vue'
import FloatingActionButton from '../components/dashboard/FloatingActionButton.vue'
import BottomNavigation from '../components/dashboard/BottomNavigation.vue'
import { useTransactionData } from '@/composables/useTransactionData'
import { useFormatting } from '@/composables/useFormatting'
import type { TabConfig, NavItem } from '@/types/transaction'

// Router
const router = useRouter()

// Composables
const { transactions, summary } = useTransactionData()
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
const navItems = ref<NavItem[]>([
  {
    id: 'calendar',
    icon: 'bi bi-calendar3',
    label: '19/09',
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

const handleNavClick = (item: NavItem) => {
  // Update active state
  navItems.value.forEach(navItem => {
    navItem.active = navItem.id === item.id
  })

  // TODO: Implement navigation logic
  console.log('Navigation clicked:', item.id)
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
