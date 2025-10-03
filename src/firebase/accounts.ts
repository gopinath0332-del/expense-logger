import {
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  type DocumentData
} from 'firebase/firestore'
import { db } from './config'
import type { Account, AccountOption } from '@/types/account'
import { DEFAULT_ACCOUNT_OPTIONS, DEFAULT_ACCOUNT_OPTIONS_VERSION } from '@/types/account'

const ACCOUNTS_COLLECTION = 'accounts'

export async function fetchAccountOptions(): Promise<AccountOption[]> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    await syncDefaultAccountOptions()
    const querySnapshot = await getDocs(collection(db, ACCOUNTS_COLLECTION))
    if (querySnapshot.empty) {
      await initializeDefaultAccountOptions()
      return DEFAULT_ACCOUNT_OPTIONS
    }
    const accounts: AccountOption[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Account
      accounts.push({ id: data.id, label: data.label, icon: data.icon })
    })
    return accounts
  } catch (error) {
    console.error('Error fetching account options:', error)
    throw error
  }
}

export async function initializeDefaultAccountOptions(): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    const batch = []
    for (const account of DEFAULT_ACCOUNT_OPTIONS) {
      const accountData: Account = {
        ...account,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const docRef = doc(db!, ACCOUNTS_COLLECTION, account.id)
      batch.push(setDoc(docRef, accountData))
    }
    await Promise.all(batch)
    console.log('Default account options initialized successfully')
  } catch (error) {
    console.error('Error initializing default account options:', error)
    throw error
  }
}

export async function addAccountOption(accountOption: AccountOption): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    const accountData: Account = {
      ...accountOption,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const docRef = doc(db!, ACCOUNTS_COLLECTION, accountOption.id)
    await setDoc(docRef, accountData)
  } catch (error) {
    console.error('Error adding account option:', error)
    throw error
  }
}

export async function updateAccountOption(
  id: string,
  updates: Partial<AccountOption>
): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    const docRef = doc(db!, ACCOUNTS_COLLECTION, id)
    const updateData = { ...updates, updatedAt: new Date() }
    await updateDoc(docRef, updateData as DocumentData)
  } catch (error) {
    console.error('Error updating account option:', error)
    throw error
  }
}

export async function deleteAccountOption(id: string): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    await deleteDoc(doc(db!, ACCOUNTS_COLLECTION, id))
  } catch (error) {
    console.error('Error deleting account option:', error)
    throw error
  }
}

export async function syncDefaultAccountOptions(): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    const versionDocRef = doc(db!, 'meta', 'account_options_version')
    const versionDoc = await getDocs(collection(db, 'meta')).then(snapshot => {
      return snapshot.docs.find(d => d.id === 'account_options_version')
    })
    const currentVersion = versionDoc?.data()?.version
    if (currentVersion === DEFAULT_ACCOUNT_OPTIONS_VERSION) {
      console.log('Account options are up to date')
      return
    }
    console.log(`Syncing account options from version ${currentVersion || 'unknown'} to ${DEFAULT_ACCOUNT_OPTIONS_VERSION}`)
    const existingAccountsSnapshot = await getDocs(collection(db, ACCOUNTS_COLLECTION))
    const existingAccounts = new Map<string, Account>()
    existingAccountsSnapshot.forEach((doc) => {
      const data = doc.data() as Account
      existingAccounts.set(data.id, data)
    })
    const syncPromises = DEFAULT_ACCOUNT_OPTIONS.map(async (defaultAccount) => {
      const existingAccount = existingAccounts.get(defaultAccount.id)
      if (!existingAccount) {
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
        const docRef = doc(db!, ACCOUNTS_COLLECTION, defaultAccount.id)
        await updateDoc(docRef, {
          label: defaultAccount.label,
          icon: defaultAccount.icon,
          updatedAt: new Date()
        } as DocumentData)
        console.log(`Updated account option: ${defaultAccount.label}`)
      }
    })
    await Promise.all(syncPromises)
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
