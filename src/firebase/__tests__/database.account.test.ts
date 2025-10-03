import { describe, it, expect, vi } from 'vitest'
import {
  fetchAccountOptions,
  initializeDefaultAccountOptions,
  addAccountOption,
  updateAccountOption,
  deleteAccountOption,
  syncDefaultAccountOptions
} from '@/firebase/database'
import { DEFAULT_ACCOUNT_OPTIONS, DEFAULT_ACCOUNT_OPTIONS_VERSION } from '@/types/account'

// Mock Firebase
vi.mock('@/firebase/config', () => ({
  db: {}
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn()
}))

describe('Account Options Firebase Functions', () => {
  it('should have default account options defined', () => {
    expect(DEFAULT_ACCOUNT_OPTIONS).toBeDefined()
    expect(DEFAULT_ACCOUNT_OPTIONS.length).toBeGreaterThan(0)
    expect(DEFAULT_ACCOUNT_OPTIONS).toContain(
      expect.objectContaining({
        id: 'debit-card',
        label: 'Debit Cards',
        icon: 'bi bi-credit-card-2-front'
      })
    )
    expect(DEFAULT_ACCOUNT_OPTIONS).toContain(
      expect.objectContaining({
        id: 'cash-back',
        label: 'Cash Back',
        icon: 'bi bi-arrow-left-circle'
      })
    )
  })

  it('should export Firebase account functions', () => {
    expect(fetchAccountOptions).toBeDefined()
    expect(initializeDefaultAccountOptions).toBeDefined()
    expect(addAccountOption).toBeDefined()
    expect(updateAccountOption).toBeDefined()
    expect(deleteAccountOption).toBeDefined()
    expect(syncDefaultAccountOptions).toBeDefined()
  })

  it('should have version tracking for default account options', () => {
    expect(DEFAULT_ACCOUNT_OPTIONS_VERSION).toBeDefined()
    expect(typeof DEFAULT_ACCOUNT_OPTIONS_VERSION).toBe('string')
    expect(DEFAULT_ACCOUNT_OPTIONS_VERSION.length).toBeGreaterThan(0)
  })
})
