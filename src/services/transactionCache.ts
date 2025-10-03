import type { TransactionDay } from '@/types/transaction'

interface CacheEntry {
  data: TransactionDay[]
  timestamp: number
}

interface MonthKey {
  year: number
  month: number
}

/**
 * Transaction cache service for storing and retrieving monthly transaction data
 * Implements LRU-like caching with a maximum of 12 months in cache
 */
class TransactionCache {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly MAX_CACHE_SIZE = 12 // Store up to 12 months
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

  /**
   * Generate a cache key from year and month
   */
  private getCacheKey(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`
  }

  /**
   * Get cached data for a specific month
   * Returns null if not in cache or expired
   */
  get(year: number, month: number): TransactionDay[] | null {
    const key = this.getCacheKey(year, month)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if cache entry has expired
    const now = Date.now()
    if (now - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Store data in cache for a specific month
   */
  set(year: number, month: number, data: TransactionDay[]): void {
    const key = this.getCacheKey(year, month)

    // If cache is full, remove the oldest entry (first entry in Map)
    if (this.cache.size >= this.MAX_CACHE_SIZE && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Check if data exists in cache for a specific month
   */
  has(year: number, month: number): boolean {
    return this.get(year, month) !== null
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; keys: string[] } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * Prefetch data for adjacent months
   * Returns array of month keys that need to be fetched
   */
  getMonthsToPrefetch(year: number, month: number): MonthKey[] {
    const monthsToPrefetch: MonthKey[] = []

    // Previous month
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    if (!this.has(prevYear, prevMonth)) {
      monthsToPrefetch.push({ year: prevYear, month: prevMonth })
    }

    // Next month
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    if (!this.has(nextYear, nextMonth)) {
      monthsToPrefetch.push({ year: nextYear, month: nextMonth })
    }

    return monthsToPrefetch
  }
}

// Export a singleton instance
export const transactionCache = new TransactionCache()
export type { MonthKey }
