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

/**
 * Fetch all transactions from Firestore
 */
export async function fetchTransactions(): Promise<TransactionDay[]> {
  if (!db) {
    throw new Error('Firebase is not initialized')
  }

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'))
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q)
    
    // Group transactions by date
    const transactionsByDate = new Map<string, TransactionDay>()
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Transaction & { date: string }
      const transaction: Transaction = {
        id: Number(doc.id.split('-')[1]) || Math.random(),
        category: data.category,
        subcategory: data.subcategory,
        paymentMethod: data.paymentMethod,
        description: data.description,
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
      
      // Update income/expenses totals
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

/**
 * Add a new transaction to Firestore
 */
export async function addTransaction(
  transaction: Omit<Transaction, 'id'> & { date: string }
): Promise<string> {
  if (!db) {
    throw new Error('Firebase is not initialized')
  }

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), transaction)
    return docRef.id
  } catch (error) {
    console.error('Error adding transaction:', error)
    throw error
  }
}

/**
 * Update an existing transaction in Firestore
 */
export async function updateTransaction(
  id: string,
  transaction: Partial<Transaction> & { date?: string }
): Promise<void> {
  if (!db) {
    throw new Error('Firebase is not initialized')
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, transaction as DocumentData)
  } catch (error) {
    console.error('Error updating transaction:', error)
    throw error
  }
}

/**
 * Delete a transaction from Firestore
 */
export async function deleteTransaction(id: string): Promise<void> {
  if (!db) {
    throw new Error('Firebase is not initialized')
  }

  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id))
  } catch (error) {
    console.error('Error deleting transaction:', error)
    throw error
  }
}
