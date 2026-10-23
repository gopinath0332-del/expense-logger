<template>
  <div class="calendar-container">
    <!-- Days of Week Header -->
    <div class="calendar-weekdays-header">
      <div
        v-for="(day, index) in weekDays"
        :key="day"
        class="weekday-col"
        :class="{
          'sunday-header': index === 0,
          'saturday-header': index === 6
        }"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar Month Grid -->
    <div class="calendar-grid">
      <div
        v-for="cell in calendarDays"
        :key="cell.date"
        class="calendar-cell"
        :class="{
          'outside-month': !cell.isCurrentMonth,
          'is-today': cell.isToday,
          'is-selected': selectedDate === cell.date,
          'has-transactions': cell.items.length > 0
        }"
        @click="handleDayClick(cell)"
      >
        <!-- Day Number / Date Label -->
        <div class="cell-header">
          <span
            class="day-number"
            :class="{
              'sunday-day': cell.isCurrentMonth && cell.dayOfWeek === 0,
              'saturday-day': cell.isCurrentMonth && cell.dayOfWeek === 6,
              'outside-day': !cell.isCurrentMonth,
              'today-badge': cell.isToday
            }"
          >
            {{ cell.displayLabel }}
          </span>
        </div>

        <!-- Cell Amounts (Expenses / Income) -->
        <div class="cell-amounts">
          <div v-if="cell.income > 0" class="income-amount">
            {{ formatNumber(cell.income) }}
          </div>
          <div v-if="cell.expenses > 0" class="expense-amount">
            {{ formatNumber(cell.expenses) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Day Details Modal / Bottom Sheet -->
    <div
      v-if="selectedDayDetails"
      class="day-modal-backdrop"
      @click.self="selectedDayDetails = null"
    >
      <div class="day-modal-card">
        <div class="day-modal-header d-flex justify-content-between align-items-center p-3 border-bottom">
          <div>
            <h6 class="mb-0 fw-bold">{{ formatDisplayDate(selectedDayDetails.date) }}</h6>
            <div class="day-modal-summary mt-1">
              <span v-if="selectedDayDetails.income > 0" class="text-success small me-3">
                Income: ₹ {{ formatNumber(selectedDayDetails.income) }}
              </span>
              <span v-if="selectedDayDetails.expenses > 0" class="text-danger small">
                Expense: ₹ {{ formatNumber(selectedDayDetails.expenses) }}
              </span>
            </div>
          </div>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="selectedDayDetails = null"
          ></button>
        </div>

        <div class="day-modal-body">
          <div v-if="selectedDayDetails.items.length === 0" class="text-center text-muted py-4">
            <i class="bi bi-calendar-x fs-2 d-block mb-2"></i>
            No transactions on this day
          </div>
          <div v-else class="transaction-list-group">
            <TransactionItem
              v-for="item in selectedDayDetails.items"
              :key="item.id"
              :transaction="item"
              :formatNumber="formatNumber"
              @select="handleTransactionSelect"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TransactionDay, Transaction } from '@/types/transaction'
import TransactionItem from './TransactionItem.vue'

interface Props {
  transactions: TransactionDay[]
  currentDate: Date
  formatNumber: (n: number) => string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  selectDay: [day: TransactionDay | CalendarDay]
  selectTransaction: [transaction: Transaction]
}>()

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalendarDay {
  date: string // 'YYYY-MM-DD'
  dayNumber: number
  displayLabel: string
  isCurrentMonth: boolean
  isToday: boolean
  dayOfWeek: number
  income: number
  expenses: number
  items: Transaction[]
}

const selectedDate = ref<string | null>(null)
const selectedDayDetails = ref<CalendarDay | null>(null)

// Map existing transactions by 'YYYY-MM-DD'
const transactionsMap = computed(() => {
  const map = new Map<string, TransactionDay>()
  if (props.transactions) {
    props.transactions.forEach(tDay => {
      map.set(tDay.date, tDay)
    })
  }
  return map
})

// Build full calendar month grid (Sun-Sat)
const calendarDays = computed<CalendarDay[]>(() => {
  const current = props.currentDate || new Date()
  const year = current.getFullYear()
  const month = current.getMonth() // 0-based

  // Today string for comparison
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Days in current month
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()

  // First day of current month (0 = Sun, ..., 6 = Sat)
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  // Days in previous month
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const days: CalendarDay[] = []

  // 1. Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i
    const prevDate = new Date(year, month - 1, dayNum)
    const pYear = prevDate.getFullYear()
    const pMonth = prevDate.getMonth() + 1
    const dateStr = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    const tData = transactionsMap.value.get(dateStr)

    days.push({
      date: dateStr,
      dayNumber: dayNum,
      displayLabel: dayNum === 1 ? `01/${String(pMonth).padStart(2, '0')}` : String(dayNum),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      dayOfWeek: prevDate.getDay(),
      income: tData?.income || 0,
      expenses: tData?.expenses || 0,
      items: tData?.items || []
    })
  }

  // 2. Current month days
  for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
    const curDate = new Date(year, month, dayNum)
    const cMonth = month + 1
    const dateStr = `${year}-${String(cMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    const tData = transactionsMap.value.get(dateStr)

    // For the 1st of month, format as '01/MM' like in the reference image
    const displayLabel = dayNum === 1 ? `01/${String(cMonth).padStart(2, '0')}` : String(dayNum)

    days.push({
      date: dateStr,
      dayNumber: dayNum,
      displayLabel,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      dayOfWeek: curDate.getDay(),
      income: tData?.income || 0,
      expenses: tData?.expenses || 0,
      items: tData?.items || []
    })
  }

  // 3. Next month leading days (fill out remaining cells to complete the grid row)
  const totalCells = Math.ceil(days.length / 7) * 7
  const remaining = totalCells - days.length

  for (let dayNum = 1; dayNum <= remaining; dayNum++) {
    const nextDate = new Date(year, month + 1, dayNum)
    const nYear = nextDate.getFullYear()
    const nMonth = nextDate.getMonth() + 1
    const dateStr = `${nYear}-${String(nMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    const tData = transactionsMap.value.get(dateStr)

    // First day of next month shows '01/MM'
    const displayLabel = dayNum === 1 ? `01/${String(nMonth).padStart(2, '0')}` : String(dayNum)

    days.push({
      date: dateStr,
      dayNumber: dayNum,
      displayLabel,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      dayOfWeek: nextDate.getDay(),
      income: tData?.income || 0,
      expenses: tData?.expenses || 0,
      items: tData?.items || []
    })
  }

  return days
})

const handleDayClick = (cell: CalendarDay) => {
  selectedDate.value = cell.date
  selectedDayDetails.value = cell
  emit('selectDay', cell)
}

const handleTransactionSelect = (transaction: Transaction) => {
  selectedDayDetails.value = null
  emit('selectTransaction', transaction)
}

const formatDisplayDate = (dateStr: string) => {
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const [y, m, d] = parts
    const dObj = new Date(Number(y), Number(m) - 1, Number(d))
    return dObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      weekday: 'short'
    })
  }
  return dateStr
}
</script>

<style scoped>
.calendar-container {
  background-color: #ffffff;
  width: 100%;
  user-select: none;
}

/* Weekday column headers */
.calendar-weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #ffffff;
  border-bottom: 1px solid #edf2f7;
  padding: 0.4rem 0;
  text-align: center;
}

.weekday-col {
  font-size: 0.78rem;
  font-weight: 500;
  color: #8e8e93;
}

.sunday-header {
  color: #ff6b6b;
}

.saturday-header {
  color: #4dabf7;
}

/* Month Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #edf2f7; /* Grid lines color */
  gap: 1px; /* 1px grid divider lines */
  border-bottom: 1px solid #edf2f7;
}

/* Individual Cell */
.calendar-cell {
  background-color: #ffffff;
  min-height: 84px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px 4px 6px 4px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  position: relative;
}

.calendar-cell:hover {
  background-color: #fdfafb;
}

.calendar-cell.is-selected {
  background-color: #fff1f2;
}

/* Day header inside cell */
.cell-header {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.day-number {
  font-size: 0.84rem;
  font-weight: 500;
  color: #212529;
  line-height: 1.2;
}

.sunday-day {
  color: #ff6b6b;
}

.saturday-day {
  color: #4dabf7;
}

.outside-day {
  color: #adb5bd !important;
}

.today-badge {
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: #dc3545;
  text-decoration-thickness: 2px;
}

/* Amounts area at bottom of cell */
.cell-amounts {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 1px;
  width: 100%;
  overflow: hidden;
}

.expense-amount {
  color: #ea5455;
  font-size: 0.66rem;
  font-weight: 500;
  white-space: nowrap;
  letter-spacing: -0.2px;
  text-align: right;
  line-height: 1.1;
  width: 100%;
  overflow: hidden;
  text-overflow: clip;
}

.income-amount {
  color: #3880ff;
  font-size: 0.66rem;
  font-weight: 500;
  white-space: nowrap;
  letter-spacing: -0.2px;
  text-align: right;
  line-height: 1.1;
  width: 100%;
  overflow: hidden;
  text-overflow: clip;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .calendar-cell {
    min-height: 78px;
    padding: 3px 2px 4px 2px;
  }

  .day-number {
    font-size: 0.78rem;
  }

  .expense-amount,
  .income-amount {
    font-size: 0.62rem;
  }
}

/* Day Modal / Bottom Sheet */
.day-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1050;
  animation: fadeIn 0.15s ease-out;
}

.day-modal-card {
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 16px 16px 0 0;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.2s ease-out;
}

.day-modal-body {
  overflow-y: auto;
  padding-bottom: 2rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
