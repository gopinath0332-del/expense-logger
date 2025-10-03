export interface Account {
  id: string
  label: string
  icon: string
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export type AccountOption = Pick<Account, 'id' | 'label' | 'icon'>

// Version number for tracking changes to default account options
export const DEFAULT_ACCOUNT_OPTIONS_VERSION = '1.0.0'

export const DEFAULT_ACCOUNT_OPTIONS: AccountOption[] = [
  { id: 'cash', label: 'Cash', icon: 'bi bi-cash' },
  { id: 'bank', label: 'Bank Account', icon: 'bi bi-bank' },
  { id: 'credit-card', label: 'Credit Card', icon: 'bi bi-credit-card' },
  { id: 'debit-card', label: 'Debit Cards', icon: 'bi bi-credit-card-2-front' },
  { id: 'upi', label: 'UPI', icon: 'bi bi-phone' },
  { id: 'wallet', label: 'Wallet', icon: 'bi bi-wallet2' },
  { id: 'cash-back', label: 'Cash Back', icon: 'bi bi-arrow-left-circle' }
]
