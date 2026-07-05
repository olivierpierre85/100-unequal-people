<template>
  <div
    ref="wrapper"
    class="relative outline-none select-none"
    tabindex="0"
    role="group"
    aria-label="Interactive chart of 100 Belgian profiles, poorest to richest. Use the left and right arrow keys to browse people; press Escape to deselect. All values are also in the table below."
    @keydown="onKeydown"
    @pointerleave="hoverIndex = null"
  >
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="block w-full h-auto"
      @pointermove="onPointerMove"
      @pointerdown="onPointerDown"
    >
      <!-- gridlines + ticks -->
      <g v-for="tick in ticks" :key="tick">
        <line
          :x1="M.left" :x2="W - M.right" :y1="yFor(tick)" :y2="yFor(tick)"
          :stroke="tick === 0 ? '#383835' : '#2c2c2a'" stroke-width="1"
        />
        <text
          :x="M.left - 8" :y="yFor(tick) + 3.5"
          text-anchor="end" fill="#898781" font-size="11"
          style="font-variant-numeric: tabular-nums"
        >{{ fmtCompact(tick) }}</text>
      </g>

      <!-- one bar per person, rank order, rounded data-end / square baseline -->
      <path
        v-for="(p, i) in sorted"
        :key="p.id"
        :d="barPath(i, valueOf(p))"
        :fill="p.id === pinnedId ? '#86b6ef' : i === hoverIndex ? '#6da7ec' : '#3987e5'"
        style="transition: fill 120ms ease"
      />

      <!-- 'you' marker: distinct hue, direct-labeled -->
      <g v-if="youMarker">
        <line
          :x1="youMarker.x" :x2="youMarker.x" :y1="M.top + 14" :y2="yFor(0)"
          stroke="#c98500" stroke-width="2"
        />
        <circle :cx="youMarker.x" :cy="M.top + 14" r="4.5" fill="#c98500" stroke="#171717" stroke-width="2" />
        <text
          :x="youMarker.x" :y="M.top + 4" fill="#ffffff" font-size="11.5" font-weight="600"
          :text-anchor="youMarker.x > W - 60 ? 'end' : youMarker.x < M.left + 30 ? 'start' : 'middle'"
        >You</text>
      </g>
    </svg>

    <!-- tooltip (hover or keyboard focus); everything in it is also in the table -->
    <div
      v-if="activePerson"
      class="pointer-events-none absolute top-1 z-10 w-56 -translate-x-1/2 rounded-lg border border-white/10 bg-neutral-800/95 p-3 shadow-xl backdrop-blur-sm"
      :style="{ left: tooltipLeft }"
    >
      <div class="text-lg font-semibold text-white" style="font-variant-numeric: tabular-nums">
        {{ fmtEur(valueOf(activePerson)) }}<span class="text-xs font-normal text-neutral-400"> {{ metric === 'income' ? '/ month' : 'net wealth' }}</span>
      </div>
      <div class="mt-1 text-sm text-neutral-300">
        {{ activePerson.name }}, {{ activePerson.demographics.age }} — {{ activePerson.work.job }}
      </div>
      <div class="text-xs text-neutral-500">{{ activePerson.demographics.region }}</div>
      <div class="mt-2 border-t border-white/10 pt-2 text-xs text-neutral-400">
        <div class="flex justify-between"><span>Income</span><span class="text-neutral-200" style="font-variant-numeric: tabular-nums">{{ fmtEur(activePerson.economics.netMonthlyIncome) }}/mo</span></div>
        <div class="flex justify-between"><span>Wealth</span><span class="text-neutral-200" style="font-variant-numeric: tabular-nums">{{ fmtEur(activePerson.economics.netWealth) }}</span></div>
      </div>
      <div class="mt-1.5 text-xs text-neutral-500">
        {{ metric === 'income' ? 'Earns more than' : 'Owns more than' }} {{ activeRank }} of the 100
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  people: { type: Array, required: true },
  metric: { type: String, default: 'wealth' }, // 'wealth' | 'income'
  pinnedId: { type: Number, default: null },
  // { netMonthlyIncome, netWealth } for the visitor, or null
  you: { type: Object, default: null },
})
const emit = defineEmits(['update:pinnedId'])

const W = 1000
const H = 320
const M = { left: 58, right: 12, top: 20, bottom: 10 }
const plotW = W - M.left - M.right
const slotW = plotW / 100
const barW = slotW - 2.4 // ≥2px surface gap between neighbours

const hoverIndex = ref(null)
const wrapper = ref(null)

const valueOf = (p) =>
  props.metric === 'income' ? p.economics.netMonthlyIncome : p.economics.netWealth

const sorted = computed(() =>
  [...props.people].sort((a, b) => valueOf(a) - valueOf(b) || a.id - b.id),
)

const yMin = computed(() => Math.min(0, ...sorted.value.map(valueOf)))
const yMax = computed(() => Math.max(...sorted.value.map(valueOf)) * 1.02)

function yFor(v) {
  const span = yMax.value - yMin.value
  return M.top + (1 - (v - yMin.value) / span) * (H - M.top - M.bottom)
}

const ticks = computed(() => {
  const rawStep = yMax.value / 3
  const mag = 10 ** Math.floor(Math.log10(rawStep))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rawStep)
  const out = []
  for (let t = 0; t <= yMax.value; t += step) out.push(t)
  return out
})

// rounded corners on the data end only; square at the zero baseline
function barPath(i, v) {
  const x = M.left + i * slotW + (slotW - barW) / 2
  const y0 = yFor(0)
  const y1 = yFor(v)
  const h = Math.abs(y0 - y1)
  const r = Math.min(3, h, barW / 2)
  if (h < 0.75) return `M ${x} ${y0 - 0.75} h ${barW} v 0.75 h ${-barW} Z`
  if (v >= 0) {
    return `M ${x} ${y0} V ${y1 + r} Q ${x} ${y1} ${x + r} ${y1} H ${x + barW - r} Q ${x + barW} ${y1} ${x + barW} ${y1 + r} V ${y0} Z`
  }
  return `M ${x} ${y0} V ${y1 - r} Q ${x} ${y1} ${x + r} ${y1} H ${x + barW - r} Q ${x + barW} ${y1} ${x + barW} ${y1 - r} V ${y0} Z`
}

// ── interaction ─────────────────────────────────────────────────────────────
function indexFromEvent(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * W
  if (x < M.left - slotW || x > W - M.right + slotW) return null
  return Math.max(0, Math.min(99, Math.floor((x - M.left) / slotW)))
}
function onPointerMove(e) {
  hoverIndex.value = indexFromEvent(e)
}
function onPointerDown(e) {
  const i = indexFromEvent(e)
  if (i === null) return
  const id = sorted.value[i].id
  emit('update:pinnedId', id === props.pinnedId ? null : id)
}
function onKeydown(e) {
  const pinnedIdx = sorted.value.findIndex((p) => p.id === props.pinnedId)
  let next = null
  if (e.key === 'ArrowRight') next = pinnedIdx < 0 ? 0 : Math.min(99, pinnedIdx + 1)
  else if (e.key === 'ArrowLeft') next = pinnedIdx < 0 ? 99 : Math.max(0, pinnedIdx - 1)
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = 99
  else if (e.key === 'Escape') { emit('update:pinnedId', null); return }
  else return
  e.preventDefault()
  emit('update:pinnedId', sorted.value[next].id)
}

// clear a pin that no longer exists (defensive)
watch(sorted, (s) => {
  if (props.pinnedId != null && !s.some((p) => p.id === props.pinnedId)) {
    emit('update:pinnedId', null)
  }
})

const activeIndex = computed(() => {
  if (hoverIndex.value !== null) return hoverIndex.value
  const i = sorted.value.findIndex((p) => p.id === props.pinnedId)
  return i >= 0 ? i : null
})
const activePerson = computed(() =>
  activeIndex.value === null ? null : sorted.value[activeIndex.value],
)
const activeRank = computed(() => activeIndex.value ?? 0)

const tooltipLeft = computed(() => {
  if (activeIndex.value === null) return '0'
  const pct = ((M.left + (activeIndex.value + 0.5) * slotW) / W) * 100
  return `${Math.max(13, Math.min(87, pct))}%`
})

const youMarker = computed(() => {
  if (!props.you) return null
  const v = props.metric === 'income' ? props.you.netMonthlyIncome : props.you.netWealth
  if (v == null || Number.isNaN(v)) return null
  const below = sorted.value.filter((p) => valueOf(p) < v).length
  return { x: M.left + below * slotW }
})

// ── formatting ──────────────────────────────────────────────────────────────
const fmtEur = (v) =>
  (v < 0 ? '−€' : '€') + new Intl.NumberFormat('fr-BE').format(Math.abs(v))
function fmtCompact(v) {
  if (Math.abs(v) >= 1e6) return `€${(v / 1e6).toLocaleString('en', { maximumFractionDigits: 1 })} M`
  if (Math.abs(v) >= 1e3) return `€${(v / 1e3).toLocaleString('en', { maximumFractionDigits: 1 })}k`
  return `€${v}`
}
</script>
