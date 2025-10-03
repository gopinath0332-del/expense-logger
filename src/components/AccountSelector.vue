<template>
  <!-- Account Selector Modal -->
  <div v-if="isVisible" class="account-modal-overlay" @click="closeModal">
    <div class="account-modal" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h5 class="modal-title">{{ showAddForm ? 'Add New Account' : 'Account' }}</h5>
        <button class="close-btn" @click="closeModal">
          <i class="bi bi-x"></i>
        </button>
      </div>

      <!-- Add Account Form -->
      <div v-if="showAddForm" class="add-account-form">
        <div class="form-group">
          <label class="form-label">Account Name</label>
          <input
            v-model="newAccount.label"
            type="text"
            class="form-control"
            placeholder="Enter account name"
            maxlength="50"
          />
          <div v-if="error" class="error-message">{{ error }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Choose Icon</label>
          <input
            v-model="iconSearch"
            type="text"
            class="form-control search-input"
            placeholder="Search icons..."
          />
          <div class="icon-grid">
            <button
              v-for="iconOption in filteredIcons"
              :key="iconOption.id"
              class="icon-btn"
              :class="{ active: newAccount.icon === iconOption.id }"
              @click="selectIcon(iconOption.id)"
              :title="iconOption.label"
            >
              <i :class="iconOption.icon"></i>
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button
            class="btn btn-secondary"
            @click="cancelAddAccount"
            :disabled="isLoading"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary"
            @click="saveNewAccount"
            :disabled="isLoading || !newAccount.label.trim()"
          >
            <span v-if="isLoading">Adding...</span>
            <span v-else>Add Account</span>
          </button>
        </div>
      </div>

      <!-- Account Grid -->
      <div v-else class="account-grid">
        <button
          v-for="account in accounts"
          :key="account.id"
          class="account-btn"
          :class="{ active: selectedAccount === account.id }"
          @click="selectAccount(account)"
        >
          <i :class="account.icon" class="account-icon"></i>
          <span class="account-label">{{ account.label }}</span>
        </button>

        <!-- Add New Account Button -->
        <button class="account-btn add-new-btn" @click="showAddAccountForm">
          <i class="bi bi-plus-circle account-icon"></i>
          <span class="account-label">Add New</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { addAccountOption } from '@/firebase'
import type { AccountOption } from '@/types/account'

interface Account {
  id: string
  label: string
  icon: string
}

interface Props {
  isVisible: boolean
  selectedAccount?: string
  accounts: Account[]
}

interface Emits {
  (e: 'close'): void
  (e: 'select', account: Account): void
  (e: 'refresh'): void // New emit for refreshing the account list
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Form state
const showAddForm = ref(false)
const newAccount = ref({
  label: '',
  icon: 'bi bi-wallet'
})
const isLoading = ref(false)
const error = ref('')
const iconSearch = ref('')

// Available icons for new accounts
const availableIcons = [
  // Payment Methods
  { id: 'bi bi-wallet', label: 'Wallet', icon: 'bi bi-wallet' },
  { id: 'bi bi-wallet2', label: 'Wallet 2', icon: 'bi bi-wallet2' },
  { id: 'bi bi-credit-card', label: 'Credit Card', icon: 'bi bi-credit-card' },
  { id: 'bi bi-credit-card-2-front', label: 'Debit Card', icon: 'bi bi-credit-card-2-front' },
  { id: 'bi bi-credit-card-2-back', label: 'Card Back', icon: 'bi bi-credit-card-2-back' },
  { id: 'bi bi-credit-card-fill', label: 'Card Fill', icon: 'bi bi-credit-card-fill' },

  // Banking & Finance
  { id: 'bi bi-bank', label: 'Bank', icon: 'bi bi-bank' },
  { id: 'bi bi-bank2', label: 'Bank 2', icon: 'bi bi-bank2' },
  { id: 'bi bi-building', label: 'Building', icon: 'bi bi-building' },
  { id: 'bi bi-piggy-bank', label: 'Savings', icon: 'bi bi-piggy-bank' },
  { id: 'bi bi-piggy-bank-fill', label: 'Savings Fill', icon: 'bi bi-piggy-bank-fill' },

  // Cash & Coins
  { id: 'bi bi-cash', label: 'Cash', icon: 'bi bi-cash' },
  { id: 'bi bi-cash-stack', label: 'Cash Stack', icon: 'bi bi-cash-stack' },
  { id: 'bi bi-coin', label: 'Coin', icon: 'bi bi-coin' },
  { id: 'bi bi-currency-dollar', label: 'Dollar', icon: 'bi bi-currency-dollar' },
  { id: 'bi bi-currency-euro', label: 'Euro', icon: 'bi bi-currency-euro' },
  { id: 'bi bi-currency-pound', label: 'Pound', icon: 'bi bi-currency-pound' },
  { id: 'bi bi-currency-rupee', label: 'Rupee', icon: 'bi bi-currency-rupee' },
  { id: 'bi bi-currency-yen', label: 'Yen', icon: 'bi bi-currency-yen' },

  // Digital & Mobile Payments
  { id: 'bi bi-phone', label: 'Mobile', icon: 'bi bi-phone' },
  { id: 'bi bi-phone-fill', label: 'Mobile Fill', icon: 'bi bi-phone-fill' },
  { id: 'bi bi-qr-code', label: 'QR Code', icon: 'bi bi-qr-code' },
  { id: 'bi bi-qr-code-scan', label: 'QR Scan', icon: 'bi bi-qr-code-scan' },
  { id: 'bi bi-upc-scan', label: 'UPC Scan', icon: 'bi bi-upc-scan' },

  // Online & Digital Services
  { id: 'bi bi-paypal', label: 'PayPal', icon: 'bi bi-paypal' },
  { id: 'bi bi-globe', label: 'Online', icon: 'bi bi-globe' },
  { id: 'bi bi-globe2', label: 'Global', icon: 'bi bi-globe2' },
  { id: 'bi bi-wifi', label: 'Digital', icon: 'bi bi-wifi' },
  { id: 'bi bi-cloud', label: 'Cloud', icon: 'bi bi-cloud' },
  { id: 'bi bi-cloud-fill', label: 'Cloud Fill', icon: 'bi bi-cloud-fill' },

  // Gift Cards & Vouchers
  { id: 'bi bi-gift', label: 'Gift Card', icon: 'bi bi-gift' },
  { id: 'bi bi-gift-fill', label: 'Gift Fill', icon: 'bi bi-gift-fill' },
  { id: 'bi bi-tag', label: 'Voucher', icon: 'bi bi-tag' },
  { id: 'bi bi-tag-fill', label: 'Tag Fill', icon: 'bi bi-tag-fill' },
  { id: 'bi bi-receipt', label: 'Receipt', icon: 'bi bi-receipt' },
  { id: 'bi bi-receipt-cutoff', label: 'Receipt Cut', icon: 'bi bi-receipt-cutoff' },

  // Investment & Assets
  { id: 'bi bi-graph-up', label: 'Investment', icon: 'bi bi-graph-up' },
  { id: 'bi bi-graph-up-arrow', label: 'Growth', icon: 'bi bi-graph-up-arrow' },
  { id: 'bi bi-bar-chart', label: 'Portfolio', icon: 'bi bi-bar-chart' },
  { id: 'bi bi-pie-chart', label: 'Assets', icon: 'bi bi-pie-chart' },
  { id: 'bi bi-gem', label: 'Precious', icon: 'bi bi-gem' },

  // Business & Professional
  { id: 'bi bi-briefcase', label: 'Business', icon: 'bi bi-briefcase' },
  { id: 'bi bi-briefcase-fill', label: 'Business Fill', icon: 'bi bi-briefcase-fill' },
  { id: 'bi bi-person-badge', label: 'Corporate', icon: 'bi bi-person-badge' },
  { id: 'bi bi-building-check', label: 'Verified', icon: 'bi bi-building-check' },

  // Security & Safe
  { id: 'bi bi-safe', label: 'Safe', icon: 'bi bi-safe' },
  { id: 'bi bi-safe2', label: 'Safe 2', icon: 'bi bi-safe2' },
  { id: 'bi bi-shield', label: 'Secure', icon: 'bi bi-shield' },
  { id: 'bi bi-shield-check', label: 'Protected', icon: 'bi bi-shield-check' },
  { id: 'bi bi-lock', label: 'Locked', icon: 'bi bi-lock' },
  { id: 'bi bi-lock-fill', label: 'Lock Fill', icon: 'bi bi-lock-fill' },

  // Miscellaneous
  { id: 'bi bi-box', label: 'Box', icon: 'bi bi-box' },
  { id: 'bi bi-archive', label: 'Archive', icon: 'bi bi-archive' },
  { id: 'bi bi-journal', label: 'Journal', icon: 'bi bi-journal' },
  { id: 'bi bi-bookmark', label: 'Bookmark', icon: 'bi bi-bookmark' },
  { id: 'bi bi-star', label: 'Star', icon: 'bi bi-star' },
  { id: 'bi bi-star-fill', label: 'Star Fill', icon: 'bi bi-star-fill' },
  { id: 'bi bi-heart', label: 'Heart', icon: 'bi bi-heart' },
  { id: 'bi bi-heart-fill', label: 'Heart Fill', icon: 'bi bi-heart-fill' }
]

// Computed property for filtered icons
const filteredIcons = computed(() => {
  if (!iconSearch.value.trim()) {
    return availableIcons
  }

  const searchTerm = iconSearch.value.toLowerCase()
  return availableIcons.filter(icon =>
    icon.label.toLowerCase().includes(searchTerm) ||
    icon.id.toLowerCase().includes(searchTerm)
  )
})

const closeModal = () => {
  showAddForm.value = false
  resetForm()
  emit('close')
}

const selectAccount = (account: Account) => {
  emit('select', account)
  emit('close')
}

const showAddAccountForm = () => {
  showAddForm.value = true
  error.value = ''
}

const cancelAddAccount = () => {
  showAddForm.value = false
  resetForm()
}

const resetForm = () => {
  newAccount.value = {
    label: '',
    icon: 'bi bi-wallet'
  }
  iconSearch.value = ''
  error.value = ''
}

const selectIcon = (iconId: string) => {
  newAccount.value.icon = iconId
}

const saveNewAccount = async () => {
  if (!newAccount.value.label.trim()) {
    error.value = 'Account name is required'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    // Generate ID from label
    const id = newAccount.value.label.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

    const accountOption: AccountOption = {
      id,
      label: newAccount.value.label.trim(),
      icon: newAccount.value.icon
    }

    await addAccountOption(accountOption)

    // Emit refresh to reload accounts in parent
    emit('refresh')

    // Select the new account
    emit('select', accountOption)

    // Close modal
    showAddForm.value = false
    resetForm()
    emit('close')
  } catch (err) {
    console.error('Failed to add account:', err)
    error.value = 'Failed to add account. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.account-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1050;
}

.account-modal {
  width: 100%;
  background-color: white;
  border-radius: 1rem 1rem 0 0;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  margin: 0;
  font-weight: 600;
  color: #212529;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  background-color: #f8f9fa;
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding: 1.5rem;
}

.account-btn {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  background-color: white;
  color: #495057;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s ease;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.account-btn:hover {
  border-color: #dc3545;
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.05);
}

.account-btn.active {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.account-icon {
  font-size: 1.5rem;
}

.account-label {
  font-size: 0.875rem;
}

.add-new-btn {
  border: 2px dashed #dee2e6;
  color: #6c757d;
  background-color: #f8f9fa;
}

.add-new-btn:hover {
  border-color: #dc3545;
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.05);
}

/* Add Account Form Styles */
.add-account-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out;
}

.form-control:focus {
  outline: none;
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.error-message {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc3545;
}

.search-input {
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.search-input::placeholder {
  color: #adb5bd;
  font-style: italic;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  max-height: 240px;
  overflow-y: auto;
  padding: 0.25rem;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  background-color: #f8f9fa;
}

.icon-btn {
  padding: 0.625rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background-color: white;
  color: #6c757d;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
}

.icon-btn:hover {
  border-color: #dc3545;
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.05);
  transform: scale(1.05);
}

.icon-btn.active {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
}

/* Add scrollbar styling for icon grid */
.icon-grid::-webkit-scrollbar {
  width: 6px;
}

.icon-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.icon-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.icon-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn-primary {
  background-color: #dc3545;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #c82333;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* Mobile adjustments */
@media (max-width: 576px) {
  .account-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    padding: 1rem;
  }

  .account-btn {
    padding: 0.75rem;
    font-size: 0.8rem;
    min-height: 70px;
  }

  .account-icon {
    font-size: 1.25rem;
  }

  .icon-grid {
    grid-template-columns: repeat(5, 1fr);
    max-height: 200px;
  }

  .icon-btn {
    padding: 0.5rem;
    font-size: 1rem;
  }

  .add-account-form {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
  }
}
</style>
