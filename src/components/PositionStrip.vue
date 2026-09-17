<template>
  <!-- One 100-place ladder per measure, poorest left to richest right, with
       the visitor's guess above it and their actual position below. Plain
       HTML so the labels stay readable at every screen width. -->
  <div class="space-y-1">
    <div
      v-for="row in laidOut"
      :key="row.key"
      class="relative select-none"
      :style="{ height: `${ROW_H}rem` }"
      role="img"
      :aria-label="`${t(`you.strip.${row.key}`)}: ${t('you.strip.guess')} ${row.guess}, ${row.actual}`"
    >
      <div
        class="absolute left-0 right-0 rounded"
        :style="{ top: `${STRIP_TOP}rem`, height: `${STRIP_H}rem`, background: 'linear-gradient(to right, #ffffff, #cfcaff)' }"
      >
        <span v-for="n in [25, 50, 75]" :key="n" class="absolute top-0 h-full w-px bg-paper" :style="{ left: `${n}%` }"></span>
      </div>
      <span class="absolute left-0 text-[11px] text-muted" :style="{ top: `${STRIP_BOTTOM + 0.2}rem` }">{{ t('you.strip.poorest') }}</span>
      <span class="absolute right-0 text-[11px] text-muted" :style="{ top: `${STRIP_BOTTOM + 0.2}rem` }">{{ t('you.strip.richest') }}</span>

      <template v-for="m in row.markers" :key="m.key">
        <span
          class="absolute"
          :class="m.dashed ? 'w-0 border-l border-dashed border-ink' : 'w-px bg-ink'"
          :style="{ left: `${m.pos}%`, top: `${m.lineTop}rem`, height: `${m.lineBottom - m.lineTop}rem` }"
        ></span>
        <span
          class="absolute -translate-x-1/2 -translate-y-1/2"
          :class="{
            'h-3.5 w-3.5 rounded-full border-2 border-ink bg-paper': m.shape === 'hollow',
            'h-3.5 w-3.5 rounded-full bg-accent ring-2 ring-paper': m.shape === 'dot',
            'h-3 w-3 rotate-45 bg-ink ring-2 ring-paper': m.shape === 'diamond',
          }"
          :style="{ left: `${m.pos}%`, top: `${m.mark}rem` }"
        ></span>
        <span class="absolute whitespace-nowrap text-xs font-semibold text-ink" :style="labelStyle(m)">{{ m.text }}</span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '../i18n'

const props = defineProps({
  // [{ key: 'income' | 'wealth', guess: 0..100, actual: 0..100 }]
  rows: { type: Array, required: true },
})

const STRIP_TOP = 3.1
const STRIP_H = 0.875
const STRIP_BOTTOM = STRIP_TOP + STRIP_H
const ROW_H = 7.4

const clamp = (n) => Math.max(0, Math.min(100, n))

const laidOut = computed(() =>
  props.rows
    .filter((r) => r.actual != null)
    .map((r) => ({
      key: r.key,
      guess: r.guess,
      actual: r.actual,
      markers: [
        {
          key: 'guess', shape: 'hollow', dashed: true, pos: clamp(r.guess),
          mark: 1.55, label: 0, lineTop: 2.0, lineBottom: STRIP_TOP,
          text: `${t('you.strip.guess')} · ${r.guess}`,
        },
        {
          key: 'actual', shape: r.key === 'income' ? 'dot' : 'diamond', pos: clamp(r.actual),
          mark: STRIP_BOTTOM + 1.5, label: STRIP_BOTTOM + 2.05, lineTop: STRIP_BOTTOM, lineBottom: STRIP_BOTTOM + 1.5,
          text: `${t(`you.strip.${r.key}`)} · ${r.actual}`,
        },
      ],
    })),
)

// labels are centred on the marker, but hug the edge near either end
function labelStyle(m) {
  const style = { top: `${m.label}rem` }
  if (m.pos < 12) style.left = `${m.pos}%`
  else if (m.pos > 88) style.right = `${100 - m.pos}%`
  else { style.left = `${m.pos}%`; style.transform = 'translateX(-50%)' }
  return style
}
</script>
