<template>
  <!-- The 100 as a row of little figures in the same order as the parade,
       coloured by wealth. The visitor's own figure is inserted at their
       value, and the people right next to it are drawn bigger so they are
       easy to pick. Scrolls sideways; drag with the mouse. -->
  <div>
    <div
      ref="scroller"
      class="relative overflow-x-auto overscroll-x-contain rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      :class="dragging ? 'cursor-grabbing' : 'cursor-grab'"
      tabindex="0"
      role="group"
      :aria-label="t('people.aria')"
      @keydown="onKeydown"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @pointerleave="onUp"
    >
      <div class="flex w-max items-end gap-[3px] px-3 pb-2 pt-7">
        <template v-for="item in items" :key="item.key">
          <div
            v-if="item.you"
            class="relative flex shrink-0 flex-col items-center"
            :style="{ width: `${item.w}px` }"
            data-key="you"
          >
            <span class="absolute -top-6 whitespace-nowrap rounded-full bg-coral px-1.5 text-[10px] font-extrabold uppercase leading-4 text-white">
              {{ t('people.you') }}
            </span>
            <svg viewBox="0 0 20 24" :width="item.w" :height="item.h" aria-hidden="true">
              <circle cx="10" cy="6" r="4.6" fill="#ff5a36" />
              <path d="M2 24v-5.5a8 8 0 0 1 16 0V24z" fill="#ff5a36" />
            </svg>
          </div>
          <button
            v-else
            type="button"
            tabindex="-1"
            class="shrink-0 rounded-md transition-[width,height] duration-200 focus:outline-none"
            :class="item.person.id === pinnedId ? 'bg-ink/10 ring-2 ring-ink' : 'hover:bg-ink/5'"
            :style="{ width: `${item.w}px`, height: `${item.h}px` }"
            :data-key="item.person.id"
            :aria-label="`${item.person.name}, ${item.person.demographics.age}, ${jobTitle(item.person, locale)}`"
            :aria-pressed="item.person.id === pinnedId"
            @click="onClick(item.person.id)"
          >
            <svg viewBox="0 0 20 24" class="h-full w-full" aria-hidden="true">
              <circle cx="10" cy="6" r="4.6" :fill="item.color" />
              <path d="M2 24v-5.5a8 8 0 0 1 16 0V24z" :fill="item.color" />
            </svg>
          </button>
        </template>
      </div>
    </div>
    <p class="mt-1 text-xs text-muted">{{ t('people.hint') }}</p>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { jobTitle } from '../data/jobs'
import { t, locale } from '../i18n'

const props = defineProps({
  people: { type: Array, required: true },
  metric: { type: String, default: 'wealth' }, // same order as the parade
  pinnedId: { type: Number, default: null },
  // { netMonthlyIncome, netWealth } for the visitor, or null
  you: { type: Object, default: null },
})
const emit = defineEmits(['update:pinnedId'])

const BASE_W = 18
const BASE_H = 26
const YOU_SCALE = 2.1

const valueOf = (p) =>
  props.metric === 'income' ? p.economics.netMonthlyIncome : p.economics.netWealth

const sorted = computed(() =>
  [...props.people].sort((a, b) => valueOf(a) - valueOf(b) || a.id - b.id),
)

// colour by wealth, whatever the order
const wealthIndex = computed(() => {
  const byWealth = [...props.people].sort((a, b) => a.economics.netWealth - b.economics.netWealth || a.id - b.id)
  return new Map(byWealth.map((p, i) => [p.id, i]))
})
const RAMP = ['#cfcaff', '#aea6ff', '#8d82ff', '#6c5cff', '#4b39f0']
function colorOf(p) {
  if (p.economics.netWealth < 0) return '#e5484d'
  const i = wealthIndex.value.get(p.id)
  if (i === 99) return '#1f1b3a' // the 1%
  return RAMP[Math.min(4, Math.floor(i / 20))]
}

const youValue = computed(() => {
  if (!props.you) return null
  const v = props.metric === 'income' ? props.you.netMonthlyIncome : props.you.netWealth
  return v == null || Number.isNaN(v) ? null : v
})
// where the visitor's figure goes: after everyone with a lower value
const youIndex = computed(() =>
  youValue.value == null ? null : sorted.value.filter((p) => valueOf(p) < youValue.value).length,
)

// fisheye: the neighbours of "you" are biggest, then a little smaller each step
function scaleAt(pos, yi) {
  if (yi == null) return 1
  const dist = Math.abs(pos - yi)
  if (dist === 0) return YOU_SCALE
  if (dist > 5) return 1
  return 1 + (6 - dist) / 5 // 2.0, 1.8, 1.6, 1.4, 1.2
}

const items = computed(() => {
  const yi = youIndex.value
  const out = []
  const youItem = { key: 'you', you: true, w: Math.round(BASE_W * YOU_SCALE), h: Math.round(BASE_H * YOU_SCALE) }
  let pos = 0
  sorted.value.forEach((p, i) => {
    if (yi === i) { out.push(youItem); pos++ }
    const s = scaleAt(pos, yi)
    out.push({ key: p.id, person: p, color: colorOf(p), w: Math.round(BASE_W * s), h: Math.round(BASE_H * s) })
    pos++
  })
  if (yi === sorted.value.length) out.push(youItem)
  return out
})

// ── scrolling: drag with the mouse, keep "you" or the pinned person in view ──
const scroller = ref(null)
const dragging = ref(false)
let dragStartX = 0
let dragStartLeft = 0
let dragDist = 0

function onDown(e) {
  if (e.pointerType !== 'mouse' || e.button !== 0) return
  dragging.value = true
  dragStartX = e.clientX
  dragStartLeft = scroller.value.scrollLeft
  dragDist = 0
}
function onMove(e) {
  if (!dragging.value) return
  const dx = e.clientX - dragStartX
  dragDist = Math.max(dragDist, Math.abs(dx))
  scroller.value.scrollLeft = dragStartLeft - dx
}
function onUp() {
  dragging.value = false
}
function onClick(id) {
  if (dragDist > 5) { dragDist = 0; return } // that was a drag, not a pick
  emit('update:pinnedId', id === props.pinnedId ? null : id)
}

function centerOn(key) {
  const el = scroller.value?.querySelector(`[data-key="${key}"]`)
  if (!el) return
  const left = el.offsetLeft - scroller.value.clientWidth / 2 + el.offsetWidth / 2
  scroller.value.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
}
watch(() => props.pinnedId, async (id) => {
  if (id == null) return
  await nextTick()
  centerOn(id)
})
watch([youIndex, () => props.metric], async () => {
  await nextTick()
  if (youIndex.value != null) centerOn('you')
})
onMounted(() => {
  if (youIndex.value != null) centerOn('you')
})

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
</script>
