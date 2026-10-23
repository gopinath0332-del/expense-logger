import type { Transaction } from './transaction'

/** One raw row extracted from the bank PDF before field mapping */
export interface RawBankRow {
  date: string // raw string from PDF e.g. "25-07-2025"
  narration: string // full transaction narration / description
  chequeRef: string // cheque or reference number
  debit: number | null // debit amount (expense)
  credit: number | null // credit amount (income)
  balance: number | null // running balance
}

/** A parsed row ready for the review table — all fields are editable by the user */
export interface ImportedTransaction extends Omit<Transaction, 'id'> {
  rawNarration: string // keep original narration for debugging / display
  isDuplicate: boolean // true when the same transaction already exists in Firestore
  importId: string // temporary client-side UUID used as table row key
}

/** Steps in the import wizard */
export type ImportStep = 'upload' | 'parsing' | 'reviewing' | 'saving' | 'done' | 'error'

/** Progress tracking for the saving step */
export interface ImportProgress {
  current: number
  total: number
}
