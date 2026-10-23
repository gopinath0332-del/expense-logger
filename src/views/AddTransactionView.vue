<template>
  <div class="add-transaction-container">
    <!-- Header -->
    <div class="header">
      <button class="btn btn-link back-btn" @click="goBack">
        <i class="bi bi-chevron-left"></i>
      </button>
      <h5 class="header-title">{{ isEditMode ? 'Edit Transaction' : 'Trans.' }}</h5>
      <button class="btn btn-link" v-if="!isEditMode">
        <i class="bi bi-star"></i>
      </button>
      <div v-else style="width: 40px"></div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner-border text-danger" role="status">
        <span class="visually-hidden">Loading…</span>
      </div>
      <p class="mt-2 text-muted">Loading transaction…</p>
    </div>

    <template v-else>
      <!-- Transaction Type Tabs -->
      <div class="transaction-tabs">
        <button
          v-for="tab in transactionTabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id as 'income' | 'expense' | 'transfer'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Form -->
      <div class="form-container">
        <!-- Date Field -->
        <div class="form-group">
          <label class="form-label">Date</label>
          <div class="date-input-group">
            <input
              v-model="formData.date"
              type="date"
              class="form-control"
            />
            <button class="btn btn-link repeat-btn" v-if="!isEditMode">
              <i class="bi bi-arrow-repeat"></i>
              <small>Repeat</small>
            </button>
          </div>
        </div>

        <!-- Amount Field -->
        <div class="form-group">
          <label class="form-label">Amount</label>
          <input
            v-model="formData.amount"
            type="number"
            step="0.01"
            class="form-control"
            placeholder="0.00"
          />
        </div>

        <!-- Category Field -->
        <div class="form-group">
          <label class="form-label">Category</label>
          <div class="selector-field" @click="showCategorySelector = true">
            <span class="selector-text" :class="{ placeholder: !selectedCategoryLabel }">
              {{ selectedCategoryLabel || 'Select category' }}
            </span>
            <i class="bi bi-chevron-down selector-arrow"></i>
          </div>
        </div>

        <!-- Account Field -->
        <div class="form-group">
          <label class="form-label">Account</label>
          <div class="selector-field" @click="showAccountSelector = true">
            <span class="selector-text" :class="{ placeholder: !selectedAccountLabel }">
              {{ selectedAccountLabel || 'Select account' }}
            </span>
            <i class="bi bi-chevron-down selector-arrow"></i>
          </div>
        </div>

        <!-- Note Field -->
        <div class="form-group">
          <label class="form-label">Note</label>
          <div class="note-input-group">
            <input
              v-model="formData.note"
              type="text"
              class="form-control"
              placeholder="Add a note..."
            />
            <button class="btn btn-link note-btn">
              <i class="bi bi-chat-dots"></i>
            </button>
          </div>
        </div>

        <!-- Description Field -->
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea
            v-model="formData.description"
            class="form-control"
            rows="3"
            placeholder="Add a description..."
          ></textarea>
        </div>

        <!-- Attachment (add mode only) -->
        <div class="attachment-section" v-if="!isEditMode">
          <button class="btn btn-link attachment-btn">
            <i class="bi bi-camera"></i>
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons" v-if="isEditMode">
        <button
          class="btn btn-danger save-btn"
          @click="updateTransaction"
          :disabled="isSaving"
        >
          <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status"></span>
          {{ isSaving ? 'Saving…' : 'Update' }}
        </button>
        <button
          class="btn btn-outline-danger delete-btn"
          @click="confirmDelete"
          :disabled="isSaving"
        >
          <i class="bi bi-trash3"></i>
        </button>
      </div>

      <div class="action-buttons" v-else>
        <button class="btn btn-danger save-btn" @click="saveTransaction" :disabled="isSaving">
          <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status"></span>
          {{ isSaving ? 'Saving…' : 'Save' }}
        </button>
        <button class="btn btn-outline-secondary continue-btn" @click="continueTransaction" :disabled="isSaving">
          Continue
        </button>
      </div>
    </template>

    <!-- Delete confirmation modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="confirm-modal">
        <div class="confirm-icon">
          <i class="bi bi-exclamation-triangle-fill text-danger"></i>
        </div>
        <h6 class="confirm-title">Delete Transaction?</h6>
        <p class="confirm-body text-muted">This action cannot be undone.</p>
        <div class="confirm-actions">
          <button class="btn btn-outline-secondary" @click="showDeleteConfirm = false">Cancel</button>
          <button class="btn btn-danger" @click="deleteTransactionConfirmed" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status"></span>
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Category Selector Modal -->
    <CategorySelector
      :isVisible="showCategorySelector"
      :selectedCategory="formData.category"
      :selectedSubcategory="formData.subcategory"
      :categories="categoryOptions"
      @close="showCategorySelector = false"
      @select="handleCategorySelect"
      @refresh="refreshCategoryOptions"
    />

    <!-- Account Selector Modal -->
    <AccountSelector
      :isVisible="showAccountSelector"
      :selectedAccount="formData.account"
      :accounts="accountOptions"
      @close="showAccountSelector = false"
      @select="handleAccountSelect"
      @refresh="refreshAccountOptions"
    />

    <!-- Toast notification -->
    <ToastNotification
      v-if="toast.visible"
      :message="toast.message"
      :type="toast.type"
      @dismiss="toast.visible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CategorySelector from '@/components/CategorySelector.vue'
import AccountSelector from '@/components/AccountSelector.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import { fetchAccountOptions, fetchCategoryOptions } from '@/firebase'
import { addTransaction, updateTransaction as updateTransactionFirestore, deleteTransaction as deleteTransactionFirestore } from '@/firebase/transactions'
import { db } from '@/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import type { AccountOption } from '@/types/account'
import type { CategoryOption } from '@/types/category'
import { getCategoryDisplayLabel } from '@/types/category'

const router = useRouter()
const route = useRoute()

// Detect edit mode from route param
const firestoreId = computed(() => route.params.firestoreId as string | undefined)
const isEditMode = computed(() => !!firestoreId.value)

// Transaction types
const transactionTabs = [
  { id: 'income', label: 'Income' },
  { id: 'expense', label: 'Expense' },
  { id: 'transfer', label: 'Transfer' }
]

// Reactive state
const isLoading = ref(false)
const isSaving = ref(false)
const activeTab = ref<'income' | 'expense' | 'transfer'>('expense')
const showCategorySelector = ref(false)
const showAccountSelector = ref(false)
const showDeleteConfirm = ref(false)
const accountOptions = ref<AccountOption[]>([])
const categoryOptions = ref<CategoryOption[]>([])

const formData = ref({
  date: new Date().toISOString().split('T')[0],
  amount: '',
  category: '',
  subcategory: '',
  account: '',
  note: '',
  description: ''
})

const toast = reactive<{ visible: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({
  visible: false,
  message: '',
  type: 'success'
})

function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
  toast.message = message
  toast.type = type
  toast.visible = true
}

// Load options from Firebase (with fallback defaults)
async function loadOptions() {
  try {
    const [accounts, categories] = await Promise.all([
      fetchAccountOptions(),
      fetchCategoryOptions()
    ])
    accountOptions.value = accounts
    categoryOptions.value = categories
  } catch (error) {
    console.error('Failed to load options:', error)
    accountOptions.value = [
      { id: 'cash', label: 'Cash', icon: 'bi bi-cash' },
      { id: 'bank', label: 'Bank Account', icon: 'bi bi-bank' },
      { id: 'credit-card', label: 'Credit Card', icon: 'bi bi-credit-card' },
      { id: 'debit-card', label: 'Debit Cards', icon: 'bi bi-credit-card-2-front' },
      { id: 'upi', label: 'UPI', icon: 'bi bi-phone' },
      { id: 'wallet', label: 'Wallet', icon: 'bi bi-wallet2' },
      { id: 'cash-back', label: 'Cash Back', icon: 'bi bi-arrow-left-circle' }
    ]
    categoryOptions.value = [
      { id: 'food', label: 'Food', subcategories: [{ id: 'restaurant', label: 'Restaurant' }, { id: 'groceries', label: 'Groceries' }] },
      { id: 'transportation', label: 'Transportation' },
      { id: 'other', label: 'Other' }
    ]
  }
}

// In edit mode, fetch the existing transaction and pre-fill the form
async function loadTransactionForEdit(id: string) {
  if (!db) {
    showToast('Firebase is not configured. Cannot load transaction.', 'error')
    return
  }
  isLoading.value = true
  try {
    const docRef = doc(db, 'transactions', id)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) {
      showToast('Transaction not found.', 'error')
      router.back()
      return
    }
    const data = snapshot.data()
    activeTab.value = (data.type as 'income' | 'expense' | 'transfer') || 'expense'
    formData.value = {
      date: data.date ?? new Date().toISOString().split('T')[0],
      amount: String(data.amount ?? ''),
      category: data.category ?? '',
      subcategory: data.subcategory ?? '',
      account: data.account ?? data.paymentMethod ?? '',
      note: data.note ?? '',
      description: data.description ?? ''
    }
  } catch (error) {
    console.error('Failed to load transaction:', error)
    showToast('Failed to load transaction.', 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadOptions()
  if (isEditMode.value && firestoreId.value) {
    await loadTransactionForEdit(firestoreId.value)
  }
})

// Computed labels
const selectedCategoryLabel = computed(() =>
  getCategoryDisplayLabel(categoryOptions.value, formData.value.category, formData.value.subcategory)
)

const selectedAccountLabel = computed(() => {
  const account = accountOptions.value.find(acc => acc.id === formData.value.account)
  return account?.label || ''
})

// Validation
function validate(): boolean {
  if (!formData.value.amount || parseFloat(formData.value.amount) <= 0) {
    showToast('Please enter a valid amount.', 'warning')
    return false
  }
  if (!formData.value.category) {
    showToast('Please select a category.', 'warning')
    return false
  }
  if (!formData.value.account) {
    showToast('Please select an account.', 'warning')
    return false
  }
  return true
}

function buildPayload() {
  return {
    type: activeTab.value,
    date: formData.value.date,
    category: formData.value.category,
    subcategory: formData.value.subcategory || '',
    account: formData.value.account,
    description: formData.value.description || '',
    note: formData.value.note || '',
    amount: parseFloat(formData.value.amount)
  }
}

// Handlers
const goBack = () => router.back()

const handleCategorySelect = (category: { id: string; label: string }, subcategory?: { id: string; label: string }) => {
  formData.value.category = category.id
  formData.value.subcategory = subcategory?.id || ''
}

const handleAccountSelect = (account: { id: string; label: string; icon: string }) => {
  formData.value.account = account.id
}

const refreshAccountOptions = async () => {
  try { accountOptions.value = await fetchAccountOptions() }
  catch (error) { console.error('Failed to refresh account options:', error) }
}

const refreshCategoryOptions = async () => {
  try { categoryOptions.value = await fetchCategoryOptions() }
  catch (error) { console.error('Failed to refresh category options:', error) }
}

// ── Add mode ──────────────────────────────────────────────────
const saveTransaction = async () => {
  if (!validate()) return
  isSaving.value = true
  try {
    await addTransaction(buildPayload())
    showToast('Transaction saved successfully!', 'success')
    setTimeout(() => router.push({ name: 'dashboard' }), 1200)
  } catch (error) {
    console.error('Failed to save transaction:', error)
    showToast('Failed to save transaction. Please try again.', 'error')
  } finally {
    isSaving.value = false
  }
}

const continueTransaction = async () => {
  if (!validate()) return
  isSaving.value = true
  try {
    await addTransaction(buildPayload())
    showToast('Transaction saved! Add another.', 'success')
    const prev = { category: formData.value.category, subcategory: formData.value.subcategory, account: formData.value.account }
    formData.value = { date: new Date().toISOString().split('T')[0], amount: '', ...prev, note: '', description: '' }
  } catch (error) {
    console.error('Failed to save transaction:', error)
    showToast('Failed to save transaction. Please try again.', 'error')
  } finally {
    isSaving.value = false
  }
}

// ── Edit mode ─────────────────────────────────────────────────
const updateTransaction = async () => {
  if (!validate() || !firestoreId.value) return
  isSaving.value = true
  try {
    await updateTransactionFirestore(firestoreId.value, buildPayload())
    showToast('Transaction updated!', 'success')
    setTimeout(() => router.push({ name: 'dashboard' }), 1200)
  } catch (error) {
    console.error('Failed to update transaction:', error)
    showToast('Failed to update transaction. Please try again.', 'error')
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = () => { showDeleteConfirm.value = true }

const deleteTransactionConfirmed = async () => {
  if (!firestoreId.value) return
  isSaving.value = true
  try {
    await deleteTransactionFirestore(firestoreId.value)
    showDeleteConfirm.value = false
    showToast('Transaction deleted.', 'success')
    setTimeout(() => router.push({ name: 'dashboard' }), 1200)
  } catch (error) {
    console.error('Failed to delete transaction:', error)
    showToast('Failed to delete transaction. Please try again.', 'error')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.add-transaction-container {
  max-width: 100%;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid #e9ecef;
}

.back-btn {
  color: #6c757d;
  font-size: 1.25rem;
  padding: 0;
}

.header-title {
  margin: 0;
  font-weight: 600;
  color: #212529;
}

.transaction-tabs {
  display: flex;
  background-color: white;
  border-bottom: 1px solid #e9ecef;
  padding: 0 1rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: #6c757d;
  border-bottom: 3px solid transparent;
  border-radius: 0;
}

.tab-btn.active {
  color: #dc3545;
  border-bottom-color: #dc3545;
}

.form-container {
  padding: 1rem;
  background-color: white;
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-bottom: 1px solid #e9ecef;
  background-color: transparent;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-bottom-color: #dc3545;
}

.form-control[rows] {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 0.75rem;
  resize: vertical;
  min-height: 80px;
}

.form-control[rows]:focus {
  border-color: #dc3545;
  border-bottom-color: #dc3545;
}

.date-input-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.repeat-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6c757d;
  padding: 0.25rem;
}

.repeat-btn small {
  font-size: 0.75rem;
  margin-top: 0.125rem;
}

.note-input-group {
  display: flex;
  align-items: center;
}

.note-btn {
  color: #6c757d;
  padding: 0.5rem;
  margin-left: 0.5rem;
}

.attachment-section {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.attachment-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  color: #6c757d;
  font-size: 1.5rem;
}

.action-buttons {
  position: fixed;
  bottom: 2rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  gap: 1rem;
}

.save-btn {
  flex: 2;
  padding: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
}

.continue-btn {
  flex: 1;
  padding: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border-color: #6c757d;
  color: #6c757d;
}

.continue-btn:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.delete-btn {
  padding: 0.875rem 1.25rem;
  font-size: 1.1rem;
  border-radius: 0.5rem;
}

/* Selector field styles */
.selector-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(44,62,80,0.06);
  border: 1px solid #e9ecef;
  cursor: pointer;
  min-height: 52px;
  transition: box-shadow 0.2s, border-color 0.2s;
  margin-bottom: 0.5rem;
}

.selector-field:hover {
  box-shadow: 0 4px 16px rgba(220,53,69,0.10);
  border-color: #dc3545;
}

.selector-text {
  flex: 1;
  color: #212529;
  font-size: 1rem;
}

.selector-text.placeholder {
  color: #adb5bd;
}

.selector-arrow {
  color: #6c757d;
  font-size: 0.875rem;
  transition: transform 0.2s ease;
}

.selector-field:hover .selector-arrow {
  color: #dc3545;
}

/* Delete confirmation modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.confirm-modal {
  background: white;
  border-radius: 1rem;
  padding: 2rem 1.5rem 1.5rem;
  text-align: center;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  animation: popIn 0.2s ease;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

.confirm-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.confirm-title {
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.confirm-body {
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
}

.confirm-actions .btn {
  flex: 1;
  padding: 0.625rem;
  font-weight: 600;
  border-radius: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .form-container {
    margin-top: 0;
  }

  .action-buttons {
    bottom: 1rem;
    left: 0.5rem;
    right: 0.5rem;
  }
}
</style>
