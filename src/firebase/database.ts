import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy,
  type DocumentData,
  type QuerySnapshot
} from 'firebase/firestore'
import { db } from './config'
import type { Transaction, TransactionDay } from '@/types/transaction'
import type { Account, AccountOption } from '@/types/account'
import { DEFAULT_ACCOUNT_OPTIONS, DEFAULT_ACCOUNT_OPTIONS_VERSION } from '@/types/account'

const COLLECTION_NAME = 'transactions'
const ACCOUNTS_COLLECTION = 'accounts'

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

/**
 * Fetch all account options from Firestore
 */
export async function fetchAccountOptions(): Promise<AccountOption[]> {
  if (!db) {
    throw new Error('Firebase is not initialized')
  }

  try {
    // Check if sync is needed and perform it
    await syncDefaultAccountOptions()

    const querySnapshot = await getDocs(collection(db, ACCOUNTS_COLLECTION))

    if (querySnapshot.empty) {
      // If no accounts exist, initialize with defaults
      await initializeDefaultAccountOptions()
      return DEFAULT_ACCOUNT_OPTIONS
    }

    const accounts: AccountOption[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Account
      accounts.push({
        id: data.id,
        label: data.label,
        icon: data.icon
      })
    })

    return accounts
  } catch (error) {
    console.error('Error fetching account options:', error)
    throw error
  }
}/**
 * Initialize default account options in Firestore if they don't exist
 */
export async function initializeDefaultAccountOptions(): Promise<void> {
  if (!db) {
    throw new Error('Firebase is not initialized')
  }

  try {
    const batch = []

    for (const account of DEFAULT_ACCOUNT_OPTIONS) {
      const accountData: Account = {
        ...account,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = doc(db, ACCOUNTS_COLLECTION, account.id)
      batch.push(setDoc(docRef, accountData))
    }

    await Promise.all(batch)
    console.log('Default account options initialized successfully')
  } catch (error) {
    console.error('Error initializing default account options:', error)
    throw error
  }
}

/**
 * Add a new account option to Firestore
 */
export async function addAccountOption(accountOption: AccountOption): Promise<void> {
  if (!db) {
    throw new Error('Firebase is not initialized')
  }

  try {
    const accountData: Account = {
      ...accountOption,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const docRef = doc(db, ACCOUNTS_COLLECTION, accountOption.id)
    await setDoc(docRef, accountData)
  } catch (error) {
    console.error('Error adding account option:', error)
    throw error
  }
}

/**
 * Update an existing account option in Firestore
 */
export async function updateAccountOption(
  id: string,
  updates: Partial<AccountOption>
): Promise<void> {
  if (!db) {
    throw new Error('Firebase is not initialized')
  }

  try {
    const docRef = doc(db, ACCOUNTS_COLLECTION, id)
    const updateData = {
      ...updates,
      updatedAt: new Date()
    }
    await updateDoc(docRef, updateData as DocumentData)
  } catch (error) {
    console.error('Error updating account option:', error)
    throw error
  }
}

/**
 * Delete an account option from Firestore
 */
export async function deleteAccountOption(id: string): Promise<void> {
  if (!db) {
    throw new Error('Firebase is not initialized')
  }

  try {
    await deleteDoc(doc(db, ACCOUNTS_COLLECTION, id))
  } catch (error) {
    console.error('Error deleting account option:', error)
    throw error
  }
}

/**
 * Sync DEFAULT_ACCOUNT_OPTIONS updates to Firebase database
 * This function compares the current defaults with what's in Firebase
 * and adds any missing options or updates changed ones
 */
export async function syncDefaultAccountOptions(): Promise<void> {
  if (!db) {
    throw new Error('Firebase is not initialized')
  }

  try {
    // Check if version tracking document exists
    const versionDocRef = doc(db, 'meta', 'account_options_version')
    const versionDoc = await getDocs(collection(db, 'meta')).then(snapshot => {
      return snapshot.docs.find(d => d.id === 'account_options_version')
    })

    const currentVersion = versionDoc?.data()?.version

    // If versions match, no sync needed
    if (currentVersion === DEFAULT_ACCOUNT_OPTIONS_VERSION) {
      console.log('Account options are up to date')
      return
    }

    console.log(`Syncing account options from version ${currentVersion || 'unknown'} to ${DEFAULT_ACCOUNT_OPTIONS_VERSION}`)

    // Get existing accounts from Firebase
    const existingAccountsSnapshot = await getDocs(collection(db, ACCOUNTS_COLLECTION))
    const existingAccounts = new Map<string, Account>()

    existingAccountsSnapshot.forEach((doc) => {
      const data = doc.data() as Account
      existingAccounts.set(data.id, data)
    })

    // Sync each default account option
    const syncPromises = DEFAULT_ACCOUNT_OPTIONS.map(async (defaultAccount) => {
      const existingAccount = existingAccounts.get(defaultAccount.id)

      if (!existingAccount) {
        // Add new account option
        const accountData: Account = {
          ...defaultAccount,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const docRef = doc(db!, ACCOUNTS_COLLECTION, defaultAccount.id)
        await setDoc(docRef, accountData)
        console.log(`Added new account option: ${defaultAccount.label}`)
      } else if (
        existingAccount.label !== defaultAccount.label ||
        existingAccount.icon !== defaultAccount.icon
      ) {
        // Update changed account option
        const docRef = doc(db!, ACCOUNTS_COLLECTION, defaultAccount.id)
        await updateDoc(docRef, {
          label: defaultAccount.label,
          icon: defaultAccount.icon,
          updatedAt: new Date()
        } as DocumentData)
        console.log(`Updated account option: ${defaultAccount.label}`)
      }
    })

    // Wait for all sync operations to complete
    await Promise.all(syncPromises)

    // Update version tracking
    await setDoc(versionDocRef, {
      version: DEFAULT_ACCOUNT_OPTIONS_VERSION,
      lastUpdated: new Date(),
      accountCount: DEFAULT_ACCOUNT_OPTIONS.length
    })

    console.log('Account options sync completed successfully')
  } catch (error) {
    console.error('Error syncing default account options:', error)
    throw error
  }
}
