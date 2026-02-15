<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const people = Array.from({ length: 100 }, (_, index) => {
  const rank = index + 1
  const normalized = rank / 100
  const wealth = Math.round(8000 + 5500000 * Math.pow(normalized, 4.4))

  return {
    id: rank,
    name: `Person ${String(rank).padStart(3, '0')}`,
    wealth
  }
})

const sortedByWealth = computed(() => [...people].sort((a, b) => a.wealth - b.wealth))
const maxWealth = computed(() => sortedByWealth.value[sortedByWealth.value.length - 1].wealth)

const euro = new Intl.NumberFormat('en-BE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0
})

const stepWidth = (wealth) => {
  const minWidth = 5
  const maxWidth = 100
  return `${minWidth + (wealth / maxWealth.value) * (maxWidth - minWidth)}%`
}
</script>

<template>
  <main class="min-h-screen bg-neutral-950 text-white p-6 md:p-10">
    <div class="mx-auto max-w-6xl">
      <header class="mb-8">
        <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight">Half Wealth Pyramid (100 People)</h1>
        <p class="mt-3 text-neutral-300 max-w-3xl">
          This is a half pyramid (middle-cut): all steps share the same left edge, and the step width grows in
          direct proportion to each person's wealth.
        </p>
      </header>

      <section class="bg-white/5 border border-white/10 rounded-xl p-3 md:p-5">
        <div class="space-y-0.5" aria-label="Half wealth pyramid chart">
          <div
            v-for="person in sortedByWealth"
            :key="person.id"
            class="grid grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] gap-2 md:gap-3 items-center"
            :title="`${person.name}: ${euro.format(person.wealth)}`"
          >
            <span class="text-[10px] md:text-xs text-neutral-300 text-right tabular-nums">
              {{ euro.format(person.wealth) }}
            </span>
            <div
              class="h-2.5 md:h-3 rounded-r-sm bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
              :style="{ width: stepWidth(person.wealth) }"
            />
          </div>
        </div>
      </section>

      <footer class="mt-6 text-sm text-neutral-400 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p>Smallest step: {{ euro.format(sortedByWealth[0].wealth) }} · Largest step: {{ euro.format(maxWealth) }}</p>
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
