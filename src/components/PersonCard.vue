<template>
  <article class="card p-5 md:p-6" :aria-label="`${person.name}, ${person.demographics.age}`">
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-start gap-4">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-3xl" aria-hidden="true">
          {{ jobEmoji(person) }}
        </div>
        <div>
          <h3 class="text-2xl text-ink md:text-3xl">{{ person.name }}, {{ person.demographics.age }}</h3>
          <p class="mt-0.5 font-bold text-ink">{{ jobTitle(person, locale) }}</p>
          <p class="mt-0.5 text-sm text-muted">
            {{ t(`regions.${person.demographics.region}`) }} ·
            {{ t('person.speaks', { language: t(`languages.${person.demographics.language}`) }) }}
          </p>
        </div>
      </div>
      <button type="button" class="btn !px-2.5" :aria-label="t('person.close')" @click="$emit('close')">✕</button>
    </div>

    <dl class="mt-5 grid grid-cols-2 gap-4">
      <div>
        <dt class="text-xs font-bold uppercase tracking-wider text-muted">{{ t('parade.tipIncome') }}</dt>
        <dd class="mt-0.5 font-display text-2xl font-extrabold text-ink tabular">
          {{ fmtEur(person.economics.netMonthlyIncome, locale) }}
          <span class="font-sans text-xs font-normal text-muted">{{ t('parade.perMonth') }}</span>
        </dd>
      </div>
      <div>
        <dt class="text-xs font-bold uppercase tracking-wider text-muted">{{ t('parade.tipWealth') }}</dt>
        <dd class="mt-0.5 font-display text-2xl font-extrabold tabular" :class="person.economics.netWealth < 0 ? 'text-neg' : 'text-ink'">
          {{ fmtEur(person.economics.netWealth, locale) }}
        </dd>
      </div>
    </dl>
    <p class="mt-2 text-sm text-muted">{{ t('person.rank', { income: incomeRank, wealth: wealthRank }) }}</p>

    <!-- where the income comes from -->
    <div class="mt-5">
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs text-muted">
        <span>{{ t('person.sourcesTitle', { amount: fmtEur(sources.total, locale) }) }}</span>
        <span v-if="sources.fromWealth > 0" class="font-bold text-ink tabular">
          {{ t('person.sourcesSplit', { work: fmtEur(sources.fromWork, locale), capital: fmtEur(sources.fromWealth, locale), share: sharePct }) }}
        </span>
        <span v-else class="font-bold text-ink">{{ t('person.sourcesAllWork') }}</span>
      </div>
      <div
        class="mt-1.5 flex h-3 w-full overflow-hidden rounded-full bg-rule"
        role="img" :aria-label="t('person.sourcesAria', { share: sharePct })"
      >
        <div class="h-full bg-accent" :style="{ width: `${100 - sharePct}%` }"></div>
        <div class="h-full bg-capital" :style="{ width: `${sharePct}%` }"></div>
      </div>
    </div>

    <!-- the everyday comparisons -->
    <dl class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="item in items" :key="item.key" class="rounded-2xl bg-paper p-3">
        <dt class="text-xs font-bold uppercase tracking-wider text-muted">
          <span aria-hidden="true">{{ item.icon }}</span> {{ item.label }}
        </dt>
        <dd class="mt-1 text-sm leading-snug text-ink">{{ item.text }}</dd>
      </div>
    </dl>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { incomeSources } from '../data/incomeSources'
import { lifestyle } from '../data/lifestyle'
import { jobTitle, jobEmoji } from '../data/jobs'
import { t, locale } from '../i18n'
import { fmtEur } from '../utils/format'

const props = defineProps({
  person: { type: Object, required: true },
  incomeRank: { type: Number, required: true }, // people earning less
  wealthRank: { type: Number, required: true }, // people owning less
})
defineEmits(['close'])

const sources = computed(() => incomeSources(props.person))
const sharePct = computed(() => Math.round(sources.value.share * 100))

const META = [
  ['housing', '🏠'],
  ['holidays', '✈️'],
  ['restaurants', '🍽️'],
  ['smartphone', '📱'],
  ['concert', '🎤'],
]
const items = computed(() => {
  const l = lifestyle(props.person)
  return META.map(([key, icon]) => ({
    key,
    icon,
    label: t(`person.lifestyle.${key}`),
    text: key === 'housing' ? t(`lifestyle.housing.${l.housing}`) : t(`lifestyle.${key}`)[l[key]],
  }))
})
</script>
