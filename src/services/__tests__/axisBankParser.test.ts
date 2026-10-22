import { describe, it, expect } from 'vitest'
import { AxisBankParser } from '../axisBankParser'
import type { RawBankRow } from '@/types/pdfImport'
import type { CategoryOption } from '@/types/category'
import type { AccountOption } from '@/types/account'

describe('AxisBankParser', () => {
  const parser = new AxisBankParser()

  const mockCategories: CategoryOption[] = [
    {
      id: 'food',
      label: 'Food',
      subcategories: [
        { id: 'restaurant', label: 'Restaurant' },
        { id: 'groceries', label: 'Groceries' }
      ]
    },
    { id: 'transportation', label: 'Transportation' },
    { id: 'health', label: 'Health' },
    { id: 'other', label: 'Other' }
  ]

  const mockAccounts: AccountOption[] = [
    { id: 'bank', label: 'Bank Account', icon: 'bi bi-bank' },
    { id: 'upi', label: 'UPI', icon: 'bi bi-phone' },
    { id: 'cash', label: 'Cash', icon: 'bi bi-cash' }
  ]

  describe('parseDate', () => {
    it('converts DD-MM-YYYY to YYYY-MM-DD', () => {
      expect(parser.parseDate('25-07-2026')).toBe('2026-07-25')
      expect(parser.parseDate('02-08-2026')).toBe('2026-08-02')
    })

    it('returns original string if format does not have 3 parts', () => {
      expect(parser.parseDate('invalid-date')).toBe('invalid-date')
    })
  })

  describe('cleanDescription', () => {
    it('extracts merchant name from UPI narration', () => {
      const narration = 'UPI/P2M/083813469585/ALAGAPPAS CHETTINADU /Paymen/HDFC BANK LTD'
      expect(parser.cleanDescription(narration)).toContain('ALAGAPPAS CHETTINADU')
    })

    it('extracts beneficiary name from NEFT narration', () => {
      const narration = 'NEFT/SBIN226215636904/KALINGA CONSTRUCTIONS/STATE BANK OF INDIA'
      expect(parser.cleanDescription(narration)).toBe('KALINGA CONSTRUCTIONS')
    })

    it('cleans ACH debit narration', () => {
      const narration = 'ACH-DR-IDFC FIRST BANK-2278230957-UTIB70231012610'
      expect(parser.cleanDescription(narration)).toContain('IDFC FIRST BANK')
    })
  })

  describe('detectCategory', () => {
    it('matches food / restaurant keyword correctly', () => {
      const result = parser.detectCategory('UPI/P2M/833968203148/Zomato', mockCategories)
      expect(result.categoryId).toBe('food')
      expect(result.subcategoryId).toBe('restaurant')
    })

    it('matches groceries keyword correctly', () => {
      const result = parser.detectCategory('Smart Point Supermarket Srirangam', mockCategories)
      expect(result.categoryId).toBe('food')
      expect(result.subcategoryId).toBe('groceries')
    })

    it('matches transportation keyword correctly', () => {
      const result = parser.detectCategory('Indian Oil Petrol Pump', mockCategories)
      expect(result.categoryId).toBe('transportation')
    })

    it('matches health keyword correctly', () => {
      const result = parser.detectCategory('Apollo Pharmacy Medicine', mockCategories)
      expect(result.categoryId).toBe('health')
    })

    it('falls back to other category when no keyword matches', () => {
      const result = parser.detectCategory('UNKNOWN VENDOR TRANSACTION', mockCategories)
      expect(result.categoryId).toBe('other')
    })

    it('dynamically matches user custom category by label (e.g. Zerodha)', () => {
      const customCategories: CategoryOption[] = [
        ...mockCategories,
        { id: 'zerodha-stocks', label: 'Zerodha' }
      ]
      const result = parser.detectCategory(
        'UPI/P2M/103710264418/ZERODHA BROKING LIMIT/405330/HDFC BANK LTD',
        customCategories
      )
      expect(result.categoryId).toBe('zerodha-stocks')
    })

    it('dynamically matches user custom subcategory by label (e.g. Zerodha under Investment)', () => {
      const customCategories: CategoryOption[] = [
        ...mockCategories,
        {
          id: 'investment',
          label: 'Investment',
          subcategories: [{ id: 'zerodha', label: 'Zerodha' }]
        }
      ]
      const result = parser.detectCategory(
        'UPI/P2M/103710264418/ZERODHA BROKING LIMIT/405330/HDFC BANK LTD',
        customCategories
      )
      expect(result.categoryId).toBe('investment')
      expect(result.subcategoryId).toBe('zerodha')
    })
  })

  describe('detectAccount', () => {
    it('detects UPI account when narration includes UPI', () => {
      expect(parser.detectAccount('UPI/P2M/123/Vendor', mockAccounts)).toBe('upi')
    })

    it('detects Bank account for NEFT/ACH', () => {
      expect(parser.detectAccount('NEFT/SBIN/Vendor', mockAccounts)).toBe('bank')
      expect(parser.detectAccount('ACH-DR-HDFC', mockAccounts)).toBe('bank')
    })
  })

  describe('mapToImportedTransactions', () => {
    const rawRows: RawBankRow[] = [
      {
        date: '22-07-2026',
        narration: 'UPI/P2M/083813469585/ALAGAPPAS CHETTINADU /Paymen/HDFC BANK LTD',
        chequeRef: '',
        debit: 63.0,
        credit: null,
        balance: 178182.91
      },
      {
        date: '23-07-2026',
        narration: 'UPI/P2A/657025469207/BARANIYA /IOBA/UPI/',
        chequeRef: '',
        debit: null,
        credit: 4500.0,
        balance: 36863.91
      }
    ]

    it('maps debit rows to expense type with formatted date and amounts', () => {
      const imported = parser.mapToImportedTransactions(rawRows, mockCategories, mockAccounts)
      expect(imported).toHaveLength(1)

      const expense = imported[0]
      expect(expense.type).toBe('expense')
      expect(expense.amount).toBe(63.0)
      expect(expense.date).toBe('2026-07-22')
      expect(expense.category).toBe('food')
      expect(expense.account).toBe('upi')
      expect(expense.isDuplicate).toBe(false)
    })

    it('ignores credit/income rows and captures only debit rows', () => {
      const imported = parser.mapToImportedTransactions(rawRows, mockCategories, mockAccounts)
      // rawRows has 1 debit and 1 credit row; only debit should be present
      expect(imported).toHaveLength(1)
      expect(imported.every((t) => t.type === 'expense')).toBe(true)
      expect(imported[0].amount).toBe(63.0)
    })

    it('flags duplicate rows when fingerprint matches existing transactions', () => {
      // Fingerprint format: date_amount_type_description
      const existingFp = new Set<string>()
      const desc = parser.cleanDescription(rawRows[0].narration).toLowerCase()
      existingFp.add(`2026-07-22_63_expense_${desc}`)

      const imported = parser.mapToImportedTransactions(rawRows, mockCategories, mockAccounts, existingFp)
      expect(imported[0].isDuplicate).toBe(true)
    })
  })
})
