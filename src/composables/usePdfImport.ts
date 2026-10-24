import { ref } from 'vue'
import type { ImportedTransaction, ImportStep, ImportProgress } from '@/types/pdfImport'
import type { CategoryOption } from '@/types/category'
import type { AccountOption } from '@/types/account'
import type { Transaction } from '@/types/transaction'
import { AxisBankParser } from '@/services/axisBankParser'
import { addTransaction, fetchTransactions } from '@/firebase/transactions'
import { fetchAccountOptions, fetchCategoryOptions } from '@/firebase'
import { transactionCache } from '@/services/transactionCache'
import { useSampleData } from '@/firebase/config'

import { DEFAULT_CATEGORY_OPTIONS } from '@/types/category'
import { DEFAULT_ACCOUNT_OPTIONS } from '@/types/account'

export function usePdfImport() {
  const step = ref<ImportStep>('upload')
  const transactions = ref<ImportedTransaction[]>([])
  const categories = ref<CategoryOption[]>([])
  const accounts = ref<AccountOption[]>([])
  const error = ref<string | null>(null)
  const progress = ref<ImportProgress>({ current: 0, total: 0 })
  const savedCount = ref(0)
  const skippedCount = ref(0)
  const fileName = ref('')

  const parser = new AxisBankParser()

  /**
   * Load category and account options from Firestore categories collection
   */
  async function loadOptions() {
    try {
      const [accs, cats] = await Promise.all([
        fetchAccountOptions(),
        fetchCategoryOptions()
      ])
      accounts.value = accs
      categories.value = cats
    } catch (err) {
      console.error('Failed to load accounts/categories from Firestore for import:', err)
      accounts.value = DEFAULT_ACCOUNT_OPTIONS
      categories.value = DEFAULT_CATEGORY_OPTIONS
    }
  }

  /**
   * Import PDF file: parse text and map to transaction models
   */
  async function importFile(file: File) {
    step.value = 'parsing'
    error.value = null
    fileName.value = file.name

    try {
      if (categories.value.length === 0 || accounts.value.length === 0) {
        await loadOptions()
      }

      // Read array buffer
      const buffer = await file.arrayBuffer()

      // Fetch existing transactions for duplicate detection and historical auto-learning
      let existingTransactions: Transaction[] = []
      if (!useSampleData()) {
        try {
          const existingDays = await fetchTransactions()
          existingTransactions = existingDays.flatMap((day) => day.items)
        } catch (fetchErr) {
          console.warn('Could not fetch existing transactions for auto-learning:', fetchErr)
        }
      }

      // Parse PDF
      const rawRows = await parser.parsePdf(buffer)

      if (rawRows.length === 0) {
        throw new Error('No transactions found in this PDF. Please ensure this is a valid Axis Bank statement.')
      }

      // Map to imported transactions with auto-learning & duplicate detection
      const mapped = parser.mapToImportedTransactions(
        rawRows,
        categories.value,
        accounts.value,
        existingTransactions
      )

      transactions.value = mapped
      step.value = 'reviewing'
    } catch (err: unknown) {
      console.error('PDF parsing error:', err)
      const message = err instanceof Error ? err.message : 'Failed to extract transactions from the PDF.'
      error.value = message
      step.value = 'upload'
    }
  }

  /**
   * Update a transaction row in the review table
   */
  function updateTransaction(importId: string, patch: Partial<ImportedTransaction>) {
    const idx = transactions.value.findIndex((t) => t.importId === importId)
    if (idx !== -1) {
      transactions.value[idx] = {
        ...transactions.value[idx],
        ...patch
      }
    }
  }

  /**
   * Remove a transaction from the list
   */
  function removeTransaction(importId: string) {
    transactions.value = transactions.value.filter((t) => t.importId !== importId)
  }

  /**
   * Save all non-duplicate transactions
   */
  async function saveAll() {
    const toSave = transactions.value.filter((t) => !t.isDuplicate)
    const duplicates = transactions.value.filter((t) => t.isDuplicate)

    if (toSave.length === 0) {
      error.value = 'All transactions in this list are marked as duplicates. Nothing to save.'
      return
    }

    step.value = 'saving'
    error.value = null
    progress.value = { current: 0, total: toSave.length }

    let saved = 0
    let failed = 0

    for (let i = 0; i < toSave.length; i++) {
      const tx = toSave[i]
      try {
        if (!useSampleData()) {
          await addTransaction({
            type: tx.type,
            date: tx.date,
            category: tx.category,
            subcategory: tx.subcategory || '',
            account: tx.account,
            description: tx.description,
            note: tx.note || '',
            amount: tx.amount
          })
        }
        saved++
      } catch (err) {
        console.error(`Failed to save transaction: ${tx.description} (${tx.amount})`, err)
        failed++
      }

      progress.value = { current: i + 1, total: toSave.length }
    }

    // Invalidate dashboard transaction cache
    transactionCache.clear()

    savedCount.value = saved
    skippedCount.value = duplicates.length

    if (failed > 0 && saved === 0) {
      error.value = `Failed to save transactions. Please check your connection and Firebase setup.`
      step.value = 'reviewing'
      return
    }

    step.value = 'done'
  }

  /**
   * Reset import state back to upload
   */
  function reset() {
    step.value = 'upload'
    transactions.value = []
    error.value = null
    progress.value = { current: 0, total: 0 }
    savedCount.value = 0
    skippedCount.value = 0
    fileName.value = ''
  }

  return {
    step,
    transactions,
    categories,
    accounts,
    error,
    progress,
    savedCount,
    skippedCount,
    fileName,
    loadOptions,
    importFile,
    updateTransaction,
    removeTransaction,
    saveAll,
    reset
  }
}
