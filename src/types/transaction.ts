export interface Transaction {
  id: number
  category: string
  subcategory?: string
  paymentMethod: string
  description: string
  amount: number
}

export interface TransactionDay {
  date: string
  dateNumber: number
  dayName: string
  income: number
  expenses: number
  items: Transaction[]
}

export interface DashboardSummary {
  income: number
  expenses: number
  total: number
}

export interface TabConfig {
  name: string
  label: string
}

export interface NavItem {
  id: string
  icon: string
  label: string
  active: boolean
}

export interface Subcategory {
  id: string
  label: string
}

export interface Category {
  id: string
  label: string
  subcategories?: Subcategory[]
}
