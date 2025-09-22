<template>
  <div class="add-transaction-container">
    <!-- Header -->
    <div class="header">
      <button class="btn btn-link back-btn" @click="goBack">
        <i class="bi bi-chevron-left"></i>
      </button>
      <h5 class="header-title">Trans.</h5>
      <button class="btn btn-link">
        <i class="bi bi-star"></i>
      </button>
    </div>

    <!-- Transaction Type Tabs -->
    <div class="transaction-tabs">
      <button
        v-for="tab in transactionTabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
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
          <button class="btn btn-link repeat-btn">
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
        <select v-model="formData.category" class="form-control">
          <option value="">Select category</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <!-- Account Field -->
      <div class="form-group">
        <label class="form-label">Account</label>
        <select v-model="formData.account" class="form-control">
          <option value="">Select account</option>
          <option v-for="account in accounts" :key="account" :value="account">
            {{ account }}
          </option>
        </select>
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

      <!-- Attachment -->
      <div class="attachment-section">
        <button class="btn btn-link attachment-btn">
          <i class="bi bi-camera"></i>
        </button>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button class="btn btn-danger save-btn" @click="saveTransaction">
        Save
      </button>
      <button class="btn btn-outline-secondary continue-btn" @click="continueTransaction">
        Continue
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Transaction types
const transactionTabs = [
  { id: 'income', label: 'Income' },
  { id: 'expense', label: 'Expense' },
  { id: 'transfer', label: 'Transfer' }
]

// Reactive data
const activeTab = ref('expense') // Default to expense as shown in image

const formData = ref({
  date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  amount: '',
  category: '',
  account: '',
  note: ''
})

// Categories based on existing transaction data
const categories = [
  'Food',
  'Health',
  'Amazon',
  'Grocery',
  'Transport',
  'Entertainment',
  'Bills',
  'Shopping',
  'Other'
]

// Sample accounts
const accounts = [
  'Cash',
  'Bank Account',
  'Credit Card',
  'UPI',
  'Wallet'
]

// Methods
const goBack = () => {
  router.back()
}

const saveTransaction = () => {
  // TODO: Implement save logic
  console.log('Saving transaction:', {
    type: activeTab.value,
    ...formData.value
  })
  // For now, just go back to dashboard
  router.push({ name: 'dashboard' })
}

const continueTransaction = () => {
  // TODO: Implement continue logic (might save and continue adding more)
  console.log('Continue transaction:', {
    type: activeTab.value,
    ...formData.value
  })
}
</script>

<style scoped>
.add-transaction-container {
  max-width: 100%;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
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