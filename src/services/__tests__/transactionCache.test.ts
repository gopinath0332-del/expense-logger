import { describe, it, expect, beforeEach } from 'vitest'
import { transactionCache } from '../transactionCache'
import type { TransactionDay } from '@/types/transaction'

describe('TransactionCache', () => {
  const mockTransactionDay: TransactionDay = {
    date: '2025-01-15',
    dateNumber: 15,
    dayName: 'Mon',
    income: 100,
    expenses: 50,
    items: []
  }

  beforeEach(() => {
    transactionCache.clear()
  })

  it('should store and retrieve data', () => {
    transactionCache.set(2025, 1, [mockTransactionDay])
    const result = transactionCache.get(2025, 1)
    expect(result).toEqual([mockTransactionDay])
  })

  it('should return null for non-existent data', () => {
    const result = transactionCache.get(2025, 1)
    expect(result).toBeNull()
  })

  it('should check if data exists in cache', () => {
    expect(transactionCache.has(2025, 1)).toBe(false)
    transactionCache.set(2025, 1, [mockTransactionDay])
    expect(transactionCache.has(2025, 1)).toBe(true)
  })

  it('should clear all cached data', () => {
    transactionCache.set(2025, 1, [mockTransactionDay])
    transactionCache.set(2025, 2, [mockTransactionDay])
    expect(transactionCache.has(2025, 1)).toBe(true)
    expect(transactionCache.has(2025, 2)).toBe(true)
    
    transactionCache.clear()
    
    expect(transactionCache.has(2025, 1)).toBe(false)
    expect(transactionCache.has(2025, 2)).toBe(false)
  })

  it('should provide cache statistics', () => {
    transactionCache.set(2025, 1, [mockTransactionDay])
    transactionCache.set(2025, 2, [mockTransactionDay])
    
    const stats = transactionCache.getStats()
    
    expect(stats.size).toBe(2)
    expect(stats.maxSize).toBe(12)
    expect(stats.keys).toContain('2025-01')
    expect(stats.keys).toContain('2025-02')
  })

  it('should identify months to prefetch', () => {
    // Set cache for January 2025
    transactionCache.set(2025, 1, [mockTransactionDay])
    
    // Get months to prefetch (should return December 2024 and February 2025)
    const monthsToPrefetch = transactionCache.getMonthsToPrefetch(2025, 1)
    
    expect(monthsToPrefetch).toHaveLength(2)
    expect(monthsToPrefetch).toContainEqual({ year: 2024, month: 12 })
    expect(monthsToPrefetch).toContainEqual({ year: 2025, month: 2 })
  })

  it('should not prefetch months already in cache', () => {
    // Set cache for January, February, and December 2024
    transactionCache.set(2025, 1, [mockTransactionDay])
    transactionCache.set(2025, 2, [mockTransactionDay])
    transactionCache.set(2024, 12, [mockTransactionDay])
    
    // Get months to prefetch for January 2025 (should return empty)
    const monthsToPrefetch = transactionCache.getMonthsToPrefetch(2025, 1)
    
    expect(monthsToPrefetch).toHaveLength(0)
  })

  it('should handle year boundaries correctly for prefetch', () => {
    transactionCache.set(2025, 1, [mockTransactionDay])
    
    // For January, previous month is December of previous year
    const januaryPrefetch = transactionCache.getMonthsToPrefetch(2025, 1)
    expect(januaryPrefetch).toContainEqual({ year: 2024, month: 12 })
    
    // For December, next month is January of next year
    const decemberPrefetch = transactionCache.getMonthsToPrefetch(2025, 12)
    expect(decemberPrefetch).toContainEqual({ year: 2026, month: 1 })
  })

  it('should enforce max cache size', () => {
    // Fill cache with 12 months
    for (let i = 1; i <= 12; i++) {
      transactionCache.set(2025, i, [mockTransactionDay])
    }
    
    const stats1 = transactionCache.getStats()
    expect(stats1.size).toBe(12)
    
    // Add one more month - should remove the oldest
    transactionCache.set(2026, 1, [mockTransactionDay])
    
    const stats2 = transactionCache.getStats()
    expect(stats2.size).toBe(12)
    expect(stats2.keys).toContain('2026-01')
  })

  it('should generate correct cache keys with zero padding', () => {
    transactionCache.set(2025, 1, [mockTransactionDay])
    transactionCache.set(2025, 11, [mockTransactionDay])
    
    const stats = transactionCache.getStats()
    expect(stats.keys).toContain('2025-01')
    expect(stats.keys).toContain('2025-11')
  })
})
