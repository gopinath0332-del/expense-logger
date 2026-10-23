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
  pets: { emoji: '🐶', color: '#f06c59' },
  pet: { emoji: '🐶', color: '#f06c59' },
  transport: { emoji: '🚗', color: '#f59846' },
  transportation: { emoji: '🚗', color: '#f59846' },
  food: { emoji: '🍜', color: '#f8cb47' },
  culture: { emoji: '🖼️', color: '#fae545' },
  internet: { emoji: '🌐', color: '#dceb54' },
  gas: { emoji: '⛽', color: '#9fdb5c' },
  education: { emoji: '📖', color: '#70d885' },
  other: { emoji: '📦', color: '#67d6cd' },
  toys: { emoji: '🧸', color: '#67ade5' },
  toy: { emoji: '🧸', color: '#67ade5' },
  health: { emoji: '💊', color: '#8496e6' },
  social: { emoji: '👥', color: '#ab89e4' },
  'social-life': { emoji: '👥', color: '#ab89e4' },
  'self-development': { emoji: '🌱', color: '#55c797' },
  household: { emoji: '🏠', color: '#e69076' },
  apparel: { emoji: '👗', color: '#d97ec6' },
  beauty: { emoji: '💄', color: '#ea7296' },
  gift: { emoji: '🎁', color: '#e67373' },
  dues: { emoji: '🧾', color: '#8898aa' },
  salary: { emoji: '💼', color: '#48bb78' },
  freelance: { emoji: '💻', color: '#38b2ac' },
  investment: { emoji: '📈', color: '#4299e1' },
  amazon: { emoji: '📦', color: '#f59846' }
}

export function getCategoryMeta(categoryName: string, fallbackIndex = 0): CategoryMeta {
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

  // Fallback to palette color
  const color = STATS_PALETTE[fallbackIndex % STATS_PALETTE.length]
  return {
    emoji: '',
    color
  }
}
