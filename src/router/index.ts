import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: DashboardView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/add-transaction',
      name: 'addTransaction',
      component: () => import('../views/AddTransactionView.vue'),
    },
    {
      path: '/import-pdf',
      name: 'importPdf',
      component: () => import('../views/ImportPdfView.vue'),
    },
    {
      path: '/edit-transaction/:firestoreId',
      name: 'editTransaction',
      component: () => import('../views/AddTransactionView.vue'),
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('../views/StatsView.vue'),
    },
    {
      path: '/budget-setting',
      name: 'budgetSetting',
      component: () => import('../views/BudgetSettingView.vue'),
    },
    {
      path: '/settings',
      alias: '/more',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    }
  ],
})

export default router
