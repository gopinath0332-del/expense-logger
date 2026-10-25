<template>
  <div v-if="isVisible" class="budget-modal-backdrop" @click.self="emit('close')">
    <div class="budget-modal-card">
      <!-- Modal Header -->
      <div class="modal-header d-flex justify-content-between align-items-center p-3 border-bottom">
        <div class="d-flex align-items-center gap-2">
          <span class="fs-5 fw-bold">{{ categoryName }}</span>
          <span class="badge bg-light text-secondary border">Global Budget</span>
        </div>
        <button type="button" class="btn-close" aria-label="Close" @click="emit('close')"></button>
      </div>

      <!-- Current Amount Display -->
      <div class="amount-display-container text-center py-3 bg-light border-bottom">
        <div class="text-muted small mb-1">Monthly Budget Allocation</div>
        <div class="display-amount fw-bold">
          ₹ {{ formattedCurrentAmount }}
        </div>
      </div>

      <!-- Quick Preset Adjustment Chips -->
      <div class="presets-section px-3 py-2 border-bottom">
        <div class="text-muted extra-small mb-1 fw-semibold text-uppercase">Quick Add</div>
        <div class="d-flex flex-wrap gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-primary preset-chip"
            @click="addPreset(500)"
          >
            +₹500
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary preset-chip"
            @click="addPreset(1000)"
          >
            +₹1,000
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary preset-chip"
            @click="addPreset(2000)"
          >
            +₹2,000
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary preset-chip"
            @click="addPreset(5000)"
          >
            +₹5,000
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary preset-chip"
            @click="addPreset(10000)"
          >
            +₹10,000
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-danger preset-chip ms-auto"
            @click="clearAmount"
          >
            <i class="bi bi-trash3 me-1"></i>Clear
          </button>
        </div>
      </div>

      <!-- Numeric Keypad -->
      <div class="keypad-container p-3">
        <div class="keypad-grid">
          <button
            v-for="key in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0']"
            :key="key"
            type="button"
            class="keypad-btn"
            @click="pressKey(key)"
          >
            {{ key }}
          </button>
          <button
            type="button"
            class="keypad-btn text-danger"
            aria-label="Backspace"
            @click="backspace"
          >
            <i class="bi bi-backspace"></i>
          </button>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer p-3 border-top d-flex gap-2">
        <button
          type="button"
          class="btn btn-light flex-fill py-2"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-danger flex-fill py-2 fw-semibold"
          :disabled="isSaving"
          @click="handleSave"
        >
          <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
          Save Budget
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  isVisible: boolean
  categoryId: string
  categoryName: string
  initialAmount: number
  isSaving?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [amount: number]
}>()

// Raw string for numerical typing
const rawValue = ref('0')

watch(
  () => props.isVisible,
  (val) => {
    if (val) {
      rawValue.value = props.initialAmount > 0 ? String(props.initialAmount) : '0'
    }
  },
  { immediate: true }
)

const currentNumber = computed(() => {
  const num = parseFloat(rawValue.value)
  return isNaN(num) ? 0 : num
})

const inFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const formattedCurrentAmount = computed(() => {
  return inFormatter.format(currentNumber.value)
})

const pressKey = (key: string) => {
  if (rawValue.value === '0') {
    if (key === '00' || key === '0') return
    rawValue.value = key
  } else {
    // Limit to reasonable budget numbers
    if (rawValue.value.length < 9) {
      rawValue.value += key
    }
  }
}

const backspace = () => {
  if (rawValue.value.length <= 1) {
    rawValue.value = '0'
  } else {
    rawValue.value = rawValue.value.slice(0, -1)
  }
}

const clearAmount = () => {
  rawValue.value = '0'
}

const addPreset = (delta: number) => {
  const next = Math.max(0, currentNumber.value + delta)
  rawValue.value = String(next)
}

const handleSave = () => {
  emit('save', currentNumber.value)
}
</script>

<style scoped>
.budget-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1060;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.budget-modal-card {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.amount-display-container {
  border-top: 1px solid #edf2f7;
}

.display-amount {
  font-size: 1.8rem;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.extra-small {
  font-size: 0.72rem;
  letter-spacing: 0.5px;
}

.preset-chip {
  font-size: 0.78rem;
  border-radius: 20px;
  padding: 0.25rem 0.65rem;
  font-weight: 500;
}

.keypad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.keypad-btn {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.keypad-btn:active {
  background-color: #e2e6ea;
  transform: scale(0.97);
}
</style>
