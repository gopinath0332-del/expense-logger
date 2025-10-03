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
import type { Category, CategoryOption, CategorySubcategory } from '@/types/category'
import { DEFAULT_CATEGORY_OPTIONS, DEFAULT_CATEGORY_OPTIONS_VERSION } from '@/types/category'

const CATEGORIES_COLLECTION = 'categories'

export async function fetchCategoryOptions(): Promise<CategoryOption[]> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    await syncDefaultCategoryOptions()
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION))
    if (querySnapshot.empty) {
      await initializeDefaultCategoryOptions()
      return DEFAULT_CATEGORY_OPTIONS
    }
    const categories: CategoryOption[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Category
      // Only include active categories
      if (data.isActive !== false) {
        categories.push({
          id: data.id,
          label: data.label,
          subcategories: data.subcategories
        })
      }
    })
    return categories
  } catch (error) {
    console.error('Error fetching category options:', error)
    throw error
  }
}

export async function initializeDefaultCategoryOptions(): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    const batch = []
    for (const category of DEFAULT_CATEGORY_OPTIONS) {
      const categoryData: Category = {
        ...category,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const docRef = doc(db!, CATEGORIES_COLLECTION, category.id)
      batch.push(setDoc(docRef, categoryData))
    }
    await Promise.all(batch)
    console.log('Default category options initialized successfully')
  } catch (error) {
    console.error('Error initializing default category options:', error)
    throw error
  }
}

export async function addCategoryOption(categoryOption: CategoryOption): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    const categoryData: Category = {
      ...categoryOption,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const docRef = doc(db!, CATEGORIES_COLLECTION, categoryOption.id)
    await setDoc(docRef, categoryData)
  } catch (error) {
    console.error('Error adding category option:', error)
    throw error
  }
}

export async function updateCategoryOption(
  id: string,
  updates: Partial<CategoryOption>
): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    const docRef = doc(db!, CATEGORIES_COLLECTION, id)
    const updateData = { ...updates, updatedAt: new Date() }
    await updateDoc(docRef, updateData as DocumentData)
  } catch (error) {
    console.error('Error updating category option:', error)
    throw error
  }
}

export async function deleteCategoryOption(id: string): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    await deleteDoc(doc(db!, CATEGORIES_COLLECTION, id))
  } catch (error) {
    console.error('Error deleting category option:', error)
    throw error
  }
}

export async function syncDefaultCategoryOptions(): Promise<void> {
  if (!db) throw new Error('Firebase is not initialized')
  try {
    const versionDocRef = doc(db!, 'meta', 'category_options_version')
    const versionDoc = await getDocs(collection(db, 'meta')).then(snapshot => {
      return snapshot.docs.find(d => d.id === 'category_options_version')
    })
    const currentVersion = versionDoc?.data()?.version
    if (currentVersion === DEFAULT_CATEGORY_OPTIONS_VERSION) {
      console.log('Category options are up to date')
      return
    }
    console.log(`Syncing category options from version ${currentVersion || 'unknown'} to ${DEFAULT_CATEGORY_OPTIONS_VERSION}`)
    const existingCategoriesSnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION))
    const existingCategories = new Map<string, Category>()
    existingCategoriesSnapshot.forEach((doc) => {
      const data = doc.data() as Category
      existingCategories.set(data.id, data)
    })

    const syncPromises = DEFAULT_CATEGORY_OPTIONS.map(async (defaultCategory) => {
      const existingCategory = existingCategories.get(defaultCategory.id)

      if (!existingCategory) {
        // Add new category option
        const categoryData: Category = {
          ...defaultCategory,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const docRef = doc(db!, CATEGORIES_COLLECTION, defaultCategory.id)
        await setDoc(docRef, categoryData)
        console.log(`Added new category option: ${defaultCategory.label}`)
      } else {
        // Check for changes in category or subcategories
        const hasChanges = hasCategoryChanges(existingCategory, defaultCategory)

        if (hasChanges) {
          const docRef = doc(db!, CATEGORIES_COLLECTION, defaultCategory.id)
          await updateDoc(docRef, {
            label: defaultCategory.label,
            subcategories: defaultCategory.subcategories || [],
            updatedAt: new Date()
          } as DocumentData)
          console.log(`Updated category option: ${defaultCategory.label}`)

          // Log specific changes for debugging
          if (existingCategory.label !== defaultCategory.label) {
            console.log(`  - Label changed: "${existingCategory.label}" → "${defaultCategory.label}"`)
          }

          const subcategoryChanges = getSubcategoryChanges(
            existingCategory.subcategories || [],
            defaultCategory.subcategories || []
          )
          if (subcategoryChanges.length > 0) {
            console.log(`  - Subcategory changes:`, subcategoryChanges)
          }
        }
      }

      // Remove from map to track what's left (orphaned categories)
      existingCategories.delete(defaultCategory.id)
    })

    await Promise.all(syncPromises)

    // Handle orphaned categories (exist in Firebase but not in defaults)
    if (existingCategories.size > 0) {
      console.log(`Found ${existingCategories.size} orphaned categories in Firebase:`)
      for (const [id, category] of existingCategories) {
        console.log(`  - "${category.label}" (${id}) - not in defaults, marking as inactive`)
        const docRef = doc(db!, CATEGORIES_COLLECTION, id)
        await updateDoc(docRef, {
          isActive: false,
          updatedAt: new Date()
        } as DocumentData)
      }
    }
    await setDoc(versionDocRef, {
      version: DEFAULT_CATEGORY_OPTIONS_VERSION,
      lastUpdated: new Date(),
      categoryCount: DEFAULT_CATEGORY_OPTIONS.length
    })
    console.log('Category options sync completed successfully')
  } catch (error) {
    console.error('Error syncing default category options:', error)
    throw error
  }
}

/**
 * Check if there are changes between existing and default category
 */
function hasCategoryChanges(existing: Category, defaultCategory: CategoryOption): boolean {
  // Check label change
  if (existing.label !== defaultCategory.label) {
    return true
  }

  // Check subcategories changes
  const existingSubcategories = existing.subcategories || []
  const defaultSubcategories = defaultCategory.subcategories || []

  // Different number of subcategories
  if (existingSubcategories.length !== defaultSubcategories.length) {
    return true
  }

  // Check each subcategory for changes
  for (const defaultSub of defaultSubcategories) {
    const existingSub = existingSubcategories.find(sub => sub.id === defaultSub.id)
    if (!existingSub || existingSub.label !== defaultSub.label) {
      return true
    }
  }

  // Check for removed subcategories
  for (const existingSub of existingSubcategories) {
    const defaultSub = defaultSubcategories.find(sub => sub.id === existingSub.id)
    if (!defaultSub) {
      return true
    }
  }

  return false
}

/**
 * Get detailed changes between existing and default subcategories
 */
function getSubcategoryChanges(
  existing: CategorySubcategory[],
  defaultSubs: CategorySubcategory[]
): string[] {
  const changes: string[] = []

  // Find added subcategories
  for (const defaultSub of defaultSubs) {
    const existingSub = existing.find(sub => sub.id === defaultSub.id)
    if (!existingSub) {
      changes.push(`Added "${defaultSub.label}" (${defaultSub.id})`)
    } else if (existingSub.label !== defaultSub.label) {
      changes.push(`Updated "${existingSub.label}" → "${defaultSub.label}" (${defaultSub.id})`)
    }
  }

  // Find removed subcategories
  for (const existingSub of existing) {
    const defaultSub = defaultSubs.find(sub => sub.id === existingSub.id)
    if (!defaultSub) {
      changes.push(`Removed "${existingSub.label}" (${existingSub.id})`)
    }
  }

  return changes
}
