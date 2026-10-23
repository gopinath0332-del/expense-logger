import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ImportReviewTable from '@/components/import/ImportReviewTable.vue'
import type { ImportedTransaction } from '@/types/pdfImport'
import type { CategoryOption } from '@/types/category'
import type { AccountOption } from '@/types/account'

describe('ImportReviewTable', () => {
  const mockCategories: CategoryOption[] = [
    {
      id: 'food',
      label: 'Food',
      subcategories: [
        { id: 'restaurant', label: 'Restaurant' }
      ]
    },
    { id: 'transportation', label: 'Transportation' },
    { id: 'other', label: 'Other' }
  ]

  const mockAccounts: AccountOption[] = [
    { id: 'bank', label: 'Bank Account', icon: 'bi bi-bank' },
    { id: 'upi', label: 'UPI', icon: 'bi bi-phone' }
  ]

  const mockTransactions: ImportedTransaction[] = [
    {
      importId: 'tx-1',
      date: '2026-07-22',
      type: 'expense',
      category: 'food',
      subcategory: 'restaurant',
      account: 'upi',
      description: 'Swiggy Order',
      note: 'UPI/P2M/.../Swiggy',
      amount: 450,
      rawNarration: 'UPI/P2M/.../Swiggy',
      isDuplicate: false
    },
    {
      importId: 'tx-2',
      date: '2026-07-23',
      type: 'income',
      category: 'other',
      subcategory: '',
      account: 'bank',
      description: 'Salary Cr',
      note: 'Salary for July',
      amount: 100000,
      rawNarration: 'CHARTERED B/Salary Cr',
      isDuplicate: true
    }
  ]

  it('renders summary cards with correct counts', () => {
    const wrapper = mount(ImportReviewTable, {
      props: {
        transactions: mockTransactions,
        categories: mockCategories,
        accounts: mockAccounts
      }
    })

    expect(wrapper.text()).toContain('Total')
    expect(wrapper.text()).toContain('2')
    expect(wrapper.text()).toContain('To Save')
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('Duplicate')
  })

  it('renders transaction cards with fields and highlights duplicates', () => {
    const wrapper = mount(ImportReviewTable, {
      props: {
        transactions: mockTransactions,
        categories: mockCategories,
        accounts: mockAccounts
      }
    })

    const cards = wrapper.findAll('.transaction-review-card')
    expect(cards).toHaveLength(2)

    // Second card is duplicate
    expect(cards[1].classes()).toContain('border-warning')
    expect(cards[1].text()).toContain('Duplicate (Skipped)')
  })

  it('emits update event when description is changed', async () => {
    const wrapper = mount(ImportReviewTable, {
      props: {
        transactions: mockTransactions,
        categories: mockCategories,
        accounts: mockAccounts
      }
    })

    const descInputs = wrapper.findAll('input[type="text"]')
    await descInputs[0].setValue('Updated Swiggy Meal')

    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')?.[0]).toEqual(['tx-1', { description: 'Updated Swiggy Meal' }])
  })

  it('emits remove event when delete button is clicked', async () => {
    const wrapper = mount(ImportReviewTable, {
      props: {
        transactions: mockTransactions,
        categories: mockCategories,
        accounts: mockAccounts
      }
    })

    const deleteBtns = wrapper.findAll('.delete-btn')
    await deleteBtns[0].trigger('click')

    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')?.[0]).toEqual(['tx-1'])
  })
})
