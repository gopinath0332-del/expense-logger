import { ref } from 'vue'
import type { GlobalBudgetSettings, CategoryBudgetProgress, OverallBudgetProgress } from '@/types/budget'
import type { CategoryOption } from '@/types/category'
import type { TransactionDay } from '@/types/transaction'
import { fetchGlobalBudget, saveGlobalBudget, updateCategoryBudgetAmount } from '@/firebase/budgets'
import { fetchCategoryOptions } from '@/firebase/categories'

export function useBudgetData() {
  const globalBudget = ref<GlobalBudgetSettings>({
    type: 'expense',
    categories: {}
  })
  const categories = ref<CategoryOption[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  /**
   * Load category options and global budget settings
   */
  async function loadData(type: 'expense' | 'income' = 'expense') {
    loading.value = true
    error.value = null
    try {
      const [cats, budget] = await Promise.all([
        fetchCategoryOptions().catch(() => []),
        fetchGlobalBudget(type)
      ])
      categories.value = cats
      globalBudget.value = budget
    } catch (err) {
      console.error('Failed to load budget data:', err)
      error.value = 'Failed to load budget data'
    } finally {
      loading.value = false
    }
  }

  /**
   * Set budget for a category
   */
  async function setCategoryBudget(
    categoryId: string,
    amount: number,
    type: 'expense' | 'income' = 'expense'
  ) {
    saving.value = true
    try {
      globalBudget.value.categories = {
        ...globalBudget.value.categories,
        [categoryId]: amount
      }
      await updateCategoryBudgetAmount(categoryId, amount, type)
    } catch (err) {
      console.error('Failed to update category budget:', err)
      throw err
    } finally {
      saving.value = false
    }
  }

  /**
   * Batch save all category budgets
   */
  async function saveAllBudgets(
    categoryBudgets: Record<string, number>,
    type: 'expense' | 'income' = 'expense'
  ) {
    saving.value = true
    try {
      globalBudget.value.categories = { ...categoryBudgets }
      await saveGlobalBudget(categoryBudgets, type)
    } catch (err) {
      console.error('Failed to save all budgets:', err)
      throw err
    } finally {
      saving.value = false
    }
  }

  /**
   * Calculate spent amount map by category for the given month transactions
   */
  function calculateSpentByCategory(
    transactions: TransactionDay[],
    type: 'expense' | 'income' = 'expense'
  ): Map<string, number> {
    const spentMap = new Map<string, number>()

    transactions.forEach((day) => {
      day.items.forEach((item) => {
        if (item.type === type) {
          const rawCat = (item.category || 'other').trim().toLowerCase()
          const current = spentMap.get(rawCat) || 0
          spentMap.set(rawCat, current + (item.amount || 0))
        }
      })
    })

    return spentMap
  }

  /**
   * Compute per-category progress for the given month transactions
   */
  function computeCategoryProgress(
    transactions: TransactionDay[],
    type: 'expense' | 'income' = 'expense',
    onlyBudgeted = false
  ): CategoryBudgetProgress[] {
    const spentMap = calculateSpentByCategory(transactions, type)

    const list: CategoryBudgetProgress[] = categories.value.map((cat) => {
      const catId = cat.id
      const catLabel = cat.label
      const budget = globalBudget.value.categories[catId] ?? globalBudget.value.categories[catLabel] ?? 0

      // Match spending by id or lowercase label
      const spent = (spentMap.get(catId.toLowerCase()) || 0) +
        (spentMap.get(catLabel.toLowerCase()) && catLabel.toLowerCase() !== catId.toLowerCase()
          ? spentMap.get(catLabel.toLowerCase())!
          : 0)

      const remaining = budget - spent
      const percentage = budget > 0 ? (spent / budget) * 100 : 0
      const isOverBudget = budget > 0 && spent > budget
      const subcategoriesSummary = cat.subcategories?.map((s) => s.label).join(' ') || ''

      return {
        categoryId: catId,
        categoryName: catLabel,
        subcategoriesSummary,
        budget,
        spent,
        remaining,
        percentage,
        isOverBudget
      }
    })

    if (onlyBudgeted) {
      return list.filter((item) => item.budget > 0)
    }

    return list
  }

  /**
   * Compute overall budget progress
   */
  function computeOverallProgress(
    transactions: TransactionDay[],
    currentDate: Date,
    type: 'expense' | 'income' = 'expense'
  ): OverallBudgetProgress {
    // Total budget is sum of all category budgets set in globalBudget
    let totalBudget = 0
    Object.values(globalBudget.value.categories || {}).forEach((amt) => {
      totalBudget += Number(amt) || 0
    })

    // Total spent is sum of all transactions matching the type in this month
    let totalSpent = 0
    transactions.forEach((day) => {
      day.items.forEach((item) => {
        if (item.type === type) {
          totalSpent += item.amount || 0
        }
      })
    })

    const totalRemaining = totalBudget - totalSpent
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    // Calendar progress for the "Today" marker
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const today = new Date()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
    const isPastMonth = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth())

    let monthProgressPercentage = 0
    if (isCurrentMonth) {
      monthProgressPercentage = Math.min(100, Math.max(0, (today.getDate() / daysInMonth) * 100))
    } else if (isPastMonth) {
      monthProgressPercentage = 100
    } else {
      monthProgressPercentage = 0
    }

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      percentage,
      monthProgressPercentage
    }
  }

  return {
    globalBudget,
    categories,
    loading,
    saving,
    error,
    loadData,
    setCategoryBudget,
    saveAllBudgets,
    computeCategoryProgress,
    computeOverallProgress
  }
}
