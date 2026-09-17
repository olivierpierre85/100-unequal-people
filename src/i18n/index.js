// Tiny i18n: a reactive locale + a `t()` lookup over the message files.
// Locale is chosen from ?lang=, then localStorage, then the browser language
// (Dutch or French for Belgians, English otherwise).

import { ref, watch } from 'vue'
import en from './messages/en.js'
import nl from './messages/nl.js'
import fr from './messages/fr.js'

export const LOCALES = ['nl', 'fr', 'en']
const messages = { en, nl, fr }

const hasWindow = typeof window !== 'undefined'

function detect() {
  try {
    const q = new URLSearchParams(window.location.search).get('lang')
    if (LOCALES.includes(q)) return q
  } catch {}
  try {
    const s = localStorage.getItem('lang')
    if (LOCALES.includes(s)) return s
  } catch {}
  try {
    for (const l of navigator.languages ?? [navigator.language]) {
      const p = String(l).slice(0, 2).toLowerCase()
      if (p === 'nl' || p === 'fr') return p
    }
  } catch {}
  return 'en'
}

export const locale = ref(hasWindow ? detect() : 'en')

export function setLocale(l) {
  if (!LOCALES.includes(l) || l === locale.value) return
  locale.value = l
  try { localStorage.setItem('lang', l) } catch {}
  try {
    const url = new URL(window.location.href)
    url.searchParams.set('lang', l)
    history.replaceState(history.state, '', url)
  } catch {}
}

function lookup(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
}

/** Translate a dotted key; `{name}` placeholders are filled from params. */
export function t(key, params) {
  let v = lookup(messages[locale.value], key)
  if (v === undefined) v = lookup(messages.en, key)
  if (v === undefined) return key
  if (typeof v !== 'string') return v
  if (params) {
    for (const [k, val] of Object.entries(params)) v = v.split(`{${k}}`).join(String(val))
  }
  return v
}

export function langName(l) {
  return messages[l]?.langName ?? l
}

if (typeof document !== 'undefined') {
  watch(
    locale,
    (l) => {
      document.documentElement.lang = l
      document.title = t('meta.title')
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', t('meta.description'))
      const og = document.querySelector('meta[property="og:description"]')
      if (og) og.setAttribute('content', t('meta.description'))
    },
    { immediate: true },
  )
}
