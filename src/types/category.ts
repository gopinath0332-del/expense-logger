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
