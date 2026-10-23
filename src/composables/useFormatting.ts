export function useFormatting() {
  const inFormatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  /**
   * Formats a number as Indian-locale currency with 2 decimal places
   */
  const formatCurrency = (amount: number): string => {
    return inFormatter.format(amount)
  }

  /**
   * Formats a number with Indian grouping (e.g. 1,02,604.64)
   */
  const formatNumber = (amount: number): string => {
    return inFormatter.format(amount)
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
