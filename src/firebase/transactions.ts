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
  type QuerySnapshot
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
    const transactionsByDate = new Map<string, TransactionDay>()
    querySnapshot.forEach((doc) => {
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
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw error
  }
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
