// Generates src/data/profiles.js — 100 fictional Belgian adults spanning the
// full income and wealth distributions (percentiles 0.5 … 99.5, one person per
// percentile). Deterministic: same seed → same 100 people.
//
//   node scripts/generate-profiles.mjs
//
// ── Where the numbers come from ────────────────────────────────────────────
// The anchor points below are illustrative interpolations of published
// Belgian statistics (2023/2024), not microdata:
//
// INCOME (net monthly income per adult, all sources: wages, pensions,
// unemployment/integration benefits, self-employment, capital income):
//  - Statbel, salary statistics 2024: median net full-time salary ≈ €2,550;
//    P10 ≈ €2,000 gross → ~€1,850 net; P90 net ≈ €4,000.
//  - Integration income ("leefloon" / "revenu d'intégration"), single person,
//    2024: ≈ €1,260–1,290/month; cohabitant rate ≈ €860. Unemployment and
//    "inschakelingsuitkering" for a cohabitant: ≈ €550–700.
//  - Income guarantee for the elderly (IGO / GRAPA), single person, 2024:
//    ≈ €1,500/month. That is a floor: no pensioner among the 100 lives on
//    less than ~€1,300, so the lowest percentiles are students, part-timers
//    and jobseekers living with family, not 80-year-olds.
//  - Median pension is well below the median wage (≈ €1,600–1,800 net), and
//    ~20% of adults live mainly on replacement income, which pulls the
//    all-adults median below the workers' median (≈ €2,250 here).
//  - Top: a net wage of €8,000/month already requires a gross package north
//    of €200k/year — roughly the top 1% threshold (Statbel fiscal stats).
//    The *average* inside the top 1% is far higher (dividends, director's
//    fees): our richest person represents that average at ≈ €14,500 net.
//
// WEALTH (net wealth per adult: property + savings + investments − debts):
//  - NBB / ECB Household Finance and Consumption Survey (HFCS), Belgian
//    waves: median household net wealth ≈ €250k; ~30% of households own
//    less than €40k; top 10% own ~55% of total net wealth; top 1%
//    threshold per household ≈ €2.5M+.
//  - Household figures are scaled to per-adult (÷ ~1.7) for a 100-adults
//    illustration.
//  - The richest of our 100 stands for the *average* of the top 1% — the
//    real Belgian top 0.01% (billionaire families) is ~1000× richer still,
//    but a sample of 100 people cannot contain them.
//
// Ages, regions (58 Flanders / 31 Wallonia / 11 Brussels ≈ population
// shares), genders and jobs are drawn to be plausible for each income level;
// wealth rank is correlated with income rank and age (you accumulate wealth
// over a lifetime), which is why some low-income retirees are wealthy and
// some high-earning 25-year-olds own almost nothing. At the very top the two
// coincide: the five highest earners are also the five wealthiest, because
// large fortunes *produce* large incomes (rent, dividends), and because it
// keeps src/data/incomeSources.js consistent — nobody's wealth is assumed to
// yield more than they actually earn.
//
// Job titles are emitted as keys (see src/data/jobs.js) so the interface can
// show them in Dutch, French or English.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// ── deterministic RNG ───────────────────────────────────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
// SEED=123 node scripts/generate-profiles.mjs tries another draw; the default
// was chosen for a balanced age / retiree / region mix.
const SEED = Number(process.env.SEED) || 20260920
const rnd = mulberry32(SEED)
const pick = (arr) => arr[Math.floor(rnd() * arr.length)]

// ── distribution anchors (percentile → value), linear interpolation ────────
const INCOME_ANCHORS = [
  [0, 300], [5, 800], [10, 1200], [20, 1450], [30, 1700], [40, 1950],
  [50, 2250], [60, 2550], [70, 2900], [80, 3350], [90, 4100], [95, 5000],
  [99, 8000], [99.5, 14500], [100, 25000],
]
const WEALTH_ANCHORS = [
  [0, -60000], [1, -25000], [5, -2000], [10, 500], [20, 8000], [30, 35000],
  [40, 85000], [50, 150000], [60, 215000], [70, 300000], [80, 420000],
  [90, 650000], [95, 950000], [99, 2400000], [99.5, 4800000], [100, 8000000],
]

// No pensioner below this net monthly income (IGO/GRAPA floor, see above).
const MIN_PENSIONER_INCOME = 1300

function interpolate(anchors, p) {
  for (let i = 1; i < anchors.length; i++) {
    const [p0, v0] = anchors[i - 1]
    const [p1, v1] = anchors[i]
    if (p <= p1) return v0 + ((p - p0) / (p1 - p0)) * (v1 - v0)
  }
  return anchors[anchors.length - 1][1]
}

const roundIncome = (v) => Math.round(v / 10) * 10
function roundWealth(v) {
  const a = Math.abs(v)
  const step = a < 10000 ? 50 : a < 100000 ? 500 : 1000
  return Math.round(v / step) * step
}

// ── ages, conditioned on income percentile ──────────────────────────────────
const AGE_BANDS = [
  { lo: 18, hi: 24, w: 10.5 }, { lo: 25, hi: 34, w: 16 },
  { lo: 35, hi: 44, w: 16 }, { lo: 45, hi: 54, w: 16.5 },
  { lo: 55, hi: 64, w: 16.5 }, { lo: 65, hi: 74, w: 13.5 },
  { lo: 75, hi: 89, w: 11 },
]
function drawAge(incomePct) {
  const weights = AGE_BANDS.map((b) => {
    let w = b.w
    if (incomePct < 15) {
      // below ≈ €1,300: no pensioners (IGO/GRAPA floor); mostly the young
      if (b.lo >= 65) w = 0
      if (b.lo === 18) w *= 3
    } else if (incomePct < 35) {
      if (b.lo >= 65) w *= 1.4
      if (b.lo === 18) w *= 1.2
    } else if (incomePct > 80) {
      if (b.lo >= 35 && b.hi <= 64) w *= 2.2
      if (b.lo === 18) w *= 0.1
      if (b.lo === 75) w *= 0.5
    }
    return w
  })
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rnd() * total
  for (let i = 0; i < AGE_BANDS.length; i++) {
    r -= weights[i]
    if (r <= 0) {
      const b = AGE_BANDS[i]
      // 18–19-year-olds are only ~2.5% of adults: skew the youngest band
      // towards its older end.
      if (b.lo === 18) return 24 - Math.floor(rnd() * rnd() * 7)
      return b.lo + Math.floor(rnd() * (b.hi - b.lo + 1))
    }
  }
  return 45
}

// ── names (Belgian mix: Dutch, French, Italian/Turkish/Moroccan heritage) ───
// Drawn without replacement so that every one of the 100 has a unique name.
const NAMES = {
  nl: {
    Male: ['Jan', 'Wim', 'Bart', 'Koen', 'Jef', 'Lars', 'Dries', 'Tom', 'Stijn', 'Luc',
      'Wout', 'Robbe', 'Marc', 'Seppe', 'Mehmet', 'Youssef', 'Pieter', 'Jonas', 'Bram',
      'Sander', 'Wannes', 'Geert', 'Dirk', 'Frank', 'Rudi', 'Ludo', 'Kris', 'Steven',
      'Arne', 'Jasper', 'Milan', 'Senne', 'Bilal', 'Emir', 'Tuur', 'Karel', 'Joris',
      'Bert', 'Hans', 'Gert'],
    Female: ['Els', 'An', 'Katrien', 'Lore', 'Femke', 'Lien', 'Tine', 'Greet', 'Ilse',
      'Noor', 'Lotte', 'Mia', 'Rita', 'Sofie', 'Ayşe', 'Yasmina', 'Hanne', 'Marieke',
      'Evi', 'Anke', 'Leen', 'Veerle', 'Hilde', 'Marleen', 'Godelieve', 'Magda',
      'Jolien', 'Fien', 'Lieze', 'Nora', 'Amber', 'Elke', 'Kaat', 'Fatma', 'Zeynep',
      'Inge', 'Griet', 'Ria', 'Christel', 'Jana'],
  },
  fr: {
    Male: ['Olivier', 'Julien', 'Nicolas', 'Michel', 'Pierre', 'Antoine', 'Hugo', 'Théo',
      'Maxime', 'Cédric', 'Louis', 'Marcel', 'Enzo', 'Salvatore', 'Mohamed', 'Karim',
      'Benoît', 'François', 'Jean', 'Philippe', 'Christophe', 'Laurent', 'Sébastien',
      'Adrien', 'Romain', 'Quentin', 'Nathan', 'Lucas', 'Roger', 'André', 'Marco',
      'Ahmed', 'Ilias', 'Yannick', 'Stéphane', 'Fabrice', 'Xavier', 'Arnaud', 'Vincent',
      'Loïc'],
    Female: ['Camille', 'Sophie', 'Isabelle', 'Nathalie', 'Émilie', 'Chantal', 'Monique',
      'Léa', 'Manon', 'Julie', 'Jeanne', 'Colette', 'Giulia', 'Fatima', 'Aïcha',
      'Aurélie', 'Anne', 'Marie', 'Céline', 'Valérie', 'Véronique', 'Sandrine',
      'Catherine', 'Christine', 'Laurence', 'Amandine', 'Charlotte', 'Chloé', 'Clara',
      'Élise', 'Louise', 'Zoé', 'Inès', 'Nadia', 'Samira', 'Francesca', 'Jacqueline',
      'Josiane', 'Martine', 'Pauline'],
  },
  de: { Male: ['Stefan', 'Klaus'], Female: ['Heidi', 'Ursula'] },
}
const usedNames = new Set()
function drawName(pool) {
  const free = pool.filter((n) => !usedNames.has(n))
  const name = pick(free.length ? free : pool)
  usedNames.add(name)
  return name
}

// ── jobs by net-income band (keys → titles in src/data/jobs.js) ─────────────
const JOB_BANDS = [
  { max: 1400, jobs: ['integration_income', 'job_seeker', 'part_time_cleaner', 'job_seeker'] },
  { max: 1800, jobs: ['part_time_retail', 'hairdresser', 'part_time_kitchen', 'temp_worker'] },
  { max: 2200, jobs: ['cashier', 'delivery_driver', 'care_assistant', 'warehouse_worker'] },
  { max: 2600, jobs: ['truck_driver', 'admin_assistant', 'childcare_worker', 'postal_worker', 'bus_driver'] },
  { max: 3000, jobs: ['nurse', 'primary_teacher', 'electrician', 'police_officer', 'train_conductor'] },
  { max: 3500, jobs: ['secondary_teacher', 'accountant', 'REGIONAL_CIVIL_SERVANT', 'lab_technician', 'social_worker'] },
  { max: 4200, jobs: ['it_developer', 'engineer', 'pharmacist', 'federal_civil_servant', 'project_manager'] },
  { max: 5200, jobs: ['senior_engineer', 'plumber_self_employed', 'university_lecturer', 'it_consultant'] },
  { max: 6500, jobs: ['gp', 'lawyer', 'senior_manager', 'architect_self_employed'] },
  { max: 9000, jobs: ['medical_specialist', 'notary', 'company_director', 'mp'] },
  { max: Infinity, jobs: ['company_owner'] },
]
const RETIRED_FORMER = [
  { max: 1500, former: ['factory_worker', 'shop_assistant', 'farm_worker', 'textile_worker'] },
  { max: 2100, former: ['postal_worker', 'nurse', 'mechanic', 'secretary'] },
  { max: 3000, former: ['teacher', 'civil_servant', 'train_driver', 'bank_clerk'] },
  { max: Infinity, former: ['company_manager', 'doctor', 'notary', 'senior_civil_servant'] },
]
const CIVIL_SERVANT = {
  Flanders: 'civil_servant_fl',
  Wallonia: 'civil_servant_wa',
  Brussels: 'civil_servant_bxl',
}

function assignWork(age, income, incomePct, region) {
  const canRetire = income >= MIN_PENSIONER_INCOME
  if (canRetire && (age >= 66 || (age >= 60 && rnd() < 0.5))) {
    const band = RETIRED_FORMER.find((b) => income <= b.max)
    return { status: 'retired', job: 'retired', former: pick(band.former) }
  }
  if (age <= 24 && incomePct < 22) {
    return { status: 'student', job: rnd() < 0.6 ? 'student_job' : 'student' }
  }
  if (incomePct < 9) {
    // Below ≈ €800 hardly any benefit fits: these are mostly adults without
    // an income of their own (a partner at home) or on cohabitant rates.
    if (income < 800) {
      return { status: 'inactive', job: rnd() < 0.6 ? 'homemaker' : 'job_seeker_cohabiting' }
    }
    // Below ≈ €1,000 only the cohabitant benefit rates fit: living with
    // parents or a partner.
    if (income < 1000) {
      return {
        status: 'unemployed',
        job: rnd() < 0.5 ? 'job_seeker_cohabiting' : 'integration_income_cohabiting',
      }
    }
    return { status: 'unemployed', job: rnd() < 0.5 ? 'job_seeker' : 'integration_income' }
  }
  const band = JOB_BANDS.find((b) => income <= b.max)
  let job = pick(band.jobs)
  if (job === 'REGIONAL_CIVIL_SERVANT') job = CIVIL_SERVANT[region]
  if (job === 'job_seeker' || job === 'integration_income') {
    return { status: 'unemployed', job }
  }
  return { status: 'working', job }
}

function homesOwned(wealthPct) {
  if (wealthPct < 28) return 0                    // ~29% of Belgians rent
  if (wealthPct < 40) return rnd() < 0.5 ? 1 : 0
  if (wealthPct < 86) return 1
  if (wealthPct < 96) return rnd() < 0.4 ? 2 : 1
  return rnd() < 0.5 ? 3 : 2
}

// ── build the 100 ───────────────────────────────────────────────────────────
// Regions: 58 Flanders, 31 Wallonia, 11 Brussels; genders: 51 F / 49 M.
function shuffled(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const regions = shuffled([
  ...Array(58).fill('Flanders'), ...Array(31).fill('Wallonia'), ...Array(11).fill('Brussels'),
])
const genders = shuffled([...Array(51).fill('Female'), ...Array(49).fill('Male')])

const people = []
for (let i = 1; i <= 100; i++) {
  const incomePercentile = i - 0.5
  const age = drawAge(incomePercentile)
  people.push({ id: i, incomePercentile, age, region: regions[i - 1], gender: genders[i - 1] })
}

// Wealth rank: correlated with income rank (0.55) and age (0.30) + noise —
// a permutation of 1..100 so the full wealth distribution is represented.
const ageRank = new Map(
  [...people].sort((a, b) => a.age - b.age || a.id - b.id).map((p, idx) => [p.id, idx + 1]),
)
const wealthScore = people.map((p) => ({
  id: p.id,
  score: p.id * 0.55 + ageRank.get(p.id) * 0.30 + rnd() * 100 * 0.15,
}))
wealthScore.sort((a, b) => a.score - b.score)
const wealthRank = new Map(wealthScore.map((s, idx) => [s.id, idx + 1]))

function moveToRank(id, rank) {
  const holder = [...wealthRank].find(([, r]) => r === rank)[0]
  const old = wealthRank.get(id)
  wealthRank.set(id, rank)
  wealthRank.set(holder, old)
}

// The very top: the five highest earners hold the five largest fortunes, in
// the same order (see header). Below them the age/income mix takes over.
for (let id = 96; id <= 100; id++) moveToRank(id, id)

// Deeply negative wealth (bottom ranks) means real debt — implausible for
// under-25s, who simply own ~nothing yet. Swap those ranks upward to an
// older person from the lower-middle ranks.
const ageOf = new Map(people.map((p) => [p.id, p.age]))
for (const [id, rank] of [...wealthRank]) {
  if (rank <= 4 && ageOf.get(id) < 25) {
    const swapWith = [...wealthRank].find(
      ([oid, orank]) => orank > 4 && orank <= 25 && ageOf.get(oid) >= 28,
    )
    if (swapWith) {
      wealthRank.set(id, swapWith[1])
      wealthRank.set(swapWith[0], rank)
    }
  }
}

const germanSpeakerId = people.filter((p) => p.region === 'Wallonia')[3].id

const profiles = people.map((p) => {
  const income = roundIncome(interpolate(INCOME_ANCHORS, p.incomePercentile))
  const wealthPercentile = wealthRank.get(p.id) - 0.5
  const wealth = roundWealth(interpolate(WEALTH_ANCHORS, wealthPercentile))
  const language =
    p.id === germanSpeakerId ? 'German'
    : p.region === 'Flanders' ? 'Dutch'
    : p.region === 'Brussels' ? (rnd() < 0.8 ? 'French' : 'Dutch')
    : 'French'
  const namePool = NAMES[language === 'German' ? 'de' : language === 'Dutch' ? 'nl' : 'fr'][p.gender]
  const work = assignWork(p.age, income, p.incomePercentile, p.region)
  return {
    id: p.id,
    name: drawName(namePool),
    demographics: { age: p.age, gender: p.gender, region: p.region, language },
    work,
    economics: {
      netMonthlyIncome: income,
      netWealth: wealth,
      incomePercentile: p.incomePercentile,
      wealthPercentile,
      homesOwned: homesOwned(wealthPercentile),
    },
  }
})

const header = `// 100 fictional Belgian adults — one per income percentile (0.5 … 99.5),
// so the full distribution is represented, including the top 1%.
//
// GENERATED by scripts/generate-profiles.mjs — do not edit by hand;
// re-run \`node scripts/generate-profiles.mjs\` instead. Sources and method
// are documented in that script (Statbel salary/fiscal statistics 2024,
// NBB/ECB Household Finance and Consumption Survey). Values are illustrative
// interpolations of published aggregates, not real microdata.
//
// work.job (and work.former for pensioners) are keys into src/data/jobs.js,
// which holds the Dutch, French and English titles.
`

const out = `${header}
export const profiles = ${JSON.stringify(profiles, null, 2)};
`
const root = dirname(dirname(fileURLToPath(import.meta.url)))
const target = join(root, 'src', 'data', 'profiles.js')
writeFileSync(target, out, 'utf8')
console.log(`Wrote ${target} (${profiles.length} profiles)`)
