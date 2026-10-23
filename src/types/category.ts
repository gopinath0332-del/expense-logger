export interface CategorySubcategory {
  id: string
  label: string
  icon?: string
}

export interface Category {
  id: string
  label: string
  icon?: string
  subcategories?: CategorySubcategory[]
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export type CategoryOption = Pick<Category, 'id' | 'label' | 'icon' | 'subcategories'>

// Version number for tracking changes to default category options
// Increment this when adding, removing, or modifying categories/subcategories
export const DEFAULT_CATEGORY_OPTIONS_VERSION = '1.2.0'

export const DEFAULT_CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'food',
    label: 'Food',
    icon: '🍜',
    subcategories: [
      { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
      { id: 'groceries', label: 'Groceries', icon: '🛒' },
      { id: 'fast-food', label: 'Fast Food', icon: '🍔' },
      { id: 'beverages', label: 'Beverages', icon: '🥤' }
    ]
  },
  {
    id: 'social-life',
    label: 'Social Life',
    icon: '👥',
    subcategories: [
      { id: 'friend', label: 'Friend', icon: '🤝' },
      { id: 'fellowship', label: 'Fellowship', icon: '🍻' },
      { id: 'alumni', label: 'Alumni', icon: '🎓' }
    ]
  },
  {
    id: 'self-development',
    label: 'Self-development',
    icon: '🌱',
    subcategories: [
      { id: 'books', label: 'Books', icon: '📚' },
      { id: 'courses', label: 'Courses', icon: '💻' },
      { id: 'workshops', label: 'Workshops', icon: '🛠️' }
    ]
  },
  { id: 'transportation', label: 'Transportation', icon: '🚗' },
  { id: 'culture', label: 'Culture', icon: '🖼️' },
  { id: 'household', label: 'Household', icon: '🏠' },
  { id: 'apparel', label: 'Apparel', icon: '👗' },
  { id: 'beauty', label: 'Beauty', icon: '💄' },
  { id: 'health', label: 'Health', icon: '💊' },
  { id: 'education', label: 'Education', icon: '📖' },
  { id: 'gift', label: 'Gift', icon: '🎁' },
  { id: 'dues', label: 'Dues', icon: '🧾' },
  { id: 'other', label: 'Other', icon: '📦' }
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
