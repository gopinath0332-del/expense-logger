export interface CategorySubcategory {
  id: string
  label: string
}

export interface Category {
  id: string
  label: string
  subcategories?: CategorySubcategory[]
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export type CategoryOption = Pick<Category, 'id' | 'label' | 'subcategories'>

// Version number for tracking changes to default category options
// Increment this when adding, removing, or modifying categories/subcategories
export const DEFAULT_CATEGORY_OPTIONS_VERSION = '1.1.0'

export const DEFAULT_CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'food',
    label: 'Food',
    subcategories: [
      { id: 'restaurant', label: 'Restaurant' },
      { id: 'groceries', label: 'Groceries' },
      { id: 'fast-food', label: 'Fast Food' },
      { id: 'beverages', label: 'Beverages' }
    ]
  },
  {
    id: 'social-life',
    label: 'Social Life',
    subcategories: [
      { id: 'friend', label: 'Friend' },
      { id: 'fellowship', label: 'Fellowship' },
      { id: 'alumni', label: 'Alumni' }
    ]
  },
  {
    id: 'self-development',
    label: 'Self-development',
    subcategories: [
      { id: 'books', label: 'Books' },
      { id: 'courses', label: 'Courses' },
      { id: 'workshops', label: 'Workshops' }
    ]
  },
  { id: 'transportation', label: 'Transportation' },
  { id: 'culture', label: 'Culture' },
  { id: 'household', label: 'Household' },
  { id: 'apparel', label: 'Apparel' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'health', label: 'Health' },
  { id: 'education', label: 'Education' },
  { id: 'gift', label: 'Gift' },
  { id: 'dues', label: 'Dues' },
  { id: 'other', label: 'Other' }
]

/**
 * Helper function to find a category by ID
 */
export function findCategoryById(categories: CategoryOption[], id: string): CategoryOption | undefined {
  return categories.find(cat => cat.id === id)
}

/**
 * Helper function to find a subcategory by ID within a category
 */
export function findSubcategoryById(
  category: CategoryOption,
  subcategoryId: string
): CategorySubcategory | undefined {
  return category.subcategories?.find(sub => sub.id === subcategoryId)
}

/**
 * Helper function to get formatted category label with subcategory
 */
export function getCategoryDisplayLabel(
  categories: CategoryOption[],
  categoryId: string,
  subcategoryId?: string
): string {
  const category = findCategoryById(categories, categoryId)
  if (!category) return ''

  if (subcategoryId) {
    const subcategory = findSubcategoryById(category, subcategoryId)
    return subcategory ? `${category.label} > ${subcategory.label}` : category.label
  }

  return category.label
}
