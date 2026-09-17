<template>
  <div class="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
    <!-- top bar -->
    <header class="flex flex-wrap items-center justify-between gap-3 py-4">
      <a href="#top" class="font-display text-lg font-extrabold text-ink">{{ t('meta.title') }}</a>
      <div class="flex items-center gap-2">
        <nav :aria-label="t('nav.langLabel')" class="flex rounded-full border-2 border-ink/10 bg-card p-0.5 text-xs font-bold">
          <button
            v-for="l in LOCALES" :key="l" type="button" :lang="l"
            class="rounded-full px-2.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            :class="l === locale ? 'bg-ink text-paper' : 'text-muted hover:text-ink'"
            :aria-pressed="l === locale" :title="langName(l)"
            @click="setLocale(l)"
          >{{ l.toUpperCase() }}</button>
        </nav>
        <button type="button" class="btn" @click="share">{{ copied ? t('nav.copied') : t('nav.share') }}</button>
      </div>
    </header>

    <main id="top">
      <!-- hero -->
      <section class="py-8 md:py-14">
        <p class="inline-block rounded-full bg-capital-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-ink">{{ t('hero.kicker') }}</p>
        <h1 class="mt-4 max-w-3xl text-4xl leading-[1.02] text-ink sm:text-5xl md:text-6xl">{{ t('hero.title') }}</h1>
        <p class="mt-5 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{{ t('hero.lead') }}</p>
        <a href="#you" class="btn-primary mt-6">{{ t('hero.cta') }} <span aria-hidden="true">↓</span></a>
      </section>

      <!-- where would you land -->
      <YouForm
        v-model:guessIncome="guessIncome"
        v-model:guessWealth="guessWealth"
        v-model:income="youIncome"
        v-model:capital="youCapital"
        v-model:wealth="youWealth"
        :result="result"
      />

      <!-- the parade -->
      <section id="parade" class="mt-14 scroll-mt-6" aria-labelledby="parade-heading">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="parade-heading" class="text-3xl md:text-4xl">{{ t('parade.heading') }}</h2>
            <p class="mt-1 text-muted">{{ metric === 'wealth' ? t('parade.subtitleWealth') : t('parade.subtitleIncome') }}</p>
          </div>
          <div class="flex rounded-full border-2 border-ink/10 bg-card p-0.5 text-sm font-bold" role="group">
            <button
              v-for="m in ['wealth', 'income']" :key="m" type="button"
              class="rounded-full px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              :class="metric === m ? 'bg-ink text-paper' : 'text-muted hover:text-ink'"
              :aria-pressed="metric === m"
              @click="metric = m"
            >{{ t(`parade.${m}`) }}</button>
          </div>
        </div>

        <div class="card mt-4 p-3 md:p-5">
          <WealthParade :people="profiles" :metric="metric" :you="you" v-model:pinnedId="pinnedId" />
        </div>
        <p class="mt-3 max-w-3xl text-sm text-muted">{{ t('parade.hint') }}</p>

        <!-- the 100 as a row of people, in the same order -->
        <PeopleStrip class="mt-5" :people="profiles" :metric="metric" :you="you" v-model:pinnedId="pinnedId" />

        <PersonCard
          v-if="pinnedPerson"
          ref="cardEl"
          class="mt-4"
          :person="pinnedPerson"
          :income-rank="pinnedRanks.income"
          :wealth-rank="pinnedRanks.wealth"
          @close="pinnedId = null"
        />
      </section>

      <!-- four numbers -->
      <section class="mt-14" aria-labelledby="stats-heading">
        <h2 id="stats-heading" class="sr-only">{{ t('stats.heading') }}</h2>
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div v-for="(tile, i) in statTiles" :key="tile.label" class="rounded-3xl p-5" :class="TILE_TINTS[i]">
            <div class="text-sm font-bold text-ink/70">{{ tile.label }}</div>
            <div class="mt-1 font-display text-3xl font-extrabold leading-tight text-ink">{{ tile.value }}</div>
            <div class="mt-1 text-xs text-ink/60">{{ tile.note }}</div>
          </div>
        </div>
      </section>

      <!-- why -->
      <section class="mt-16 max-w-3xl" aria-labelledby="why-heading">
        <h2 id="why-heading" class="text-3xl md:text-4xl">{{ t('why.heading') }}</h2>
        <p class="mt-4 leading-relaxed text-ink/90">{{ t('why.p1') }}</p>
        <p class="mt-4 leading-relaxed text-ink/90">{{ t('why.p2') }}</p>
        <p class="mt-4 leading-relaxed text-ink/90">{{ t('why.p3') }}</p>
      </section>

      <!-- table: the accessible twin of the chart, folded away by default -->
      <section class="mt-16" aria-labelledby="table-heading">
        <h2 id="table-heading" class="text-3xl md:text-4xl">{{ t('table.heading') }}</h2>
        <button
          type="button"
          class="btn mt-3"
          :aria-expanded="showTable"
          aria-controls="all-table"
          @click="showTable = !showTable"
        >{{ showTable ? t('table.hide') : t('table.show') }} <span aria-hidden="true">{{ showTable ? '▴' : '▾' }}</span></button>
        <div id="all-table" v-show="showTable">
          <p class="mt-4 text-sm text-muted">{{ t('table.sortHint') }}</p>
          <ProfilesTable class="mt-3" :people="sortedProfiles" :metric="metric" v-model:pinnedId="pinnedId" @update:metric="metric = $event" />
        </div>
      </section>
    </main>

    <footer class="mt-16 border-t border-rule pb-12 pt-8 text-sm text-muted">
      <h2 class="text-xl text-ink">{{ t('method.heading') }}</h2>
      <p class="mt-3 max-w-3xl leading-relaxed">{{ t('method.text') }}</p>
      <h3 class="mt-5 text-xs font-bold uppercase tracking-wider">{{ t('method.sourcesHeading') }}</h3>
      <ul class="mt-2 space-y-1">
        <li v-for="s in t('method.sources')" :key="s.url">
          <a :href="s.url" target="_blank" rel="noopener" class="underline underline-offset-4 hover:text-ink">{{ s.label }}</a>
        </li>
      </ul>
      <div class="mt-8 flex flex-wrap items-center gap-3">
        <button type="button" class="btn-primary" @click="share">{{ copied ? t('nav.copied') : t('footer.share') }}</button>
        <span>{{ t('footer.fictional') }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { profiles } from '../data/profiles'
import { incomeSources } from '../data/incomeSources'
import { t, locale, setLocale, langName, LOCALES } from '../i18n'
import { fmtEur } from '../utils/format'
import WealthParade from '../components/WealthParade.vue'
import PeopleStrip from '../components/PeopleStrip.vue'
import YouForm from '../components/YouForm.vue'
import PersonCard from '../components/PersonCard.vue'
import ProfilesTable from '../components/ProfilesTable.vue'

const route = useRoute()
const router = useRouter()

const TILE_TINTS = ['bg-accent-soft', 'bg-capital-soft', 'bg-coral-soft', 'bg-mint-soft']

// ── view state ──────────────────────────────────────────────────────────────
const metric = ref(route.query.view === 'income' ? 'income' : 'wealth')
watch(metric, (m) => router.replace({ query: { ...route.query, view: m } }))

const pinnedId = ref(null)
const cardEl = ref(null)
const showTable = ref(false)

// bring the pinned person's card into view when it is off-screen (phones)
watch(pinnedId, async (id) => {
  if (id == null) return
  await nextTick()
  const el = cardEl.value?.$el
  if (!el?.getBoundingClientRect) return
  const r = el.getBoundingClientRect()
  if (r.top < 0 || r.bottom > window.innerHeight) {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
})

// ── the visitor ─────────────────────────────────────────────────────────────
const guessIncome = ref(50)
const guessWealth = ref(50)
const youIncome = ref(null)
const youCapital = ref(null)
const youWealth = ref(null)

const you = computed(() => {
  if (youIncome.value == null && youWealth.value == null) return null
  return { netMonthlyIncome: youIncome.value, netWealth: youWealth.value }
})

const countBelow = (key, v) => profiles.filter((p) => p.economics[key] < v).length

// one block per measure: actual rank, the guess, and a sentence comparing them
function block(key, rank, guess) {
  if (rank == null) return null
  const d = Math.round(rank - guess)
  const gap = Math.abs(d) < 10 ? t('you.gapClose') : t(d > 0 ? 'you.gapUp' : 'you.gapDown', { d: Math.abs(d) })
  const first = t(key === 'income' ? 'you.resultIncome' : 'you.resultWealth', { n: rank })
  return { key, rank, guess, text: `${first} ${t('you.resultGuess', { n: guess })} ${gap}` }
}

const result = computed(() => {
  if (!you.value) return null
  const income = youIncome.value == null ? null
    : block('income', countBelow('netMonthlyIncome', youIncome.value), guessIncome.value)
  const wealth = youWealth.value == null ? null
    : block('wealth', countBelow('netWealth', youWealth.value), guessWealth.value)
  let capitalText = null
  if (youCapital.value != null && youIncome.value > 0 && youCapital.value > 0) {
    const share = Math.min(1, youCapital.value / youIncome.value)
    const below = profiles.filter((p) => incomeSources(p).share < share).length
    capitalText = t('you.resultCapital', { pct: Math.round(share * 100), n: below })
  }
  return { income, wealth, capitalText }
})

// ── the 100 ─────────────────────────────────────────────────────────────────
const sortedProfiles = computed(() =>
  [...profiles].sort((a, b) =>
    metric.value === 'wealth'
      ? a.economics.netWealth - b.economics.netWealth || a.id - b.id
      : a.economics.netMonthlyIncome - b.economics.netMonthlyIncome || a.id - b.id,
  ),
)

const pinnedPerson = computed(() => profiles.find((p) => p.id === pinnedId.value) ?? null)
const pinnedRanks = computed(() => {
  const p = pinnedPerson.value
  if (!p) return { income: 0, wealth: 0 }
  return {
    income: countBelow('netMonthlyIncome', p.economics.netMonthlyIncome),
    wealth: countBelow('netWealth', p.economics.netWealth),
  }
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

const statTiles = computed(() => {
  const l = locale.value
  const wealths = profiles.map((p) => p.economics.netWealth).sort((a, b) => a - b)
  const incomes = profiles.map((p) => p.economics.netMonthlyIncome).sort((a, b) => a - b)
  const medianW = (wealths[49] + wealths[50]) / 2
  const medianI = (incomes[49] + incomes[50]) / 2
  const total = wealths.reduce((s, v) => s + v, 0)
  const top10 = wealths.slice(90).reduce((s, v) => s + v, 0)
  const bottom50 = wealths.slice(0, 50).reduce((s, v) => s + Math.max(0, v), 0)
  const byWealthDesc = [...profiles].sort((a, b) => b.economics.netWealth - a.economics.netWealth)
  return [
    {
      label: t('stats.medianIncome'),
      value: `${fmtEur(Math.round(medianI), l)}${t('stats.perMonth')}`,
      note: t('stats.medianIncomeNote'),
    },
    {
      label: t('stats.medianWealth'),
      value: fmtEur(Math.round(medianW), l),
      note: t('stats.medianWealthNote'),
    },
    {
      label: t('stats.top10Own'),
      value: t('stats.top10OwnValue', { pct: Math.round((100 * top10) / total) }),
      note: t('stats.top10OwnNote', { pct: Math.round((100 * bottom50) / total) }),
    },
    {
      label: t('stats.top10Capital'),
      value: t('stats.top10CapitalValue', { pct: capitalShareOf(byWealthDesc.slice(0, 10)) }),
      note: t('stats.top10CapitalNote', { pct: capitalShareOf(byWealthDesc.slice(50)) }),
    },
  ]
})

// ── sharing ─────────────────────────────────────────────────────────────────
const copied = ref(false)
async function share() {
  const url = `${location.origin}${import.meta.env.BASE_URL}?lang=${locale.value}`
  const data = { title: t('meta.title'), text: t('footer.shareText'), url }
  if (navigator.share) {
    try { await navigator.share(data) } catch {}
    return
  }
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {}
}
</script>
