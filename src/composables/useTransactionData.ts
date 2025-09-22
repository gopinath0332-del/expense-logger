import { ref, computed } from 'vue'
import type { TransactionDay, DashboardSummary } from '@/types/transaction'

export function useTransactionData() {
  // Sample transaction data - this would typically come from an API or store
  const transactions = ref<TransactionDay[]>([
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

  // Computed summary
  const summary = computed<DashboardSummary>(() => {
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

  return {
    transactions,
    summary
  }
}
