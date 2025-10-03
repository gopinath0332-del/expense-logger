import { describe, it, expect, vi } from 'vitest'
import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
} from '@/firebase/transactions'

// Mock Firebase
vi.mock('@/firebase/config', () => ({
  db: {}
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn()
}))

describe('Transaction Firebase Functions', () => {
  it('should export Firebase transaction functions', () => {
    expect(fetchTransactions).toBeDefined()
    expect(addTransaction).toBeDefined()
    expect(updateTransaction).toBeDefined()
    expect(deleteTransaction).toBeDefined()
  })
})
