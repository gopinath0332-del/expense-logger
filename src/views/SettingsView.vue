<template>
  <div class="settings-container">
    <!-- Top Bar -->
    <div class="settings-top-bar px-3 py-3 bg-white border-bottom text-center">
      <h5 class="mb-0 fw-bold header-title">Settings</h5>
    </div>

    <!-- Settings Menu Groups -->
    <div class="settings-content p-3">
      <!-- Finance & Budget Section -->
      <div class="settings-group mb-4">
        <div class="group-title text-muted extra-small fw-bold text-uppercase mb-2 px-1">
          Budget & Finance
        </div>
        <div class="list-group shadow-sm border-0 rounded-3 overflow-hidden">
          <div
            class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 border-0 cursor-pointer"
            @click="navigateTo('budgetSetting')"
          >
            <div class="d-flex align-items-center gap-3">
              <div class="menu-icon-box bg-blue-subtle text-primary">
                <i class="bi bi-wallet2 fs-5"></i>
              </div>
              <div>
                <div class="fw-bold menu-title text-dark">Budget Setting</div>
                <div class="text-muted small">Configure global monthly budget allocations</div>
              </div>
            </div>
            <i class="bi bi-chevron-right text-muted fs-6"></i>
          </div>

          <div
            class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 border-top border-light cursor-pointer"
            @click="navigateTo('statsBudget')"
          >
            <div class="d-flex align-items-center gap-3">
              <div class="menu-icon-box bg-green-subtle text-success">
                <i class="bi bi-pie-chart fs-5"></i>
              </div>
              <div>
                <div class="fw-bold menu-title text-dark">Budget Overview</div>
                <div class="text-muted small">Track progress against monthly budgets</div>
              </div>
            </div>
            <i class="bi bi-chevron-right text-muted fs-6"></i>
          </div>
        </div>
      </div>

      <!-- Data Management Section -->
      <div class="settings-group mb-4">
        <div class="group-title text-muted extra-small fw-bold text-uppercase mb-2 px-1">
          Data & Statements
        </div>
        <div class="list-group shadow-sm border-0 rounded-3 overflow-hidden">
          <div
            class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 border-0 cursor-pointer"
            @click="navigateTo('importPdf')"
          >
            <div class="d-flex align-items-center gap-3">
              <div class="menu-icon-box bg-red-subtle text-danger">
                <i class="bi bi-file-earmark-pdf fs-5"></i>
              </div>
              <div>
                <div class="fw-bold menu-title text-dark">Import Statement</div>
                <div class="text-muted small">Extract and auto-categorize bank PDF statements</div>
              </div>
            </div>
            <i class="bi bi-chevron-right text-muted fs-6"></i>
          </div>
        </div>
      </div>

      <!-- About App Section -->
      <div class="settings-group mb-4">
        <div class="group-title text-muted extra-small fw-bold text-uppercase mb-2 px-1">
          App Info
        </div>
        <div class="list-group shadow-sm border-0 rounded-3 overflow-hidden">
          <div class="list-group-item d-flex align-items-center justify-content-between p-3 border-0">
            <span class="text-muted small">Application</span>
            <span class="fw-semibold small">Expense Logger PWA</span>
          </div>
          <div class="list-group-item d-flex align-items-center justify-content-between p-3 border-top border-light">
            <span class="text-muted small">Version</span>
            <span class="badge bg-secondary-subtle text-dark">v1.2.0</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation :navItems="navItems" :onNavClick="handleNavClick" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from '@/components/dashboard/BottomNavigation.vue'
import type { NavItem } from '@/types/transaction'

const router = useRouter()

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
    active: true
  }
])

const navigateTo = (destination: string) => {
  if (destination === 'budgetSetting') {
    router.push({ name: 'budgetSetting' })
  } else if (destination === 'statsBudget') {
    router.push({ name: 'stats', query: { segment: 'Budget' } })
  } else if (destination === 'importPdf') {
    router.push({ name: 'importPdf' })
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
.settings-container {
  max-width: 100%;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 90px;
}

.settings-top-bar {
  background-color: white;
}

.header-title {
  font-size: 1.15rem;
}

.extra-small {
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.cursor-pointer {
  cursor: pointer;
}

.menu-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bg-blue-subtle {
  background-color: #e7f1ff;
}

.bg-green-subtle {
  background-color: #e6f7ec;
}

.bg-red-subtle {
  background-color: #fde8e8;
}

.menu-title {
  font-size: 0.95rem;
}

.list-group-item-action:hover,
.list-group-item-action:active {
  background-color: #f8f9fa;
}
</style>
