export interface GlobalBudgetSettings {
  type: 'expense' | 'income'
  categories: Record<string, number> // categoryId -> monthly budget amount
  updatedAt?: Date
}

export interface CategoryBudgetProgress {
  categoryId: string
  categoryName: string
  subcategoriesSummary: string
  budget: number
  spent: number
  remaining: number
  percentage: number
  isOverBudget: boolean
}

export interface OverallBudgetProgress {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  percentage: number
  monthProgressPercentage: number
}
