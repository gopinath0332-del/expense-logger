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
export const DEFAULT_CATEGORY_OPTIONS_VERSION = '1.3.0'

export const DEFAULT_CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'food',
    label: 'Food',
    icon: '🍜',
    subcategories: [
      { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
      { id: 'groceries', label: 'Groceries', icon: '🛒' },
      { id: 'fast-food', label: 'Fast Food', icon: '🍔' },
      { id: 'beverages', label: 'Beverages', icon: '🥤' },
      { id: 'snacks', label: 'Snacks', icon: '🍿' },
      { id: 'eating-out', label: 'Eating Out', icon: '🍲' }
    ]
  },
  {
    id: 'bill',
    label: 'Bill',
    icon: '📄',
    subcategories: [
      { id: 'electricity', label: 'Electricity', icon: '⚡' },
      { id: 'internet', label: 'Internet', icon: '🌐' },
      { id: 'water', label: 'Water', icon: '💧' },
      { id: 'mobile', label: 'Mobile Recharge', icon: '📱' },
      { id: 'gas', label: 'Gas', icon: '🔥' }
    ]
  },
  {
    id: 'pet',
    label: 'Pet',
    icon: '🐶',
    subcategories: [
      { id: 'fish', label: 'Fish', icon: '🐟' },
      { id: 'dog', label: 'Dog', icon: '🐕' },
      { id: 'cat', label: 'Cat', icon: '🐈' },
      { id: 'vet', label: 'Vet & Health', icon: '🩺' },
      { id: 'pet-food', label: 'Pet Food', icon: '🦴' }
    ]
  },
  {
    id: 'transportation',
    label: 'Transportation',
    icon: '🚗',
    subcategories: [
      { id: 'fuel', label: 'Fuel', icon: '⛽' },
      { id: 'taxi', label: 'Taxi & Cab', icon: '🚕' },
      { id: 'parking', label: 'Parking & Toll', icon: '🅿️' },
      { id: 'transit', label: 'Public Transit', icon: '🚇' }
    ]
  },
  {
    id: 'apparel',
    label: 'Apparel',
    icon: '👗',
    subcategories: [
      { id: 'clothing', label: 'Clothing', icon: '👕' },
      { id: 'footwear', label: 'Footwear', icon: '👟' },
      { id: 'accessories', label: 'Accessories', icon: '👜' }
    ]
  },
  {
    id: 'e-comerce',
    label: 'E-Commerce',
    icon: '🛍️',
    subcategories: [
      { id: 'amazon', label: 'Amazon', icon: '📦' },
      { id: 'flipkart', label: 'Flipkart', icon: '📦' },
      { id: 'general-shopping', label: 'General Shopping', icon: '🛒' }
    ]
  },
  {
    id: 'school',
    label: 'School',
    icon: '🎒',
    subcategories: [
      { id: 'general-store', label: 'General Store', icon: '🏪' },
      { id: 'stationaries', label: 'Stationaries', icon: '✏️' },
      { id: 'fees', label: 'Tuition & Fees', icon: '📝' }
    ]
  },
  {
    id: 'health',
    label: 'Health',
    icon: '💊',
    subcategories: [
      { id: 'medicine', label: 'Medicine', icon: '💊' },
      { id: 'doctor', label: 'Doctor & Hospital', icon: '🏥' },
      { id: 'fitness', label: 'Fitness & Gym', icon: '🏋️' }
    ]
  },
  {
    id: 'badminton',
    label: 'Badminton',
    icon: '🏸',
    subcategories: [
      { id: 'court-booking', label: 'Court Booking', icon: '🏟️' },
      { id: 'gear', label: 'Gear & Supplies', icon: '🏸' }
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
  { id: 'culture', label: 'Culture', icon: '🖼️' },
  { id: 'household', label: 'Household', icon: '🏠' },
  { id: 'beauty', label: 'Beauty', icon: '💄' },
  { id: 'education', label: 'Education', icon: '📖' },
  { id: 'gift', label: 'Gift', icon: '🎁' },
  { id: 'dues', label: 'Dues', icon: '🧾' },
  { id: 'emi', label: 'EMI', icon: '💳' },
  { id: 'internet-bill', label: 'Internet Bill', icon: '🌐' },
  { id: 'zerodha', label: 'Zerodha', icon: '📈' },
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
