<template>
  <div
    ref="wrapper"
    class="relative select-none rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
    tabindex="0"
    role="group"
    :aria-label="t('parade.aria')"
    @keydown="onKeydown"
    @focus="focused = true"
    @blur="focused = false"
    @pointerleave="hoverIndex = null"
  >
    <!-- legend: the income view has two series; the wealth view flags debt -->
    <div class="mb-2 flex min-h-[1rem] flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
      <template v-if="metric === 'income'">
        <span class="inline-flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-sm" :style="{ background: COLORS.work.base }"></span>
          {{ t('parade.legendWork') }}
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-sm" :style="{ background: COLORS.capital.base }"></span>
          {{ t('parade.legendCapital') }}
        </span>
      </template>
      <span v-else-if="hasNegative" class="inline-flex items-center gap-1.5">
        <span class="h-2.5 w-2.5 rounded-sm" :style="{ background: COLORS.neg.base }"></span>
        {{ t('parade.legendDebt') }}
      </span>
    </div>

    <svg
      :viewBox="`0 0 ${G.W} ${G.H}`"
      class="block h-auto w-full touch-pan-y"
      @pointermove="onPointerMove"
      @pointerdown="onPointerDown"
    >
      <!-- gridlines + ticks -->
      <g v-for="tick in ticks" :key="tick">
        <line
          :x1="G.M.left" :x2="G.W - G.M.right" :y1="yFor(tick)" :y2="yFor(tick)"
          :stroke="tick === 0 ? '#c9bfa8' : '#efe3cc'" stroke-width="1"
        />
        <text
          :x="G.M.left - 6" :y="yFor(tick) + G.font * 0.35"
          text-anchor="end" fill="#665f7d" :font-size="G.font"
          style="font-variant-numeric: tabular-nums"
        >{{ fmtCompact(tick, locale) }}</text>
      </g>

      <!-- one bar per person, rank order; income view stacks work/wealth -->
      <g v-for="(bar, i) in bars" :key="bar.person.id">
        <path
          v-for="seg in bar.segs"
          :key="seg.kind"
          :d="seg.d"
          :fill="fillFor(bar.person, i, seg.kind)"
          style="transition: fill 120ms ease"
        />
      </g>

      <!-- 'you' marker: coral line with a paper halo, direct-labeled -->
      <g v-if="youMarker">
        <line
          :x1="youMarker.x" :x2="youMarker.x" :y1="G.M.top + 14" :y2="yFor(0)"
          stroke="#fff8ec" stroke-width="6" opacity="0.95"
        />
        <line
          :x1="youMarker.x" :x2="youMarker.x" :y1="G.M.top + 14" :y2="yFor(0)"
          stroke="#ff5a36" stroke-width="2.5"
        />
        <circle :cx="youMarker.x" :cy="G.M.top + 14" r="5" fill="#ff5a36" stroke="#fff8ec" stroke-width="2" />
        <text
          :x="youMarker.x" :y="G.M.top + 4" fill="#1f1b3a" :font-size="G.font + 0.5" font-weight="700"
          :text-anchor="youMarker.x > G.W - 40 ? 'end' : youMarker.x < G.M.left + 20 ? 'start' : 'middle'"
        >{{ t('parade.you') }}</text>
      </g>
    </svg>

    <!-- tooltip while hovering or browsing with the keyboard; the pinned
         person's full card sits under the chart, so nothing is lost -->
    <div
      v-if="activePerson"
      class="pointer-events-none absolute top-1 z-10 w-60 max-w-full -translate-x-1/2 rounded-lg border border-rule bg-white p-3 shadow-lg"
      :style="{ left: tooltipLeft }"
    >
      <div class="text-lg font-semibold text-ink" style="font-variant-numeric: tabular-nums">
        {{ fmtEur(valueOf(activePerson), locale) }}<span class="text-xs font-normal text-muted"> {{ metric === 'income' ? t('parade.perMonth') : t('parade.netWealth') }}</span>
      </div>
      <div class="mt-1 text-sm text-ink">
        {{ activePerson.name }}, {{ activePerson.demographics.age }}
      </div>
      <div class="text-xs text-muted">
        {{ jobTitle(activePerson, locale) }} · {{ t(`regions.${activePerson.demographics.region}`) }}
      </div>
      <div class="mt-2 border-t border-rule pt-2 text-xs text-muted">
        <div class="flex justify-between gap-2">
          <span>{{ t('parade.tipIncome') }}</span>
          <span class="text-ink" style="font-variant-numeric: tabular-nums">{{ fmtEur(activePerson.economics.netMonthlyIncome, locale) }} {{ t('parade.perMonth') }}</span>
        </div>
        <div class="flex justify-between gap-2">
          <span class="inline-flex items-center gap-1">
            <span class="h-2 w-2 rounded-sm" :style="{ background: COLORS.capital.base }"></span>{{ t('parade.tipFromWealth') }}
          </span>
          <span class="text-ink" style="font-variant-numeric: tabular-nums">{{ fmtEur(activeSources.fromWealth, locale) }} ({{ Math.round(activeSources.share * 100) }}%)</span>
        </div>
        <div class="flex justify-between gap-2">
          <span>{{ t('parade.tipWealth') }}</span>
          <span class="text-ink" style="font-variant-numeric: tabular-nums">{{ fmtEur(activePerson.economics.netWealth, locale) }}</span>
        </div>
      </div>
      <div class="mt-1.5 text-xs text-muted">
        {{ metric === 'income' ? t('parade.earnsMore', { n: activeRank }) : t('parade.ownsMore', { n: activeRank }) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { incomeSources } from '../data/incomeSources'
import { jobTitle } from '../data/jobs'
import { t, locale } from '../i18n'
import { fmtEur, fmtCompact } from '../utils/format'

const props = defineProps({
  people: { type: Array, required: true },
  metric: { type: String, default: 'wealth' }, // 'wealth' | 'income'
  pinnedId: { type: Number, default: null },
  // { netMonthlyIncome, netWealth } for the visitor, or null
  you: { type: Object, default: null },
})
const emit = defineEmits(['update:pinnedId'])

const COLORS = {
  work: { base: '#5b4bff', lift: '#8a7dff' },
  capital: { base: '#ffb000', lift: '#ffc63d' },
  neg: { base: '#e5484d', lift: '#f0686c' },
}

// ── geometry: a narrower, taller viewBox on phones so ticks stay legible ────
const wrapper = ref(null)
const narrow = ref(false)
let observer = null
onMounted(() => {
  if (typeof ResizeObserver === 'undefined' || !wrapper.value) return
  observer = new ResizeObserver(([entry]) => {
    narrow.value = entry.contentRect.width < 560
  })
  observer.observe(wrapper.value)
})
onBeforeUnmount(() => observer?.disconnect())

const G = computed(() =>
  narrow.value
    ? { W: 520, H: 400, M: { left: 48, right: 8, top: 22, bottom: 8 }, gap: 1.2, font: 12 }
    : { W: 1000, H: 320, M: { left: 62, right: 12, top: 20, bottom: 10 }, gap: 2.4, font: 11 },
)
const slotW = computed(() => (G.value.W - G.value.M.left - G.value.M.right) / 100)
const barW = computed(() => slotW.value - G.value.gap)

const hoverIndex = ref(null)
const focused = ref(false)

const valueOf = (p) =>
  props.metric === 'income' ? p.economics.netMonthlyIncome : p.economics.netWealth

const sorted = computed(() =>
  [...props.people].sort((a, b) => valueOf(a) - valueOf(b) || a.id - b.id),
)
const hasNegative = computed(() => sorted.value.some((p) => valueOf(p) < 0))

const yMin = computed(() => Math.min(0, ...sorted.value.map(valueOf)))
const yMax = computed(() => Math.max(...sorted.value.map(valueOf)) * 1.02)

function yFor(v) {
  const { H, M } = G.value
  const span = yMax.value - yMin.value
  return M.top + (1 - (v - yMin.value) / span) * (H - M.top - M.bottom)
}

const ticks = computed(() => {
  const rawStep = yMax.value / 3
  const mag = 10 ** Math.floor(Math.log10(rawStep))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rawStep)
  const out = []
  for (let v = 0; v <= yMax.value; v += step) out.push(v)
  return out
})

function xLeft(i) {
  return G.value.M.left + i * slotW.value + (slotW.value - barW.value) / 2
}

// segment between two pixel rows; corners rounded at the data end only
function segPath(i, yTop, yBot, roundedTop) {
  const x = xLeft(i)
  const w = barW.value
  const h = yBot - yTop
  if (h < 0.75) return `M ${x} ${yBot - 0.75} h ${w} v 0.75 h ${-w} Z`
  if (!roundedTop) return `M ${x} ${yBot} V ${yTop} H ${x + w} V ${yBot} Z`
  const r = Math.min(3, h, w / 2)
  return `M ${x} ${yBot} V ${yTop + r} Q ${x} ${yTop} ${x + r} ${yTop} H ${x + w - r} Q ${x + w} ${yTop} ${x + w} ${yTop + r} V ${yBot} Z`
}

// full bar for the wealth view (handles negative values)
function barPath(i, v) {
  const x = xLeft(i)
  const w = barW.value
  const y0 = yFor(0)
  const y1 = yFor(v)
  const h = Math.abs(y0 - y1)
  const r = Math.min(3, h, w / 2)
  if (h < 0.75) return `M ${x} ${y0 - 0.75} h ${w} v 0.75 h ${-w} Z`
  if (v >= 0) return segPath(i, y1, y0, true)
  return `M ${x} ${y0} V ${y1 - r} Q ${x} ${y1} ${x + r} ${y1} H ${x + w - r} Q ${x + w} ${y1} ${x + w} ${y1 - r} V ${y0} Z`
}

const bars = computed(() =>
  sorted.value.map((p, i) => {
    if (props.metric !== 'income') {
      const v = valueOf(p)
      return { person: p, segs: [{ kind: v < 0 ? 'neg' : 'work', d: barPath(i, v) }] }
    }
    const s = incomeSources(p)
    const y0 = yFor(0)
    const yTotal = yFor(s.total)
    const yWork = yFor(s.fromWork)
    // draw the capital segment only when it is tall enough to survive the
    // 2px surface gap; tiny shares stay in the tooltip and the table
    if (s.fromWealth > 0 && yWork - yTotal >= 3.5) {
      return {
        person: p,
        segs: [
          { kind: 'work', d: segPath(i, yWork, y0, false) },
          { kind: 'capital', d: segPath(i, yTotal, yWork - 2, true) },
        ],
      }
    }
    return { person: p, segs: [{ kind: 'work', d: segPath(i, yTotal, y0, true) }] }
  }),
)

function fillFor(person, i, kind) {
  const lifted = person.id === props.pinnedId || i === hoverIndex.value
  return lifted ? COLORS[kind].lift : COLORS[kind].base
}

// ── interaction ─────────────────────────────────────────────────────────────
function indexFromEvent(e) {
  const { W, M } = G.value
  const rect = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * W
  if (x < M.left - slotW.value || x > W - M.right + slotW.value) return null
  return Math.max(0, Math.min(99, Math.floor((x - M.left) / slotW.value)))
}
function onPointerMove(e) {
  if (e.pointerType === 'touch') return // fingers pin; the card shows the details
  hoverIndex.value = indexFromEvent(e)
}
function onPointerDown(e) {
  const i = indexFromEvent(e)
  if (i === null) return
  const id = sorted.value[i].id
  emit('update:pinnedId', id === props.pinnedId ? null : id)
  if (e.pointerType === 'touch') hoverIndex.value = null
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

// hover wins; otherwise the pinned person only while the chart has keyboard focus
const activeIndex = computed(() => {
  if (hoverIndex.value !== null) return hoverIndex.value
  if (!focused.value) return null
  const i = sorted.value.findIndex((p) => p.id === props.pinnedId)
  return i >= 0 ? i : null
})
const activePerson = computed(() =>
  activeIndex.value === null ? null : sorted.value[activeIndex.value],
)
const activeRank = computed(() => activeIndex.value ?? 0)
const activeSources = computed(() =>
  activePerson.value ? incomeSources(activePerson.value) : null,
)

const tooltipLeft = computed(() => {
  if (activeIndex.value === null) return '0'
  const { W, M } = G.value
  const pct = ((M.left + (activeIndex.value + 0.5) * slotW.value) / W) * 100
  // keep the 15rem-wide tooltip inside the chart on any screen width
  return `clamp(7.5rem, ${pct}%, calc(100% - 7.5rem))`
})

const youMarker = computed(() => {
  if (!props.you) return null
  const v = props.metric === 'income' ? props.you.netMonthlyIncome : props.you.netWealth
  if (v == null || Number.isNaN(v)) return null
  const below = sorted.value.filter((p) => valueOf(p) < v).length
  return { x: G.value.M.left + below * slotW.value }
})
</script>
