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
import type { Category, CategoryOption } from '@/types/category'

const CATEGORIES_COLLECTION = 'categories'

/**
 * Fetch all active category options directly from Firestore
 */
export async function fetchCategoryOptions(): Promise<CategoryOption[]> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION))
    const categories: CategoryOption[] = []
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Category
      // Only include active categories
      if (data.isActive !== false) {
        categories.push({
          id: data.id,
          label: data.label,
          icon: data.icon,
          subcategories: data.subcategories || []
        })
      }
    })
    return categories
  } catch (error) {
    console.error('Error fetching category options from Firestore:', error)
    throw error
  }
}

/**
 * Add a new category option to Firestore
 */
export async function addCategoryOption(categoryOption: CategoryOption): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    const categoryData: Category = {
      ...categoryOption,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryOption.id)
    await setDoc(docRef, categoryData)
  } catch (error) {
    console.error('Error adding category option:', error)
    throw error
  }
}

/**
 * Update an existing category option in Firestore
 */
export async function updateCategoryOption(
  id: string,
  updates: Partial<CategoryOption>
): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id)
    const updateData = { ...updates, updatedAt: new Date() }
    await updateDoc(docRef, updateData as DocumentData)
  } catch (error) {
    console.error('Error updating category option:', error)
    throw error
  }
}

/**
 * Soft delete or remove category option in Firestore
 */
export async function deleteCategoryOption(id: string): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id)
    // Soft delete to preserve referential integrity of existing transactions
    await updateDoc(docRef, { isActive: false, updatedAt: new Date() })
  } catch (error) {
    console.error('Error deleting category option:', error)
    throw error
  }
}

/**
 * Permanent delete category option from Firestore
 */
export async function hardDeleteCategoryOption(id: string): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, id))
  } catch (error) {
    console.error('Error hard deleting category option:', error)
    throw error
  }
}

/**
 * No-op retained for backwards compatibility
 */
export async function syncDefaultCategoryOptions(): Promise<void> {
  // Categories are now 100% managed in Firestore. No-op.
}
