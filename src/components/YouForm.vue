<template>
  <section id="you" class="card scroll-mt-6 p-5 md:p-8" aria-labelledby="you-heading">
    <h2 id="you-heading" class="text-3xl md:text-4xl">{{ t('you.heading') }}</h2>
    <p class="mt-1 text-muted">{{ t('you.intro') }}</p>

    <div class="mt-6 grid gap-8 md:grid-cols-2 md:gap-10">
      <!-- step 1: two guesses -->
      <div>
        <p class="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
          <span class="step-badge">1</span>{{ t('you.step1') }}
        </p>
        <p class="mt-2 text-sm text-muted">{{ t('you.guessLabel') }}</p>

        <div class="mt-4 space-y-6">
          <div>
            <label for="you-guess-income" class="block text-sm font-bold text-ink">{{ t('you.guessIncome') }}</label>
            <input
              id="you-guess-income"
              type="range" min="0" max="100" step="1"
              class="slider mt-3"
              :value="guessIncome"
              :aria-valuetext="t('you.guessValue', { n: guessIncome })"
              @input="$emit('update:guessIncome', Number($event.target.value))"
            />
            <div class="mt-1 flex justify-between text-[11px] font-bold uppercase tracking-wider text-faint" aria-hidden="true">
              <span>0</span><span>50</span><span>100</span>
            </div>
            <p class="mt-1.5 text-sm font-bold text-ink" aria-live="polite">{{ t('you.guessValue', { n: guessIncome }) }}</p>
          </div>
          <div>
            <label for="you-guess-wealth" class="block text-sm font-bold text-ink">{{ t('you.guessWealth') }}</label>
            <input
              id="you-guess-wealth"
              type="range" min="0" max="100" step="1"
              class="slider mt-3"
              :value="guessWealth"
              :aria-valuetext="t('you.guessValue', { n: guessWealth })"
              @input="$emit('update:guessWealth', Number($event.target.value))"
            />
            <div class="mt-1 flex justify-between text-[11px] font-bold uppercase tracking-wider text-faint" aria-hidden="true">
              <span>0</span><span>50</span><span>100</span>
            </div>
            <p class="mt-1.5 text-sm font-bold text-ink" aria-live="polite">{{ t('you.guessValue', { n: guessWealth }) }}</p>
          </div>
        </div>
      </div>

      <!-- step 2: the numbers -->
      <div>
        <p class="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
          <span class="step-badge">2</span>{{ t('you.step2') }}
        </p>
        <p class="mt-1 text-sm text-muted">🔒 {{ t('you.privacy') }}</p>

        <div class="mt-3 space-y-4">
          <!-- income -->
          <div>
            <label for="you-income" class="block text-sm font-bold text-ink">{{ t('you.income') }}</label>
            <span class="relative mt-1 block">
              <input
                id="you-income"
                type="number" min="0" step="50" inputmode="numeric"
                class="field pr-8"
                :placeholder="t('you.placeholderIncome')"
                :value="income ?? ''"
                @input="onNumber('update:income', $event)"
              />
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">€</span>
            </span>
            <p class="mt-1 text-xs text-muted">{{ t('you.incomeHint') }}</p>
            <button
              type="button"
              class="mt-1 text-xs font-bold text-accent underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              :aria-expanded="showIncomeHelp"
              @click="showIncomeHelp = !showIncomeHelp"
            >{{ showIncomeHelp ? t('you.helpClose') : t('you.helpToggle') }}</button>
            <SumHelper
              v-if="showIncomeHelp"
              v-model:values="incomeValues"
              :fields="incomeFields"
              :note="t('you.incomeHelp.note')"
              :total-label="t('you.incomeHelp.total', { amount: fmtEur(incomeTotal ?? 0, locale) })"
            />
          </div>

          <!-- of which from wealth -->
          <div>
            <label for="you-capital" class="block text-sm font-bold text-ink">{{ t('you.capital') }}</label>
            <span class="relative mt-1 block">
              <input
                id="you-capital"
                type="number" min="0" step="50" inputmode="numeric"
                class="field pr-8"
                :placeholder="t('you.placeholderCapital')"
                :value="capital ?? ''"
                @input="onNumber('update:capital', $event)"
              />
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">€</span>
            </span>
            <p class="mt-1 text-xs text-muted">{{ t('you.capitalHint') }}</p>
          </div>

          <!-- wealth -->
          <div>
            <label for="you-wealth" class="block text-sm font-bold text-ink">{{ t('you.wealth') }}</label>
            <span class="relative mt-1 block">
              <input
                id="you-wealth"
                type="number" step="1000" inputmode="numeric"
                class="field pr-8"
                :placeholder="t('you.placeholderWealth')"
                :value="wealth ?? ''"
                @input="onNumber('update:wealth', $event)"
              />
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">€</span>
            </span>
            <p class="mt-1 text-xs text-muted">{{ t('you.wealthHint') }}</p>
            <button
              type="button"
              class="mt-1 text-xs font-bold text-accent underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              :aria-expanded="showWealthHelp"
              @click="showWealthHelp = !showWealthHelp"
            >{{ showWealthHelp ? t('you.helpClose') : t('you.helpToggle') }}</button>
            <SumHelper
              v-if="showWealthHelp"
              v-model:values="wealthValues"
              v-model:shared="wealthShared"
              :fields="wealthFields"
              :shared-label="t('you.wealthHelp.shared')"
              :note="t('you.wealthHelp.note')"
              :total-label="t('you.wealthHelp.total', { amount: fmtEur(wealthTotal ?? 0, locale) })"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- the answer -->
    <div v-if="result" class="mt-8 rounded-3xl bg-accent-soft p-5 md:p-7" aria-live="polite">
      <div class="grid gap-6 sm:grid-cols-2">
        <div v-for="b in blocks" :key="b.key">
          <div class="text-xs font-bold uppercase tracking-wider text-muted">{{ t(`you.big.${b.key}`) }}</div>
          <div class="font-display text-5xl font-extrabold leading-none text-ink md:text-6xl">
            {{ b.rank }}<span class="text-2xl text-muted">/100</span>
          </div>
          <p class="mt-2 text-base leading-relaxed text-ink">{{ b.text }}</p>
        </div>
      </div>
      <p v-if="result.capitalText" class="mt-4 max-w-3xl text-base leading-relaxed text-ink">{{ result.capitalText }}</p>
      <PositionStrip class="mt-6 max-w-3xl" :rows="stripRows" />
      <p class="mt-3 text-sm text-muted">{{ t('you.seeParade') }}</p>
      <a href="#parade" class="btn mt-4">{{ t('you.meetThem') }}</a>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import PositionStrip from './PositionStrip.vue'
import SumHelper from './SumHelper.vue'
import { t, locale } from '../i18n'
import { fmtEur } from '../utils/format'

const props = defineProps({
  guessIncome: { type: Number, default: 50 },
  guessWealth: { type: Number, default: 50 },
  income: { type: Number, default: null },
  capital: { type: Number, default: null }, // monthly income from wealth
  wealth: { type: Number, default: null },
  // { income: { key, rank, guess, text } | null, wealth: {...} | null, capitalText } from the parent, or null
  result: { type: Object, default: null },
})
const emit = defineEmits(['update:guessIncome', 'update:guessWealth', 'update:income', 'update:capital', 'update:wealth'])

const blocks = computed(() => [props.result?.income, props.result?.wealth].filter(Boolean))
const stripRows = computed(() => blocks.value.map((b) => ({ key: b.key, guess: b.guess, actual: b.rank })))

function onNumber(event, e) {
  const raw = e.target.value
  if (raw === '') return emit(event, null)
  const n = Number(raw)
  emit(event, Number.isFinite(n) ? n : null)
}

// ── "help me add it up" calculators ─────────────────────────────────────────
const showIncomeHelp = ref(false)
const showWealthHelp = ref(false)

const INCOME_KEYS = ['salary', 'thirteenth', 'holiday', 'bonus', 'vouchers', 'other', 'capital']
const WEALTH_KEYS = ['home', 'mortgage', 'savings', 'investments', 'otherProperty', 'debts']
const YEARLY = new Set(['thirteenth', 'holiday', 'bonus'])

const incomeFields = computed(() =>
  INCOME_KEYS.map((key) => ({ key, label: t(`you.incomeHelp.${key}`), step: 10 })),
)
const wealthFields = computed(() =>
  WEALTH_KEYS.map((key) => ({ key, label: t(`you.wealthHelp.${key}`), step: 1000 })),
)

const incomeValues = ref(Object.fromEntries(INCOME_KEYS.map((k) => [k, null])))
const wealthValues = ref(Object.fromEntries(WEALTH_KEYS.map((k) => [k, null])))
const wealthShared = ref(false)

const anyFilled = (obj) => Object.values(obj).some((v) => v != null)

const incomeTotal = computed(() => {
  const v = incomeValues.value
  if (!anyFilled(v)) return null
  let total = 0
  for (const key of INCOME_KEYS) total += (v[key] ?? 0) / (YEARLY.has(key) ? 12 : 1)
  return Math.round(total)
})
const wealthTotal = computed(() => {
  const v = wealthValues.value
  if (!anyFilled(v)) return null
  const net =
    (v.home ?? 0) - (v.mortgage ?? 0) + (v.savings ?? 0) + (v.investments ?? 0) +
    (v.otherProperty ?? 0) - (v.debts ?? 0)
  return Math.round(wealthShared.value ? net / 2 : net)
})

// the calculators fill in the main fields as you type
watch(incomeTotal, (total) => {
  if (total == null) return
  emit('update:income', total)
  if (incomeValues.value.capital != null) emit('update:capital', Math.round(incomeValues.value.capital))
})
watch(wealthTotal, (total) => {
  if (total != null) emit('update:wealth', total)
})
</script>
