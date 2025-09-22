<template>
  <div class="dashboard-container">
    <DashboardHeader />
    <DashboardDateNav :currentMonth="currentMonth" />
    <DashboardTabs :tabs="tabs" :activeTab="activeTab" @update:activeTab="activeTab = $event" />
    <DashboardSummary :summary="{ income: summary.income, expenses: summary.expenses, balance: summary.total }" :formatCurrency="formatCurrency" />

    <!-- Transaction List -->
    <div class="transaction-list">
      <div v-for="day in transactions" :key="day.date" class="day-group">
        <!-- Day Header -->
        <div class="day-header d-flex justify-content-between align-items-center p-3 bg-light">
          <div class="d-flex align-items-center">
            <div class="date-number me-2">{{ day.dateNumber }}</div>
            <div class="day-badge badge bg-secondary">{{ day.dayName }}</div>
          </div>
          <div class="day-summary d-flex gap-3">
            <span class="text-primary">₹ {{ formatNumber(day.income) }}</span>
            <span class="text-danger">₹ {{ formatNumber(day.expenses) }}</span>
          </div>
        </div>

        <!-- Transactions for the day -->
        <div v-for="transaction in day.items" :key="transaction.id" class="transaction-item d-flex justify-content-between align-items-center p-3 border-bottom">
          <div class="transaction-details">
            <div class="category-info d-flex flex-column">
              <span class="category text-muted small">{{ transaction.category }}</span>
              <span class="subcategory text-muted small">{{ transaction.subcategory }}</span>
            </div>
          </div>
          <div class="payment-description text-center">
            <div class="payment-method small text-muted">{{ transaction.paymentMethod }}</div>
            <div v-if="transaction.description" class="description small">{{ transaction.description }}</div>
          </div>
          <div class="amount text-danger fw-bold">
            ₹ {{ formatNumber(transaction.amount) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <div class="fab-container">
      <button class="btn btn-danger rounded-circle fab">
        <i class="bi bi-plus fs-4"></i>
      </button>
    </div>

    <!-- Bottom Navigation -->
    <div class="bottom-nav fixed-bottom bg-white border-top">
      <div class="d-flex justify-content-around p-2">
        <div class="nav-item text-center">
          <i class="bi bi-calendar3 d-block"></i>
          <small class="text-danger">19/09</small>
        </div>
        <div class="nav-item text-center">
          <i class="bi bi-bar-chart d-block text-muted"></i>
          <small class="text-muted">Stats</small>
        </div>
        <div class="nav-item text-center">
          <i class="bi bi-database d-block text-muted"></i>
          <small class="text-muted">Accounts</small>
        </div>
        <div class="nav-item text-center">
          <i class="bi bi-three-dots d-block text-muted"></i>
          <small class="text-muted">More</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardHeader from '../components/dashboard/DashboardHeader.vue'
import DashboardDateNav from '../components/dashboard/DashboardDateNav.vue'
import DashboardTabs from '../components/dashboard/DashboardTabs.vue'
import DashboardSummary from '../components/dashboard/DashboardSummary.vue'

// Reactive data
const activeTab = ref('Daily')
const currentDate = ref(new Date())

// Tabs configuration
const tabs = [
  { name: 'Daily', label: 'Daily' },
  { name: 'Calendar', label: 'Calendar' },
  { name: 'Monthly', label: 'Monthly' },
  { name: 'Summary', label: 'Summary' },
  { name: 'Description', label: 'Description' }
]

// Sample transaction data
const transactions = ref([
  {
    date: '2025-07-28',
    dateNumber: 28,
    dayName: 'Mon',
    income: 0,
    expenses: 1116.81,
    items: [
      {
        id: 1,
        category: 'Food',
        subcategory: 'Zomato',
        paymentMethod: 'UPI',
        description: '',
        amount: 1116.81
      }
    ]
  },
  {
    date: '2025-07-25',
    dateNumber: 25,
    dayName: 'Fri',
    income: 0,
    expenses: 2312.80,
    items: [
      {
        id: 2,
        category: 'Amazon',
        subcategory: '',
        paymentMethod: 'UPI',
        description: '',
        amount: 1204.00
      },
      {
        id: 3,
        category: 'Health',
        subcategory: 'Medicine',
        paymentMethod: 'UPI',
        description: 'Shanmuga medical',
        amount: 140.00
      },
      {
        id: 4,
        category: 'Food',
        subcategory: 'Beverages',
        paymentMethod: 'UPI',
        description: 'Coke',
        amount: 40.00
      },
      {
        id: 5,
        category: 'Food',
        subcategory: 'Zomato',
        paymentMethod: 'UPI',
        description: '',
        amount: 898.80
      },
      {
        id: 6,
        category: 'Food',
        subcategory: 'Zomato',
        paymentMethod: 'UPI',
        description: '',
        amount: 30.00
      }
    ]
  },
  {
    date: '2025-07-23',
    dateNumber: 23,
    dayName: 'Wed',
    income: 0,
    expenses: 58.00,
    items: [
      {
        id: 7,
        category: 'Grocery',
        subcategory: '',
        paymentMethod: 'UPI',
        description: 'Golden supermarket',
        amount: 58.00
      }
    ]
  },
  {
    date: '2025-07-22',
    dateNumber: 22,
    dayName: 'Tue',
    income: 0,
    expenses: 367.77,
    items: [
      {
        id: 8,
        category: 'Other',
        subcategory: '',
        paymentMethod: 'UPI',
        description: '',
        amount: 367.77
      }
    ]
  }
])

// Computed properties
const currentMonth = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })
})

const summary = computed(() => {
  let income = 0
  let expenses = 0

  transactions.value.forEach(day => {
    income += day.income
    expenses += day.expenses
  })

  return {
    income,
    expenses,
    total: income - expenses
  }
})

// Helper functions
const formatCurrency = (amount: number): string => {
  return amount.toFixed(2)
}

const formatNumber = (amount: number): string => {
  return amount.toFixed(2)
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

.day-header {
  border-bottom: 1px solid #e9ecef;
}

.date-number {
  font-size: 1.5rem;
  font-weight: bold;
}

.day-badge {
  font-size: 0.75rem;
}

.transaction-item {
  background-color: white;
}

.transaction-item:hover {
  background-color: #f8f9fa;
}

.category {
  font-weight: 500;
}

.fab-container {
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 1000;
}

.fab {
  width: 56px;
  height: 56px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: none;
}

.bottom-nav {
  z-index: 999;
}

.nav-item {
  flex: 1;
  padding: 0.5rem;
}

.nav-item i {
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .dashboard-container {
    font-size: 0.9rem;
  }

  .transaction-item {
    padding: 0.75rem !important;
  }

  .day-header {
    padding: 0.75rem !important;
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
