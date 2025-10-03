import { describe, it, expect, vi } from 'vitest'
import {
  fetchCategoryOptions,
  initializeDefaultCategoryOptions,
  addCategoryOption,
  updateCategoryOption,
  deleteCategoryOption,
  syncDefaultCategoryOptions
} from '@/firebase/categories'
import {
  DEFAULT_CATEGORY_OPTIONS,
  DEFAULT_CATEGORY_OPTIONS_VERSION,
  findCategoryById,
  findSubcategoryById,
  getCategoryDisplayLabel
} from '@/types/category'

// Mock Firebase
vi.mock('@/firebase/config', () => ({
  db: {}
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn()
}))

describe('Category Options Firebase Functions', () => {
  it('should have default category options defined', () => {
    expect(DEFAULT_CATEGORY_OPTIONS).toBeDefined()
    expect(DEFAULT_CATEGORY_OPTIONS.length).toBeGreaterThan(0)
    expect(DEFAULT_CATEGORY_OPTIONS).toContain(
      expect.objectContaining({
        id: 'food',
        label: 'Food'
      })
    )
    expect(DEFAULT_CATEGORY_OPTIONS.find(cat => cat.id === 'food')?.subcategories).toContain(
      expect.objectContaining({
        id: 'restaurant',
        label: 'Restaurant'
      })
    )
  })

  it('should export Firebase category functions', () => {
    expect(fetchCategoryOptions).toBeDefined()
    expect(initializeDefaultCategoryOptions).toBeDefined()
    expect(addCategoryOption).toBeDefined()
    expect(updateCategoryOption).toBeDefined()
    expect(deleteCategoryOption).toBeDefined()
    expect(syncDefaultCategoryOptions).toBeDefined()
  })

  it('should have version tracking for default category options', () => {
    expect(DEFAULT_CATEGORY_OPTIONS_VERSION).toBeDefined()
    expect(typeof DEFAULT_CATEGORY_OPTIONS_VERSION).toBe('string')
    expect(DEFAULT_CATEGORY_OPTIONS_VERSION.length).toBeGreaterThan(0)
  })

  describe('Helper Functions', () => {
    const mockCategories = [
      {
        id: 'food',
        label: 'Food',
        subcategories: [
          { id: 'restaurant', label: 'Restaurant' },
          { id: 'groceries', label: 'Groceries' }
        ]
      },
      {
        id: 'transport',
        label: 'Transportation'
      }
    ]

    it('should find category by ID', () => {
      const category = findCategoryById(mockCategories, 'food')
      expect(category).toBeDefined()
      expect(category?.label).toBe('Food')

      const notFound = findCategoryById(mockCategories, 'nonexistent')
      expect(notFound).toBeUndefined()
    })

    it('should find subcategory by ID', () => {
      const foodCategory = mockCategories[0]
      const subcategory = findSubcategoryById(foodCategory, 'restaurant')
      expect(subcategory).toBeDefined()
      expect(subcategory?.label).toBe('Restaurant')

      const notFound = findSubcategoryById(foodCategory, 'nonexistent')
      expect(notFound).toBeUndefined()
    })

    it('should get category display label', () => {
      // Category only
      const categoryOnly = getCategoryDisplayLabel(mockCategories, 'transport')
      expect(categoryOnly).toBe('Transportation')

      // Category with subcategory
      const withSubcategory = getCategoryDisplayLabel(mockCategories, 'food', 'restaurant')
      expect(withSubcategory).toBe('Food > Restaurant')

      // Invalid category
      const invalid = getCategoryDisplayLabel(mockCategories, 'nonexistent')
      expect(invalid).toBe('')

      // Invalid subcategory (should fallback to category)
      const invalidSub = getCategoryDisplayLabel(mockCategories, 'food', 'nonexistent')
      expect(invalidSub).toBe('Food')
    })
  })
})
