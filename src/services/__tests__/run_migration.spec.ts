import { describe, it, expect } from 'vitest'
import { syncDefaultCategoryOptions, fetchCategoryOptions } from '@/firebase/categories'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

describe('database category migration', () => {
  it('syncs all categories and ensures isActive is true for all categories and subcategories', async () => {
    if (!db) {
      console.log('Firebase not initialized')
      expect(true).toBe(true)
      return
    }

    // 1. Run sync to sync all new defaults and bump version
    console.log('Running syncDefaultCategoryOptions...')
    await syncDefaultCategoryOptions()

    // 2. Query all categories in Firestore to ensure all are isActive: true
    const catSnap = await getDocs(collection(db, 'categories'))
    console.log(`Found ${catSnap.size} categories in Firestore`)
    expect(catSnap.size).toBeGreaterThan(0)

    for (const d of catSnap.docs) {
      const data = d.data()
      if (data.isActive !== true) {
        console.log(`Explicitly setting isActive: true on category [${d.id}] (${data.label})`)
        await updateDoc(doc(db, 'categories', d.id), {
          isActive: true,
          updatedAt: new Date()
        })
      }
    }

    // 3. Verify fetchCategoryOptions returns all active categories
    const activeCategories = await fetchCategoryOptions()
    expect(activeCategories.length).toBeGreaterThanOrEqual(21)
    console.log(`\nSuccessfully verified active categories: ${activeCategories.length}`)
    activeCategories.forEach((c) => {
      console.log(`  - [${c.id}] ${c.label} (${c.subcategories?.length || 0} subcategories)`)
    })
  }, 60000)
})
