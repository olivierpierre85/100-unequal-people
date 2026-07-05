<template>
  <div class="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <header class="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            The 100 Belgians
          </h1>
          <p class="text-neutral-400 mt-2">
            One fictional person per percentile — together they are Belgium's whole
            {{ metric === 'wealth' ? 'wealth' : 'income' }} distribution, poorest to richest.
          </p>
        </div>
        <router-link to="/" class="px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition">Back</router-link>
      </header>

      <!-- key numbers -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="tile in statTiles" :key="tile.label" class="rounded-xl border border-white/5 bg-neutral-900/60 p-4">
          <div class="text-sm text-neutral-400">{{ tile.label }}</div>
          <div class="mt-1 text-2xl font-semibold text-white">{{ tile.value }}</div>
          <div class="text-xs text-neutral-500 mt-1">{{ tile.note }}</div>
        </div>
      </div>

      <!-- place yourself: scopes the chart below it -->
      <div class="rounded-xl border border-white/5 bg-neutral-900/60 p-4">
        <div class="flex flex-wrap items-end gap-4">
          <div class="font-medium text-white mr-2">Where would you land?</div>
          <label class="text-sm text-neutral-400">
            Your net income (€/month)
            <input
              v-model.number="youIncome" type="number" min="0" step="50" placeholder="e.g. 2400"
              class="mt-1 block w-40 rounded-lg border border-white/10 bg-neutral-800 px-3 py-1.5 text-white placeholder-neutral-600 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <label class="text-sm text-neutral-400">
            Your net wealth (€, home included, debts deducted)
            <input
              v-model.number="youWealth" type="number" step="1000" placeholder="e.g. 180000"
              class="mt-1 block w-48 rounded-lg border border-white/10 bg-neutral-800 px-3 py-1.5 text-white placeholder-neutral-600 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <p v-if="youSentence" class="text-sm text-neutral-300 basis-full md:basis-auto md:ml-2">
            {{ youSentence }}
          </p>
        </div>
      </div>

      <!-- the parade -->
      <div class="rounded-2xl border border-white/5 bg-neutral-900/50 p-4 md:p-6 backdrop-blur-sm">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="font-semibold text-white">
            The parade — everyone lined up by {{ metric === 'wealth' ? 'net wealth' : 'net monthly income' }}
          </h2>
          <div class="flex gap-2 bg-neutral-800 p-1 rounded-lg">
            <button
              @click="metric = 'wealth'"
              :class="metric === 'wealth' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'"
              class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Wealth
            </button>
            <button
              @click="metric = 'income'"
              :class="metric === 'income' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'"
              class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Income
            </button>
          </div>
        </div>

        <WealthParade
          :people="profiles"
          :metric="metric"
          :you="you"
          v-model:pinnedId="pinnedId"
        />

        <p class="mt-3 text-xs text-neutral-500">
          Hover or use the arrow keys to meet each person; click to pin them.
          The scale is linear on purpose — if most bars look crushed flat next to the
          {{ metric === 'wealth' ? 'right-hand few' : 'top earners' }}, that flatness <em>is</em> the finding.
        </p>
      </div>

      <!-- pinned person -->
      <div v-if="pinnedPerson" class="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 md:p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-xl font-semibold text-white">
              {{ pinnedPerson.name }}, {{ pinnedPerson.demographics.age }}
              <span class="text-neutral-400 font-normal">— {{ pinnedPerson.work.job }}</span>
            </h3>
            <p class="mt-1 text-sm text-neutral-400">
              {{ pinnedPerson.demographics.region }} · speaks {{ pinnedPerson.demographics.language }} ·
              {{ fmtEur(pinnedPerson.economics.netMonthlyIncome) }}/month ·
              {{ fmtEur(pinnedPerson.economics.netWealth) }} net wealth
            </p>
          </div>
          <button
            @click="pinnedId = null"
            class="rounded-lg px-2.5 py-1 text-neutral-400 hover:bg-white/10 hover:text-white transition"
            aria-label="Close profile details"
          >✕</button>
        </div>
        <div v-if="pinnedSources" class="mt-4">
          <div class="flex items-baseline justify-between text-xs text-neutral-400">
            <span>Where the {{ fmtEur(pinnedSources.total) }}/month comes from</span>
            <span v-if="pinnedSources.fromWealth > 0" class="text-neutral-300" style="font-variant-numeric: tabular-nums">
              {{ fmtEur(pinnedSources.fromWork) }} work &amp; pensions · {{ fmtEur(pinnedSources.fromWealth) }} wealth ({{ Math.round(pinnedSources.share * 100) }}%)
            </span>
            <span v-else class="text-neutral-300">all of it from work &amp; pensions</span>
          </div>
          <div class="mt-1.5 flex h-2.5 w-full overflow-hidden rounded-full bg-neutral-800" role="img"
            :aria-label="`${Math.round(pinnedSources.share * 100)} percent of income from wealth`">
            <div class="h-full" style="background:#3987e5" :style="{ width: `${100 - pinnedSources.share * 100}%` }"></div>
            <div class="h-full" style="background:#c98500" :style="{ width: `${pinnedSources.share * 100}%` }"></div>
          </div>
        </div>
        <dl class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="item in pinnedLifestyle" :key="item.label" class="rounded-lg bg-neutral-900/60 p-3">
            <dt class="text-xs uppercase tracking-wider text-neutral-500">{{ item.icon }} {{ item.label }}</dt>
            <dd class="mt-1 text-sm text-neutral-200">{{ item.text }}</dd>
          </div>
        </dl>
      </div>

      <!-- why this exists -->
      <div class="rounded-2xl border border-white/5 bg-neutral-900/50 p-4 md:p-6 text-sm leading-relaxed text-neutral-300">
        <h2 class="font-semibold text-white mb-2">Why show it like this?</h2>
        <p>
          Because almost nobody knows where they really stand. We all judge "normal" by our own
          social circle — colleagues, family, neighbours — and they mostly live like we do.
          Surveys across Europe keep finding the same pattern: most people in the top tenth
          place themselves comfortably in the middle, and people at the bottom rarely realise
          how far away the top is. Enter your own numbers above — you are probably not where
          you think you are.
        </p>
      </div>

      <!-- table: the accessible twin of the chart -->
      <div class="overflow-x-auto bg-neutral-900/50 rounded-2xl border border-white/5 backdrop-blur-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-white/10 text-neutral-400 text-sm uppercase tracking-wider">
              <th class="p-4 font-medium">Rank</th>
              <th class="p-4 font-medium">Person</th>
              <th class="p-4 font-medium">Occupation</th>
              <th class="p-4 font-medium">Region</th>
              <th
                class="p-4 font-medium text-right cursor-pointer hover:text-white transition-colors"
                @click="metric = 'income'"
              >
                Net income / mo
                <span v-if="metric === 'income'" class="ml-1">▼</span>
              </th>
              <th
                class="p-4 font-medium text-right cursor-pointer hover:text-white transition-colors"
                @click="metric = 'wealth'"
              >
                Net wealth
                <span v-if="metric === 'wealth'" class="ml-1">▼</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr
              v-for="(person, index) in sortedProfiles"
              :key="person.id"
              @click="pinnedId = pinnedId === person.id ? null : person.id"
              class="cursor-pointer transition-colors"
              :class="person.id === pinnedId ? 'bg-blue-500/10' : 'hover:bg-white/5'"
            >
              <td class="p-4 font-mono text-neutral-500">#{{ index + 1 }}</td>
              <td class="p-4">
                <div class="font-medium text-white">{{ person.name }}, {{ person.demographics.age }}</div>
                <div class="text-sm text-neutral-500">{{ person.demographics.gender }} · {{ person.demographics.language }}</div>
              </td>
              <td class="p-4 text-sm text-neutral-300">{{ person.work.job }}</td>
              <td class="p-4">
                <span :class="{
                  'bg-yellow-500/10 text-yellow-500': person.demographics.region === 'Flanders',
                  'bg-red-500/10 text-red-500': person.demographics.region === 'Wallonia',
                  'bg-blue-500/10 text-blue-500': person.demographics.region === 'Brussels'
                }" class="px-2 py-1 rounded text-xs font-medium">
                  {{ person.demographics.region }}
                </span>
              </td>
              <td class="p-4 text-right font-mono" :class="metric === 'income' ? 'text-emerald-400 font-bold' : ''">
                {{ fmtEur(person.economics.netMonthlyIncome) }}
                <div v-if="incomeSources(person).share >= 0.01" class="text-xs font-sans font-normal text-neutral-500">
                  {{ Math.round(incomeSources(person).share * 100) }}% from wealth
                </div>
              </td>
              <td
                class="p-4 text-right font-mono"
                :class="person.economics.netWealth < 0 ? 'text-red-400' + (metric === 'wealth' ? ' font-bold' : '')
                  : metric === 'wealth' ? 'text-emerald-400 font-bold' : ''"
              >
                {{ fmtEur(person.economics.netWealth) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="text-xs text-neutral-600 pb-4">
        Fictional profiles. Values are illustrative interpolations of Statbel salary and
        fiscal statistics and the NBB/ECB Household Finance and Consumption Survey (2023/2024)
        — see <span class="font-mono">scripts/generate-profiles.mjs</span> for method and sources.
        The richest of the 100 stands for the <em>average</em> of the top 1%; Belgium's
        richest families are roughly a thousand times wealthier still.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { profiles } from '../data/profiles'
import { lifestyle } from '../data/lifestyle'
import { incomeSources } from '../data/incomeSources'
import WealthParade from '../components/WealthParade.vue'

const route = useRoute()
const metric = ref(route.query.view === 'income' ? 'income' : 'wealth')
const pinnedId = ref(null)
const youIncome = ref(null)
const youWealth = ref(null)

const you = computed(() => {
  const income = Number.isFinite(youIncome.value) ? youIncome.value : null
  const wealth = Number.isFinite(youWealth.value) ? youWealth.value : null
  if (income === null && wealth === null) return null
  return { netMonthlyIncome: income, netWealth: wealth }
})

const youSentence = computed(() => {
  if (!you.value) return ''
  const parts = []
  if (you.value.netMonthlyIncome !== null) {
    const below = profiles.filter(
      (p) => p.economics.netMonthlyIncome < you.value.netMonthlyIncome,
    ).length
    parts.push(`you earn more than ${below} of these 100 people`)
  }
  if (you.value.netWealth !== null) {
    const below = profiles.filter((p) => p.economics.netWealth < you.value.netWealth).length
    parts.push(`you own more than ${below} of them`)
  }
  return `On these numbers, ${parts.join(' and ')}.`
})

const sortedProfiles = computed(() =>
  [...profiles].sort((a, b) =>
    metric.value === 'wealth'
      ? a.economics.netWealth - b.economics.netWealth || a.id - b.id
      : a.economics.netMonthlyIncome - b.economics.netMonthlyIncome || a.id - b.id,
  ),
)

const pinnedPerson = computed(() => profiles.find((p) => p.id === pinnedId.value) ?? null)
const pinnedSources = computed(() =>
  pinnedPerson.value ? incomeSources(pinnedPerson.value) : null,
)

const LIFESTYLE_META = [
  ['housing', '🏠', 'Home'],
  ['holidays', '✈️', 'Holidays'],
  ['restaurants', '🍽️', 'Eating out'],
  ['smartphone', '📱', 'New phone'],
  ['concert', '🎤', 'A big concert'],
]
const pinnedLifestyle = computed(() => {
  if (!pinnedPerson.value) return []
  const l = lifestyle(pinnedPerson.value)
  return LIFESTYLE_META.map(([key, icon, label]) => ({ icon, label, text: l[key] }))
})

const statTiles = computed(() => {
  const wealths = profiles.map((p) => p.economics.netWealth).sort((a, b) => a - b)
  const incomes = profiles.map((p) => p.economics.netMonthlyIncome).sort((a, b) => a - b)
  const medianW = (wealths[49] + wealths[50]) / 2
  const medianI = (incomes[49] + incomes[50]) / 2
  const total = wealths.reduce((s, v) => s + v, 0)
  const top10 = wealths.slice(90).reduce((s, v) => s + v, 0)
  const bottom50 = wealths.slice(0, 50).reduce((s, v) => s + Math.max(0, v), 0)
  return [
    {
      label: 'Median net income',
      value: `${fmtEur(Math.round(medianI))}/mo`,
      note: 'Half the country lives on less',
    },
    {
      label: 'Median net wealth',
      value: fmtEur(Math.round(medianW)),
      note: 'Home equity included, debts deducted',
    },
    {
      label: 'Top 10 people own',
      value: `${Math.round((100 * top10) / total)}% of everything`,
      note: `The bottom 50 share ${Math.round((100 * bottom50) / total)}%`,
    },
    {
      label: "The top 10's income comes",
      value: `${topCapitalShare.value}% from wealth`,
      note: `Rent, dividends, interest — for the bottom 50 it's ${bottomCapitalShare.value}%`,
    },
  ]
})

function capitalShareOf(list) {
  let wealth = 0
  let total = 0
  for (const p of list) {
    const s = incomeSources(p)
    wealth += s.fromWealth
    total += s.total
  }
  return Math.round((100 * wealth) / total)
}
const byWealthDesc = computed(() =>
  [...profiles].sort((a, b) => b.economics.netWealth - a.economics.netWealth),
)
const topCapitalShare = computed(() => capitalShareOf(byWealthDesc.value.slice(0, 10)))
const bottomCapitalShare = computed(() => capitalShareOf(byWealthDesc.value.slice(50)))

const fmtEur = (v) =>
  (v < 0 ? '−€' : '€') + new Intl.NumberFormat('fr-BE').format(Math.abs(v))
</script>
