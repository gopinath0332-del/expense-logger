import { describe, it, expect, beforeEach } from 'vitest'
import { useBudgetData } from '@/composables/useBudgetData'
import type { TransactionDay } from '@/types/transaction'

describe('useBudgetData', () => {
  let budgetComposable: ReturnType<typeof useBudgetData>

  beforeEach(() => {
    budgetComposable = useBudgetData()
    // Pre-seed categories
    budgetComposable.categories.value = [
      {
        id: 'food',
        label: 'Food',
        subcategories: [
          { id: 'restaurant', label: 'Restaurant' },
          { id: 'groceries', label: 'Groceries' }
        ]
      },
      {
        id: 'apparel',
        label: 'Apparel',
        subcategories: [
          { id: 'clothing', label: 'Clothing' }
        ]
      },
      {
        id: 'transportation',
        label: 'Transportation',
        subcategories: []
      }
    ]

    // Pre-seed global budget
    budgetComposable.globalBudget.value = {
      type: 'expense',
      categories: {
        food: 10000,
        apparel: 6000,
        transportation: 5000
      }
    }
  })

  it('computes category progress correctly for under and over budget', () => {
    const mockTransactions: TransactionDay[] = [
      {
        date: '2026-10-24',
        dateNumber: 24,
        dayName: 'Sat',
        income: 0,
        expenses: 12000,
        items: [
          {
            id: 1,
            type: 'expense',
            date: '2026-10-24',
            category: 'Food',
            account: 'upi',
            description: 'Lunch',
            amount: 2500
          },
          {
            id: 2,
            type: 'expense',
            date: '2026-10-24',
            category: 'Apparel',
            account: 'upi',
            description: 'Clothes',
            amount: 9500 // Over 6000 budget!
          }
        ]
      }
    ]

    const progress = budgetComposable.computeCategoryProgress(mockTransactions, 'expense', false)
    expect(progress).toHaveLength(3)

    // Food: 2500 / 10000 = 25%
    const food = progress.find(p => p.categoryId === 'food')!
    expect(food.budget).toBe(10000)
    expect(food.spent).toBe(2500)
    expect(food.remaining).toBe(7500)
    expect(food.percentage).toBe(25)
    expect(food.isOverBudget).toBe(false)
    expect(food.subcategoriesSummary).toBe('Restaurant Groceries')

    // Apparel: 9500 / 6000 = 158.33%
    const apparel = progress.find(p => p.categoryId === 'apparel')!
    expect(apparel.budget).toBe(6000)
    expect(apparel.spent).toBe(9500)
    expect(apparel.remaining).toBe(-3500)
    expect(apparel.percentage).toBeCloseTo(158.33, 1)
    expect(apparel.isOverBudget).toBe(true)

    // Transportation: 0 spent
    const trans = progress.find(p => p.categoryId === 'transportation')!
    expect(trans.budget).toBe(5000)
    expect(trans.spent).toBe(0)
    expect(trans.remaining).toBe(5000)
    expect(trans.percentage).toBe(0)
    expect(trans.isOverBudget).toBe(false)
  })

  it('computes overall progress and pacing correctly', () => {
    const mockTransactions: TransactionDay[] = [
      {
        date: '2026-10-24',
        dateNumber: 24,
        dayName: 'Sat',
        income: 0,
        expenses: 12000,
        items: [
          {
            id: 1,
            type: 'expense',
            date: '2026-10-24',
            category: 'Food',
            account: 'upi',
            description: 'Lunch',
            amount: 2500
          },
          {
            id: 2,
            type: 'expense',
            date: '2026-10-24',
            category: 'Apparel',
            account: 'upi',
            description: 'Clothes',
            amount: 9500
          }
        ]
      }
    ]

    // Total budget: 10000 + 6000 + 5000 = 21000
    // Total spent: 2500 + 9500 = 12000
    // Remaining: 21000 - 12000 = 9000
    // Percentage: 12000 / 21000 * 100 = ~57.14%
    const oct2026 = new Date(2026, 9, 24) // October 24, 2026
    const overall = budgetComposable.computeOverallProgress(mockTransactions, oct2026, 'expense')

    expect(overall.totalBudget).toBe(21000)
    expect(overall.totalSpent).toBe(12000)
    expect(overall.totalRemaining).toBe(9000)
    expect(overall.percentage).toBeCloseTo(57.14, 1)
  })
})
