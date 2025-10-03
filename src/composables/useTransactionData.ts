import { ref, computed, onMounted } from 'vue'
import type { TransactionDay, DashboardSummary } from '@/types/transaction'
import { useSampleData } from '@/firebase/config'
import { fetchTransactions, fetchTransactionsByMonth } from '@/firebase/transactions'

export function useTransactionData() {
  // Sample transaction data - used as fallback when Firebase is not configured
  const sampleTransactions: TransactionDay[] = [
    {
      date: '2025-07-28',
      dateNumber: 28,
      dayName: 'Mon',
      income: 0,
      expenses: 1116.81,
      items: [
        {
          id: 1,
          type: 'expense',
          date: '2025-07-28',
          category: 'Food',
          subcategory: 'Zomato',
          account: 'UPI',
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
          type: 'expense',
          date: '2025-07-25',
          category: 'Amazon',
          subcategory: '',
          account: 'UPI',
          description: '',
          amount: 1204.00
        },
        {
          id: 3,
          type: 'expense',
          date: '2025-07-25',
          category: 'Health',
          subcategory: 'Medicine',
          account: 'UPI',
          description: 'Shanmuga medical',
          amount: 140.00
        },
        {
          id: 4,
          type: 'expense',
          date: '2025-07-25',
          category: 'Food',
          subcategory: 'Beverages',
          account: 'UPI',
          description: 'Coke',
          amount: 40.00
        },
        {
          id: 5,
          type: 'expense',
          date: '2025-07-25',
          category: 'Food',
          subcategory: 'Zomato',
          account: 'UPI',
          description: '',
          amount: 898.80
        },
        {
          id: 6,
          type: 'expense',
          date: '2025-07-25',
          category: 'Food',
          subcategory: 'Zomato',
          account: 'UPI',
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
          type: 'expense',
          date: '2025-07-23',
          category: 'Grocery',
          subcategory: '',
          account: 'UPI',
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
          type: 'expense',
          date: '2025-07-22',
          category: 'Other',
          subcategory: '',
          account: 'UPI',
          description: '',
          amount: 367.77
        }
      ]
    }
  ]

  const transactions = ref<TransactionDay[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load transactions on mount
  const loadTransactions = async () => {
    if (useSampleData()) {
      // Use sample data if Firebase is not configured
      transactions.value = sampleTransactions
      console.log('Using sample transaction data')
      return
    }

    // Fetch from Firebase
    loading.value = true
    error.value = null

    try {
      transactions.value = await fetchTransactions()
      console.log('Loaded transactions from Firebase')
    } catch (err) {
      console.error('Failed to load transactions, falling back to sample data:', err)
      error.value = 'Failed to load transactions from Firebase'
      transactions.value = sampleTransactions
    } finally {
      loading.value = false
    }
  }

  // Load transactions for a specific month
  const loadTransactionsByMonth = async (year: number, month: number) => {
    if (useSampleData()) {
      // Filter sample data by month
      const filteredSampleData = filterSampleDataByMonth(sampleTransactions, year, month)
      transactions.value = filteredSampleData
      console.log(`Using filtered sample transaction data for ${year}-${month}`)
      return
    }

    // Fetch from Firebase
    loading.value = true
    error.value = null

    try {
      transactions.value = await fetchTransactionsByMonth(year, month)
      console.log(`Loaded transactions from Firebase for ${year}-${month}`)
    } catch (err) {
      console.error(`Failed to load transactions for ${year}-${month}, falling back to sample data:`, err)
      error.value = 'Failed to load transactions from Firebase'
      const filteredSampleData = filterSampleDataByMonth(sampleTransactions, year, month)
      transactions.value = filteredSampleData
    } finally {
      loading.value = false
    }
  }

  // Helper function to filter sample data by month
  const filterSampleDataByMonth = (data: TransactionDay[], year: number, month: number): TransactionDay[] => {
    return data.filter(day => {
      const dayDate = new Date(day.date)
      return dayDate.getFullYear() === year && dayDate.getMonth() + 1 === month
    })
  }

  // Load transactions when component is mounted
  onMounted(() => {
    loadTransactions()
  })

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
    summary,
    loading,
    error,
    loadTransactions,
    loadTransactionsByMonth
  }
}
