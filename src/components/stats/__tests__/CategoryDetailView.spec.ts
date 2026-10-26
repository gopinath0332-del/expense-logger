import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CategoryDetailView from '../CategoryDetailView.vue'
import type { CategoryOption } from '@/types/category'
import type { TransactionDay } from '@/types/transaction'

// Mock Firebase config
vi.mock('@/firebase/config', () => ({
  db: null,
  isFirebaseConfigured: () => false,
  useSampleData: () => false
}))

describe('CategoryDetailView', () => {
  const mockCategories: CategoryOption[] = [
    {
      id: 'apparel',
      label: 'Apparel',
      subcategories: [
        { id: 'clothing', label: 'Clothing' },
        { id: 'fashion', label: 'Fashion' },
        { id: 'shoes', label: 'Shoes' },
        { id: 'laundry', label: 'Laundry' }
      ]
    }
  ]

  const mockTransactions: TransactionDay[] = [
    {
      date: '2026-10-15',
      dateNumber: 15,
      dayName: 'Thu',
      income: 0,
      expenses: 10500,
      items: [
        {
          id: 101,
          firestoreId: 'doc-101',
          type: 'expense',
          date: '2026-10-15',
          category: 'Apparel',
          subcategory: 'Clothing',
          account: 'UPI',
          description: 'Winter Jacket',
          amount: 10500
        }
      ]
    }
  ]

  const formatNumber = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  it('renders category name and total amount correctly', () => {
    const wrapper = mount(CategoryDetailView, {
      props: {
        categoryName: 'Apparel',
        currentDate: new Date(2026, 9, 1), // Oct 2026
        currentMonthLabel: 'Oct 2026',
        activeType: 'expense',
        transactions: mockTransactions,
        categoryOptions: mockCategories,
        formatNumber
      }
    })

    expect(wrapper.find('.category-title').text()).toBe('Apparel')
    expect(wrapper.find('.category-total-text').text()).toContain('10,500.00')
  })

  it('calculates subcategory percentages and totals correctly', () => {
    const wrapper = mount(CategoryDetailView, {
      props: {
        categoryName: 'Apparel',
        currentDate: new Date(2026, 9, 1),
        currentMonthLabel: 'Oct 2026',
        activeType: 'expense',
        transactions: mockTransactions,
        categoryOptions: mockCategories,
        formatNumber
      }
    })

    const rows = wrapper.findAll('.subcategory-row')
    expect(rows.length).toBe(4) // Clothing, Fashion, Shoes, Laundry

    // First row should be Clothing with 100% and ₹ 10,500.00
    const firstRow = rows[0]
    expect(firstRow.find('.subcategory-label').text()).toBe('Clothing')
    expect(firstRow.find('.percent-badge').text()).toBe('100%')
    expect(firstRow.find('.subcategory-amount').text()).toContain('10,500.00')

    // Remaining subcategories should show 0% and ₹ 0.00
    const secondRow = rows[1]
    expect(secondRow.find('.percent-badge').text()).toBe('0%')
    expect(secondRow.find('.subcategory-amount').text()).toContain('0.00')
  })

  it('emits back event when Back button is clicked', async () => {
    const wrapper = mount(CategoryDetailView, {
      props: {
        categoryName: 'Apparel',
        currentDate: new Date(2026, 9, 1),
        currentMonthLabel: 'Oct 2026',
        activeType: 'expense',
        transactions: mockTransactions,
        categoryOptions: mockCategories,
        formatNumber
      }
    })

    await wrapper.find('.back-btn').trigger('click')
    expect(wrapper.emitted('back')).toBeTruthy()
  })

  it('emits prevMonth and nextMonth events when date navigation icons are clicked', async () => {
    const wrapper = mount(CategoryDetailView, {
      props: {
        categoryName: 'Apparel',
        currentDate: new Date(2026, 9, 1),
        currentMonthLabel: 'Oct 2026',
        activeType: 'expense',
        transactions: mockTransactions,
        categoryOptions: mockCategories,
        formatNumber
      }
    })

    const chevrons = wrapper.findAll('.date-nav i')
    await chevrons[0].trigger('click') // left
    expect(wrapper.emitted('prevMonth')).toBeTruthy()

    await chevrons[1].trigger('click') // right
    expect(wrapper.emitted('nextMonth')).toBeTruthy()
  })
})
