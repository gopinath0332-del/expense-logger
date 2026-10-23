<template>
  <div class="pie-chart-wrapper">
    <div v-if="slices.length === 0" class="no-data-placeholder text-center py-5">
      <div class="empty-chart-circle mx-auto mb-3">
        <i class="bi bi-pie-chart text-muted fs-1"></i>
      </div>
      <p class="text-muted mb-0">No transactions recorded for this period</p>
    </div>

    <svg
      v-else
      class="pie-svg"
      viewBox="0 0 460 360"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Slices -->
      <g class="slices-group">
        <path
          v-for="slice in slicePaths"
          :key="slice.id"
          :d="slice.d"
          :fill="slice.color"
          stroke="#ffffff"
          stroke-width="1.5"
          class="pie-slice"
          @click="emit('selectCategory', slice.name)"
        />
      </g>

      <!-- Leader Lines & Callout Labels -->
      <g class="callouts-group">
        <g v-for="callout in calloutItems" :key="callout.id" class="callout-item">
          <!-- Leader Line -->
          <path
            :d="callout.pathD"
            :stroke="callout.color"
            stroke-width="1.2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Label text: Category Name -->
          <text
            :x="callout.textX"
            :y="callout.textY - 3"
            :text-anchor="callout.textAnchor"
            class="callout-name"
          >
            <tspan v-if="callout.emoji">{{ callout.emoji }} </tspan>
            <tspan>{{ callout.shortName }}</tspan>
          </text>

          <!-- Label text: Percentage -->
          <text
            :x="callout.textX"
            :y="callout.textY + 12"
            :text-anchor="callout.textAnchor"
            class="callout-percent"
          >
            {{ callout.percentText }} %
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface CategorySliceData {
  id: string
  name: string
  emoji: string
  color: string
  total: number
  percent: number
}

interface Props {
  slices: CategorySliceData[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  selectCategory: [categoryName: string]
}>()

// Center & Radius for the SVG coordinate system
const CX = 230
const CY = 180
const R = 86

// Generate slice paths
const slicePaths = computed(() => {
  if (props.slices.length === 0) return []

  // If only 1 slice (100%)
  if (props.slices.length === 1) {
    const s = props.slices[0]
    return [{
      id: s.id,
      name: s.name,
      color: s.color,
      // Full circle as two 180-deg arcs
      d: `M ${CX - R} ${CY} A ${R} ${R} 0 1 0 ${CX + R} ${CY} A ${R} ${R} 0 1 0 ${CX - R} ${CY} Z`
    }]
  }

  // Slices start from top-right (approx 0 rad / 3 o'clock - or -0.5 rad to match screenshot)
  let currentAngle = -Math.PI / 4 // Start at top-right quadrant like in reference

  return props.slices.map((slice) => {
    const sweepAngle = (slice.percent / 100) * 2 * Math.PI
    const startAngle = currentAngle
    const endAngle = currentAngle + sweepAngle
    currentAngle = endAngle

    const x1 = CX + R * Math.cos(startAngle)
    const y1 = CY + R * Math.sin(startAngle)
    const x2 = CX + R * Math.cos(endAngle)
    const y2 = CY + R * Math.sin(endAngle)

    const largeArc = sweepAngle > Math.PI ? 1 : 0

    const d = `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`

    return {
      id: slice.id,
      name: slice.name,
      color: slice.color,
      d
    }
  })
})

interface CalloutItem {
  id: string
  name: string
  shortName: string
  emoji: string
  color: string
  percentText: string
  pathD: string
  textX: number
  textY: number
  textAnchor: 'start' | 'end'
}

// Generate callout leader lines & labels with collision resolution
const calloutItems = computed<CalloutItem[]>(() => {
  if (props.slices.length === 0) return []

  let currentAngle = -Math.PI / 4

  interface RawCallout {
    id: string
    name: string
    shortName: string
    emoji: string
    color: string
    percent: number
    percentText: string
    midAngle: number
    x0: number
    y0: number
    x1: number
    y1: number
    isRight: boolean
  }

  const rawList: RawCallout[] = []

  props.slices.forEach(slice => {
    const sweepAngle = (slice.percent / 100) * 2 * Math.PI
    const midAngle = currentAngle + sweepAngle / 2
    currentAngle += sweepAngle

    // Skip very small slivers if crowded (unless only a few slices)
    if (slice.percent < 0.3 && props.slices.length > 8) return

    const x0 = CX + R * Math.cos(midAngle)
    const y0 = CY + R * Math.sin(midAngle)

    // Initial leader elbow distance
    const elbowDist = R + 26
    const x1 = CX + elbowDist * Math.cos(midAngle)
    const y1 = CY + elbowDist * Math.sin(midAngle)

    // Short name truncation (e.g. "Transportation" -> "Transpo...")
    let shortName = slice.name
    if (shortName.length > 9) {
      shortName = shortName.slice(0, 7) + '...'
    }

    rawList.push({
      id: slice.id,
      name: slice.name,
      shortName,
      emoji: slice.emoji,
      color: slice.color,
      percent: slice.percent,
      percentText: slice.percent.toFixed(1),
      midAngle,
      x0,
      y0,
      x1,
      y1,
      isRight: Math.cos(midAngle) >= 0
    })
  })

  // Separate left and right side callouts to adjust vertical spacing and avoid overlapping text
  const rightList = rawList.filter(item => item.isRight).sort((a, b) => a.y1 - b.y1)
  const leftList = rawList.filter(item => !item.isRight).sort((a, b) => a.y1 - b.y1)

  // Spacing adjuster
  const adjustSpacing = (items: RawCallout[]) => {
    const minGap = 26
    for (let i = 1; i < items.length; i++) {
      if (items[i].y1 - items[i - 1].y1 < minGap) {
        items[i].y1 = items[i - 1].y1 + minGap
      }
    }
  }

  adjustSpacing(rightList)
  adjustSpacing(leftList)

  const result: CalloutItem[] = []

  // Build final callout objects
  const processItems = (items: RawCallout[], isRight: boolean) => {
    const armLength = 20
    items.forEach(item => {
      // Clamp y1 within safe SVG vertical bounds (25px - 335px)
      const clampedY = Math.max(25, Math.min(335, item.y1))

      let x2: number
      let textX: number
      const textAnchor: 'start' | 'end' = isRight ? 'start' : 'end'

      if (isRight) {
        // Clamp x1 to ensure room for text
        const clampedX1 = Math.min(360, Math.max(CX + 20, item.x1))
        x2 = clampedX1 + armLength
        textX = x2 + 4
        result.push({
          id: item.id,
          name: item.name,
          shortName: item.shortName,
          emoji: item.emoji,
          color: item.color,
          percentText: item.percentText,
          pathD: `M ${item.x0.toFixed(1)} ${item.y0.toFixed(1)} L ${clampedX1.toFixed(1)} ${clampedY.toFixed(1)} L ${x2.toFixed(1)} ${clampedY.toFixed(1)}`,
          textX,
          textY: clampedY,
          textAnchor
        })
      } else {
        const clampedX1 = Math.max(100, Math.min(CX - 20, item.x1))
        x2 = clampedX1 - armLength
        textX = x2 - 4
        result.push({
          id: item.id,
          name: item.name,
          shortName: item.shortName,
          emoji: item.emoji,
          color: item.color,
          percentText: item.percentText,
          pathD: `M ${item.x0.toFixed(1)} ${item.y0.toFixed(1)} L ${clampedX1.toFixed(1)} ${clampedY.toFixed(1)} L ${x2.toFixed(1)} ${clampedY.toFixed(1)}`,
          textX,
          textY: clampedY,
          textAnchor
        })
      }
    })
  }

  processItems(rightList, true)
  processItems(leftList, false)

  return result
})
</script>

<style scoped>
.pie-chart-wrapper {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  user-select: none;
}

.pie-svg {
  width: 100%;
  height: auto;
  display: block;
}

.pie-slice {
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.pie-slice:hover {
  opacity: 0.9;
}

.callout-name {
  font-size: 11px;
  font-weight: 600;
  fill: #212529;
}

.callout-percent {
  font-size: 10px;
  font-weight: 500;
  fill: #6c757d;
}

.no-data-placeholder {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-chart-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
