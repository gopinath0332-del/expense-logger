export interface CategoryMeta {
  emoji: string
  color: string
}

export const STATS_PALETTE = [
  '#f06c59', // coral / salmon
  '#f59846', // orange
  '#f8cb47', // amber yellow
  '#fae545', // bright yellow
  '#dceb54', // lime yellow
  '#9fdb5c', // lime green
  '#70d885', // mint green
  '#67d6cd', // turquoise
  '#67ade5', // sky blue
  '#8496e6', // periwinkle
  '#ab89e4', // purple
  '#d97ec6', // pink/orchid
  '#ea7296'  // rose
]

export const CATEGORY_META_MAP: Record<string, CategoryMeta> = {
  // Food & Dining
  food: { emoji: '🍜', color: '#f8cb47' },
  groceries: { emoji: '🛒', color: '#f8cb47' },
  restaurant: { emoji: '🍽️', color: '#f8cb47' },
  'fast-food': { emoji: '🍔', color: '#f8cb47' },
  beverages: { emoji: '🥤', color: '#f8cb47' },
  coffee: { emoji: '☕', color: '#f8cb47' },

  // Pets & Animals
  pets: { emoji: '🐶', color: '#f06c59' },
  pet: { emoji: '🐶', color: '#f06c59' },
  dog: { emoji: '🐶', color: '#f06c59' },
  cat: { emoji: '🐱', color: '#f06c59' },

  // Transport & Vehicles
  transport: { emoji: '🚗', color: '#f59846' },
  transportation: { emoji: '🚗', color: '#f59846' },
  fuel: { emoji: '⛽', color: '#9fdb5c' },
  gas: { emoji: '⛽', color: '#9fdb5c' },
  petrol: { emoji: '⛽', color: '#9fdb5c' },
  diesel: { emoji: '⛽', color: '#9fdb5c' },
  taxi: { emoji: '🚕', color: '#f59846' },
  uber: { emoji: '🚗', color: '#f59846' },
  ola: { emoji: '🚗', color: '#f59846' },
  metro: { emoji: '🚇', color: '#f59846' },

  // Utilities & Bills
  internet: { emoji: '🌐', color: '#dceb54' },
  wifi: { emoji: '🌐', color: '#dceb54' },
  bill: { emoji: '📄', color: '#a3db5b' },
  bills: { emoji: '📄', color: '#a3db5b' },
  electricity: { emoji: '⚡', color: '#f6c344' },
  water: { emoji: '💧', color: '#67ade5' },
  mobile: { emoji: '📱', color: '#dceb54' },
  recharge: { emoji: '📱', color: '#dceb54' },
  dues: { emoji: '🧾', color: '#8898aa' },

  // Shopping & Lifestyle
  apparel: { emoji: '👗', color: '#d97ec6' },
  clothing: { emoji: '👕', color: '#d97ec6' },
  clothes: { emoji: '👗', color: '#d97ec6' },
  shopping: { emoji: '🛍️', color: '#f59846' },
  amazon: { emoji: '📦', color: '#f59846' },
  flipkart: { emoji: '📦', color: '#67ade5' },
  'e-commerce': { emoji: '🛒', color: '#6eaee6' },
  'e-comerce': { emoji: '🛒', color: '#6eaee6' },
  beauty: { emoji: '💄', color: '#ea7296' },
  salon: { emoji: '💇', color: '#ea7296' },
  toys: { emoji: '🧸', color: '#67ade5' },
  toy: { emoji: '🧸', color: '#67ade5' },

  // Health & Fitness
  health: { emoji: '💊', color: '#8496e6' },
  medical: { emoji: '🏥', color: '#8496e6' },
  medicine: { emoji: '💊', color: '#8496e6' },
  pharmacy: { emoji: '💊', color: '#8496e6' },
  fitness: { emoji: '🏋️', color: '#48bb78' },
  gym: { emoji: '🏋️', color: '#48bb78' },
  sports: { emoji: '🏸', color: '#ab89e4' },
  badminton: { emoji: '🏸', color: '#ab89e4' },

  // Education & Learning
  education: { emoji: '📖', color: '#70d885' },
  school: { emoji: '🏫', color: '#70d885' },
  college: { emoji: '🎓', color: '#70d885' },
  books: { emoji: '📚', color: '#70d885' },
  courses: { emoji: '💻', color: '#70d885' },
  workshops: { emoji: '🛠️', color: '#70d885' },
  'self-development': { emoji: '🌱', color: '#55c797' },

  // Entertainment & Culture
  culture: { emoji: '🖼️', color: '#fae545' },
  entertainment: { emoji: '🍿', color: '#fae545' },
  movies: { emoji: '🎬', color: '#fae545' },
  games: { emoji: '🎮', color: '#9b8be0' },

  // Home & Living
  household: { emoji: '🏠', color: '#e69076' },
  rent: { emoji: '🔑', color: '#e69076' },
  furniture: { emoji: '🛋️', color: '#e69076' },
  maintenance: { emoji: '🔧', color: '#8898aa' },

  // Social & Family
  social: { emoji: '👥', color: '#ab89e4' },
  'social-life': { emoji: '👥', color: '#ab89e4' },
  friend: { emoji: '🤝', color: '#ab89e4' },
  fellowship: { emoji: '🍻', color: '#ab89e4' },
  alumni: { emoji: '🎓', color: '#ab89e4' },
  gift: { emoji: '🎁', color: '#e67373' },

  // Financial & Income
  salary: { emoji: '💼', color: '#48bb78' },
  freelance: { emoji: '💻', color: '#38b2ac' },
  investment: { emoji: '📈', color: '#4299e1' },
  interest: { emoji: '💰', color: '#48bb78' },
  bonus: { emoji: '🎉', color: '#f6c344' },
  insurance: { emoji: '🛡️', color: '#4299e1' },
  tax: { emoji: '🏛️', color: '#8898aa' },

  // Travel
  travel: { emoji: '✈️', color: '#6eaee6' },
  hotel: { emoji: '🏨', color: '#6eaee6' },

  // General & Fallback
  other: { emoji: '📦', color: '#67d6cd' },
  general: { emoji: '🏷️', color: '#8898aa' }
}

/**
 * Returns full metadata (emoji and color) for a given category name
 */
export function getCategoryMeta(categoryName: string, fallbackIndex = 0): CategoryMeta {
  if (!categoryName) {
    return { emoji: '🏷️', color: STATS_PALETTE[fallbackIndex % STATS_PALETTE.length] }
  }

  const normalized = categoryName.trim().toLowerCase().replace(/\s+/g, '-')
  if (CATEGORY_META_MAP[normalized]) {
    return CATEGORY_META_MAP[normalized]
  }

  // Look for partial key match
  for (const key of Object.keys(CATEGORY_META_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return CATEGORY_META_MAP[key]
    }
  }

  // Fallback
  return {
    emoji: '🏷️',
    color: STATS_PALETTE[fallbackIndex % STATS_PALETTE.length]
  }
}

/**
 * Convenience helper to return just the emoji icon for a category
 */
export function getCategoryIcon(categoryName: string): string {
  return getCategoryMeta(categoryName).emoji
}
