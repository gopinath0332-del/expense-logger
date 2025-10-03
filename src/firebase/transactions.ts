import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  type DocumentData,
  type QuerySnapshot,
  type QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from './config'
import type { Transaction, TransactionDay } from '@/types/transaction'

const COLLECTION_NAME = 'transactions'

// Interface for legacy transaction data that might still be in the database
interface LegacyTransactionData {
  type?: 'income' | 'expense' | 'transfer'
  date: string
  category: string
  subcategory?: string
  account?: string
  paymentMethod?: string // Legacy field name
  description: string
  note?: string
  amount: number
}

export async function fetchTransactions(): Promise<TransactionDay[]> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'))
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q)
    return processTransactionData(querySnapshot)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw error
  }
}

// Helper interface for filtered documents
interface FilteredQuerySnapshot {
  docs: QueryDocumentSnapshot<DocumentData>[]
}

export async function fetchTransactionsByMonth(year: number, month: number): Promise<TransactionDay[]> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    // Create date range for the month (month is 0-based in Date constructor)
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0] // Last day of the month

    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('date', 'desc')
      // Note: Firestore doesn't support >= and <= on the same field without a composite index
      // For now, we'll fetch all and filter client-side. In production, you'd want to create the index.
    )
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q)

    // Filter client-side for now
    const filteredDocs = Array.from(querySnapshot.docs).filter(doc => {
      const data = doc.data()
      const docDate = data.date
      return docDate >= startDate && docDate <= endDate
    })

    // Create a new QuerySnapshot-like object with filtered docs
    return processTransactionData({ docs: filteredDocs })
  } catch (error) {
    console.error('Error fetching transactions by month:', error)
    throw error
  }
}

// Helper function to process transaction data
function processTransactionData(querySnapshot: QuerySnapshot<DocumentData> | FilteredQuerySnapshot): TransactionDay[] {
  const transactionsByDate = new Map<string, TransactionDay>()

  const docs = querySnapshot.docs

  docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
    const data = doc.data() as LegacyTransactionData
    const transaction: Transaction = {
      id: Number(doc.id.split('-')[1]) || Math.random(),
      type: data.type || 'expense',
      date: data.date,
      category: data.category,
      subcategory: data.subcategory,
      account: data.account || data.paymentMethod || '', // Support both new and legacy field names
      description: data.description,
      note: data.note,
      amount: data.amount
    }
    const date = data.date
    if (!transactionsByDate.has(date)) {
      const dateObj = new Date(date)
      transactionsByDate.set(date, {
        date,
        dateNumber: dateObj.getDate(),
        dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
        income: 0,
        expenses: 0,
        items: []
      })
    }
    const dayData = transactionsByDate.get(date)!
    dayData.items.push(transaction)
    if (transaction.amount > 0) {
      dayData.expenses += transaction.amount
    } else {
      dayData.income += Math.abs(transaction.amount)
    }
  })

  return Array.from(transactionsByDate.values())
}

export async function addTransaction(
  transaction: Omit<Transaction, 'id'> & { date: string }
): Promise<string> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), transaction)
    return docRef.id
  } catch (error) {
    console.error('Error adding transaction:', error)
    throw error
  }
}

export async function updateTransaction(
  id: string,
  transaction: Partial<Transaction> & { date?: string }
): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    const docRef = doc(db!, COLLECTION_NAME, id)
    await updateDoc(docRef, transaction as DocumentData)
  } catch (error) {
    console.error('Error updating transaction:', error)
    throw error
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    await deleteDoc(doc(db!, COLLECTION_NAME, id))
  } catch (error) {
    console.error('Error deleting transaction:', error)
    throw error
  }
}
