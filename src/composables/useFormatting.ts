export function useFormatting() {
  /**
   * Formats a number as currency with 2 decimal places
   */
  const formatCurrency = (amount: number): string => {
    return amount.toFixed(2)
  }

  /**
   * Formats a number with 2 decimal places
   */
  const formatNumber = (amount: number): string => {
    return amount.toFixed(2)
  }

  /**
   * Formats a date to display month and year
   */
  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  }

  /**
   * Formats a date to display day name
   */
  const formatDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short'
    })
  }

  return {
    formatCurrency,
    formatNumber,
    formatMonthYear,
    formatDayName
  }
}
