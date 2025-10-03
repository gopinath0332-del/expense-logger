// Firebase module exports
export { app, db, isFirebaseConfigured, useSampleData } from './config'
export {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  fetchAccountOptions,
  initializeDefaultAccountOptions,
  addAccountOption,
  updateAccountOption,
  deleteAccountOption,
  syncDefaultAccountOptions,
  fetchCategoryOptions,
  initializeDefaultCategoryOptions,
  addCategoryOption,
  updateCategoryOption,
  deleteCategoryOption,
  syncDefaultCategoryOptions
} from './database'
