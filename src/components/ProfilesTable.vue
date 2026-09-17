<template>
  <div class="card overflow-x-auto">
    <table class="w-full border-collapse text-left text-sm">
      <thead>
        <tr class="border-b border-rule text-xs uppercase tracking-wider text-muted">
          <th scope="col" class="p-3 font-medium">{{ t('table.rank') }}</th>
          <th scope="col" class="p-3 font-medium">{{ t('table.person') }}</th>
          <th scope="col" class="p-3 font-medium">{{ t('table.job') }}</th>
          <th scope="col" class="p-3 font-medium">{{ t('table.region') }}</th>
          <th scope="col" class="p-3 text-right font-medium" :aria-sort="metric === 'income' ? 'descending' : 'none'">
            <button type="button" class="whitespace-nowrap uppercase tracking-wider hover:text-ink" @click="$emit('update:metric', 'income')">
              {{ t('table.income') }}<span v-if="metric === 'income'" aria-hidden="true"> ▼</span>
            </button>
          </th>
          <th scope="col" class="p-3 text-right font-medium" :aria-sort="metric === 'wealth' ? 'descending' : 'none'">
            <button type="button" class="whitespace-nowrap uppercase tracking-wider hover:text-ink" @click="$emit('update:metric', 'wealth')">
              {{ t('table.wealth') }}<span v-if="metric === 'wealth'" aria-hidden="true"> ▼</span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-rule">
        <tr
          v-for="(person, index) in people"
          :key="person.id"
          tabindex="0"
          class="cursor-pointer transition-colors focus:outline-none focus-visible:bg-accent-soft"
          :class="person.id === pinnedId ? 'bg-accent-soft' : 'hover:bg-paper'"
          :aria-selected="person.id === pinnedId"
          @click="toggle(person.id)"
          @keydown.enter.prevent="toggle(person.id)"
          @keydown.space.prevent="toggle(person.id)"
        >
          <td class="p-3 text-faint tabular">{{ index + 1 }}</td>
          <td class="p-3">
            <div class="font-bold text-ink">
              <span aria-hidden="true">{{ jobEmoji(person) }}</span> {{ person.name }}, {{ person.demographics.age }}
            </div>
            <div class="text-xs text-muted">
              {{ t(`genders.${person.demographics.gender}`) }} · {{ t(`languages.${person.demographics.language}`) }}
            </div>
          </td>
          <td class="p-3 text-ink">{{ jobTitle(person, locale) }}</td>
          <td class="p-3">
            <span class="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-muted">
              <span class="h-2 w-2 rounded-full" :style="{ background: REGION_DOT[person.demographics.region] }"></span>
              {{ t(`regions.${person.demographics.region}`) }}
            </span>
          </td>
          <td class="p-3 text-right tabular" :class="metric === 'income' ? 'font-semibold text-ink' : 'text-muted'">
            {{ fmtEur(person.economics.netMonthlyIncome, locale) }}
            <div v-if="shareOf(person) >= 5" class="text-xs font-normal text-capital">
              {{ t('table.fromWealth', { pct: shareOf(person) }) }}
            </div>
          </td>
          <td
            class="p-3 text-right tabular"
            :class="[
              metric === 'wealth' ? 'font-semibold' : '',
              person.economics.netWealth < 0 ? 'text-neg' : metric === 'wealth' ? 'text-ink' : 'text-muted',
            ]"
          >
            {{ fmtEur(person.economics.netWealth, locale) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { incomeSources } from '../data/incomeSources'
import { jobTitle, jobEmoji } from '../data/jobs'
import { t, locale } from '../i18n'
import { fmtEur } from '../utils/format'

const props = defineProps({
  people: { type: Array, required: true }, // already sorted by the parent
  metric: { type: String, default: 'wealth' },
  pinnedId: { type: Number, default: null },
})
const emit = defineEmits(['update:pinnedId', 'update:metric'])

// Flag colours as a small dot, so the region column reads at a glance
// without turning the table into a rainbow.
const REGION_DOT = { Flanders: '#ffb000', Wallonia: '#e5484d', Brussels: '#5b4bff' }

const shareOf = (p) => Math.round(incomeSources(p).share * 100)

function toggle(id) {
  emit('update:pinnedId', props.pinnedId === id ? null : id)
}
</script>
