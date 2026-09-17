// One place for money formatting, so every page shows amounts the same way
// and in the visitor's language: "€ 4.800.000" (nl), "4 800 000 €" (fr),
// "€4,800,000" (en).

const INTL = { en: 'en-IE', nl: 'nl-BE', fr: 'fr-BE' }
const cache = new Map()

function currency(locale) {
  const key = INTL[locale] ?? INTL.en
  if (!cache.has(key)) {
    cache.set(
      key,
      new Intl.NumberFormat(key, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
    )
  }
  return cache.get(key)
}

export function fmtEur(value, locale = 'en') {
  return currency(locale).format(value)
}

export function fmtInt(value, locale = 'en') {
  return new Intl.NumberFormat(INTL[locale] ?? INTL.en, { maximumFractionDigits: 0 }).format(value)
}

/** Short axis labels: €1.2 M, €650k, €0. */
export function fmtCompact(value, locale = 'en') {
  const abs = Math.abs(value)
  const num = (x, digits) =>
    x.toLocaleString(INTL[locale] ?? INTL.en, { maximumFractionDigits: digits })
  let s
  if (abs >= 1e6) s = `${num(value / 1e6, 1)} M`
  else if (abs >= 1e3) s = `${num(value / 1e3, 0)}k`
  else s = num(value, 0)
  return locale === 'fr' ? `${s} €` : `€${s}`
}
