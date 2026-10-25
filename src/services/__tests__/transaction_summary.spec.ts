import { describe, it, expect } from 'vitest'
import { getMonthDateRange } from '@/firebase/transactions'

describe('transaction date range and summary', () => {
  it('correctly calculates month date ranges without timezone drift', () => {
    // October 2026 (31 days)
    const oct = getMonthDateRange(2026, 10)
    expect(oct.startDate).toBe('2026-10-01')
    expect(oct.endDate).toBe('2026-10-31')

    // September 2026 (30 days)
    const sep = getMonthDateRange(2026, 9)
    expect(sep.startDate).toBe('2026-09-01')
    expect(sep.endDate).toBe('2026-09-30')

    // February leap year 2024 (29 days)
    const febLeap = getMonthDateRange(2024, 2)
    expect(febLeap.startDate).toBe('2024-02-01')
    expect(febLeap.endDate).toBe('2024-02-29')

    // February non-leap year 2025 (28 days)
    const febNonLeap = getMonthDateRange(2025, 2)
    expect(febNonLeap.startDate).toBe('2025-02-01')
    expect(febNonLeap.endDate).toBe('2025-02-28')

    // January (31 days)
    const jan = getMonthDateRange(2025, 1)
    expect(jan.startDate).toBe('2025-01-01')
    expect(jan.endDate).toBe('2025-01-31')

    // December (31 days)
    const dec = getMonthDateRange(2025, 12)
    expect(dec.startDate).toBe('2025-12-01')
    expect(dec.endDate).toBe('2025-12-31')
  })
})
