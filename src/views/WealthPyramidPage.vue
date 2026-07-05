<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { profiles } from '../data/profiles'

const sortedByWealth = computed(() =>
  [...profiles].sort((a, b) => a.economics.netWealth - b.economics.netWealth),
)
const maxWealth = computed(
  () => sortedByWealth.value[sortedByWealth.value.length - 1].economics.netWealth,
)

const euro = new Intl.NumberFormat('en-BE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0
})

const stepWidth = (wealth) => {
  const minWidth = 1
  const maxWidth = 100
  const share = Math.max(0, wealth) / maxWealth.value
  return `${minWidth + share * (maxWidth - minWidth)}%`
}

const rowTitle = (person) =>
  `${person.name}, ${person.demographics.age} — ${person.work.job}: ${euro.format(person.economics.netWealth)}`
</script>

<template>
  <main class="min-h-screen bg-neutral-950 text-white p-6 md:p-10">
    <div class="mx-auto max-w-6xl">
      <header class="mb-8">
        <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight">Half Wealth Pyramid (100 People)</h1>
        <p class="mt-3 text-neutral-300 max-w-3xl">
          This is a half pyramid (middle-cut): all steps share the same left edge, and the step width grows in
          direct proportion to each person's net wealth. Same 100 fictional Belgians as the
          <RouterLink to="/profiles" class="underline underline-offset-4 hover:text-white">profiles view</RouterLink>
          — one per percentile. Red steps are people whose debts exceed what they own.
        </p>
      </header>

      <section class="bg-white/5 border border-white/10 rounded-xl p-3 md:p-5">
        <div class="space-y-0.5" aria-label="Half wealth pyramid chart">
          <div
            v-for="person in sortedByWealth"
            :key="person.id"
            class="grid grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] gap-2 md:gap-3 items-center"
            :title="rowTitle(person)"
          >
            <span class="text-[10px] md:text-xs text-neutral-300 text-right tabular-nums">
              {{ euro.format(person.economics.netWealth) }}
            </span>
            <div
              class="h-2.5 md:h-3 rounded-r-sm"
              :class="person.economics.netWealth < 0
                ? 'bg-red-500/70'
                : 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400'"
              :style="{ width: stepWidth(person.economics.netWealth) }"
            />
          </div>
        </div>
      </section>

      <footer class="mt-6 text-sm text-neutral-400 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p>
          Smallest step: {{ euro.format(sortedByWealth[0].economics.netWealth) }} ·
          Largest step: {{ euro.format(maxWealth) }}
        </p>
        <RouterLink
          to="/"
          class="inline-flex w-fit items-center rounded-md border border-white/20 px-3 py-1.5 hover:bg-white/10 transition"
        >
          Back to landing page
        </RouterLink>
      </footer>
    </div>
  </main>
</template>
