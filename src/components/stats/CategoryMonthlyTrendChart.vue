<template>
  <div class="trend-chart-wrapper position-relative">
    <svg
      class="trend-svg"
      viewBox="0 0 500 170"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Horizontal baseline -->
      <line
        x1="30"
        y1="125"
        x2="470"
        y2="125"
        stroke="#edf2f7"
        stroke-width="1.5"
      />

      <!-- Polyline connecting trend points -->
      <path
        v-if="pathData"
        :d="pathData"
        fill="none"
        stroke="#f59846"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Points and Value Labels -->
      <g
        v-for="point in chartPoints"
        :key="`${point.year}-${point.month}`"
        class="point-group cursor-pointer"
        @click="emit('selectMonth', { year: point.year, month: point.month })"
      >
        <!-- Value label above point -->
        <text
          :x="point.x"
          :y="point.labelY"
          text-anchor="middle"
          class="amount-label"
          :class="{ 'active-amount': point.isSelected }"
        >
          {{ formatNumber(point.amount) }}
        </text>

        <!-- Outer point marker circle -->
        <circle
          :cx="point.x"
          :cy="point.y"
          :r="point.isSelected ? 6.5 : 5"
          fill="#ffffff"
          stroke="#f59846"
          :stroke-width="point.isSelected ? 3.5 : 2.5"
          class="trend-circle"
        />

        <!-- Inner dot if selected -->
        <circle
          v-if="point.isSelected"
          :cx="point.x"
          :cy="point.y"
          r="2.5"
          fill="#f59846"
        />

        <!-- Month Label below baseline -->
        <text
          :x="point.x"
          y="152"
          text-anchor="middle"
          class="month-label"
          :class="{ 'active-month': point.isSelected }"
        >
          {{ point.monthName }}
        </text>
      </g>
    </svg>

    <!-- Advance button (>>) -->
    <button
      type="button"
      class="shift-btn position-absolute"
      title="Next months"
      @click="emit('shiftNext')"
    >
      <i class="bi bi-chevron-double-right"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface MonthTrendData {
  year: number
  month: number // 1 - 12
  monthName: string // e.g. "Jun", "Jul", "Oct"
  amount: number
  isSelected: boolean
}

const props = defineProps<{
  months: MonthTrendData[]
  formatNumber: (n: number) => string
}>()

const emit = defineEmits<{
  (e: 'selectMonth', payload: { year: number; month: number }): void
  (e: 'shiftNext'): void
}>()

// SVG geometry configuration
const PADDING_LEFT = 45
const PADDING_RIGHT = 455
const BASELINE_Y = 125
const TOP_Y = 38

const chartPoints = computed(() => {
  const count = props.months.length
  if (count === 0) return []

  const maxAmount = Math.max(...props.months.map(m => m.amount), 0)
  const rangeY = BASELINE_Y - TOP_Y

  return props.months.map((item, index) => {
    const x = count === 1
      ? (PADDING_LEFT + PADDING_RIGHT) / 2
      : PADDING_LEFT + (index / (count - 1)) * (PADDING_RIGHT - PADDING_LEFT)

    let y = BASELINE_Y
    if (maxAmount > 0 && item.amount > 0) {
      y = BASELINE_Y - (item.amount / maxAmount) * rangeY
    }

    const labelY = Math.max(y - 10, 18)

    return {
      ...item,
      x,
      y,
      labelY
    }
  })
})

const pathData = computed(() => {
  if (chartPoints.value.length === 0) return ''
  return chartPoints.value.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`
  }, '')
})
</script>

<style scoped>
.trend-chart-wrapper {
  background-color: #ffffff;
  padding: 10px 8px 12px 8px;
  width: 100%;
}

.trend-svg {
  width: 100%;
  height: auto;
  max-height: 210px;
  display: block;
}

.amount-label {
  font-size: 11px;
  fill: #8e8e93;
  font-family: inherit;
  font-weight: 500;
}

.amount-label.active-amount {
  fill: #212529;
  font-weight: 700;
}

.month-label {
  font-size: 12px;
  fill: #8e8e93;
  font-family: inherit;
  font-weight: 500;
  transition: fill 0.15s ease;
}

.month-label.active-month {
  fill: #ea5455;
  font-weight: 700;
}

.trend-circle {
  transition: r 0.15s ease, stroke-width 0.15s ease;
}

.point-group:hover .trend-circle {
  r: 7;
}

.cursor-pointer {
  cursor: pointer;
}

.shift-btn {
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 0.85rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.15s ease;
  cursor: pointer;
}

.shift-btn:hover {
  background: #ffffff;
  color: #ea5455;
  border-color: #dee2e6;
}
</style>
