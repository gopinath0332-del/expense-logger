import {
  doc,
  getDoc,
  setDoc,
  type DocumentData
} from 'firebase/firestore'
import { db, useSampleData } from './config'
import type { GlobalBudgetSettings } from '@/types/budget'

const COLLECTION_NAME = 'budget_settings'
const DOC_ID_EXPENSE = 'global_expense'
const LOCAL_STORAGE_KEY = 'expense_logger_global_budget_expense'

/**
 * Fetch global budget settings from Firestore or localStorage fallback
 */
export async function fetchGlobalBudget(type: 'expense' | 'income' = 'expense'): Promise<GlobalBudgetSettings> {
  const docId = type === 'income' ? 'global_income' : DOC_ID_EXPENSE
  const storageKey = type === 'income' ? 'expense_logger_global_budget_income' : LOCAL_STORAGE_KEY

  if (useSampleData() || !db) {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        return JSON.parse(stored) as GlobalBudgetSettings
      }
    } catch {
      // ignore localStorage errors
    }
    return {
      type,
      categories: {}
    }
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, docId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data() as DocumentData
      const settings: GlobalBudgetSettings = {
        type,
        categories: data.categories || {},
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date()
      }
      // Keep localStorage in sync
      try {
        localStorage.setItem(storageKey, JSON.stringify(settings))
      } catch {
        // ignore
      }
      return settings
    }

    // Fallback to local storage if document doesn't exist yet
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        return JSON.parse(stored) as GlobalBudgetSettings
      }
    } catch {
      // ignore
    }

    return {
      type,
      categories: {}
    }
  } catch (error) {
    console.error('Error fetching global budget from Firestore:', error)
    // Attempt local storage fallback
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        return JSON.parse(stored) as GlobalBudgetSettings
      }
    } catch {
      // ignore
    }
    return {
      type,
      categories: {}
    }
  }
}

/**
 * Save all global budget settings to Firestore and localStorage
 */
export async function saveGlobalBudget(
  categories: Record<string, number>,
  type: 'expense' | 'income' = 'expense'
): Promise<void> {
  const docId = type === 'income' ? 'global_income' : DOC_ID_EXPENSE
  const storageKey = type === 'income' ? 'expense_logger_global_budget_income' : LOCAL_STORAGE_KEY

  const settings: GlobalBudgetSettings = {
    type,
    categories,
    updatedAt: new Date()
  }

  // Always update local storage
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings))
  } catch {
    // ignore
  }

  if (useSampleData() || !db) {
    return
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, docId)
    await setDoc(docRef, {
      type,
      categories,
      updatedAt: new Date()
    }, { merge: true })
  } catch (error) {
    console.error('Error saving global budget to Firestore:', error)
    throw error
  }
}

/**
 * Update a single category's budget amount
 */
export async function updateCategoryBudgetAmount(
  categoryId: string,
  amount: number,
  type: 'expense' | 'income' = 'expense'
): Promise<void> {
  const current = await fetchGlobalBudget(type)
  const updatedCategories = {
    ...current.categories,
    [categoryId]: amount
  }
  await saveGlobalBudget(updatedCategories, type)
}
