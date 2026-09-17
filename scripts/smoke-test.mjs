// Server-renders the whole page and the person card in Dutch, French and
// English to catch template errors, untranslated keys and "undefined"s
// without a browser. Exit code 1 on any problem.
//
//   node scripts/smoke-test.mjs

import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { createServer } from 'vite'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createRouter, createMemoryHistory } from 'vue-router'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const server = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

const KEY_LEAK = /\b(?:you|parade|person|stats|why|table|method|footer|hero|nav|meta|regions|languages|genders|lifestyle)\.[a-zA-Z]+(?:\.[a-zA-Z]+)*\b/g
const BAD = /undefined|\[object Object\]|NaN/

let failed = false
const fail = (msg) => { failed = true; console.log('   ✗', msg) }

try {
  const { default: App } = await server.ssrLoadModule('/src/App.vue')
  const { default: HomeView } = await server.ssrLoadModule('/src/views/HomeView.vue')
  const { default: PersonCard } = await server.ssrLoadModule('/src/components/PersonCard.vue')
  const { default: YouForm } = await server.ssrLoadModule('/src/components/YouForm.vue')
  const { profiles } = await server.ssrLoadModule('/src/data/profiles.js')
  const i18n = await server.ssrLoadModule('/src/i18n/index.js')

  const byWealth = [...profiles].sort((a, b) => a.economics.netWealth - b.economics.netWealth)
  const samples = [
    byWealth[0], byWealth[50], byWealth[99],
    profiles.find((p) => p.work.job === 'retired'),
    profiles.find((p) => p.work.status === 'student'),
  ].filter(Boolean)

  for (const lang of ['nl', 'fr', 'en']) {
    i18n.locale.value = lang

    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: HomeView }] })
    const app = createSSRApp(App)
    app.use(router)
    await router.push('/?view=income')
    await router.isReady()
    const html = await renderToString(app)
    const rows = (html.match(/<tr/g) || []).length - 1
    const leaks = [...new Set(html.match(KEY_LEAK) || [])]
    console.log(`[${lang}] page: ${html.length} chars, ${rows} table rows`)
    if (rows !== 100) fail(`expected 100 table rows, got ${rows}`)
    if (leaks.length) fail(`untranslated keys: ${leaks.slice(0, 15).join(', ')}`)
    if (BAD.test(html)) fail(`page contains undefined/NaN: ${html.match(/.{40}(?:undefined|\[object Object\]|NaN).{40}/g)?.slice(0, 3).join(' || ')}`)

    for (const p of samples) {
      const card = await renderToString(createSSRApp({ render: () => h(PersonCard, { person: p, incomeRank: 10, wealthRank: 20 }) }))
      const l2 = [...new Set(card.match(KEY_LEAK) || [])]
      if (l2.length || BAD.test(card)) fail(`card for ${p.name}: leaks=${l2.join(',')} bad=${BAD.test(card)}`)
    }
    const form = await renderToString(createSSRApp({
      render: () => h(YouForm, {
        guessIncome: 40, guessWealth: 60, income: 2400, capital: 150, wealth: 180000,
        result: {
          income: { key: 'income', rank: 55, guess: 40, text: 'a' },
          wealth: { key: 'wealth', rank: 60, guess: 60, text: 'b' },
          capitalText: 'c',
        },
      }),
    }))
    if (KEY_LEAK.test(form) || BAD.test(form)) fail('form has untranslated keys or undefined')

    const jobCells = [...new Set(html.match(/<td class="p-3 text-ink">([^<]+)<\/td>/g) || [])]
      .map((s) => s.replace(/<[^>]+>/g, '')).slice(0, 5)
    console.log('   sample jobs:', jobCells.join(' | '))
  }
} finally {
  await server.close()
}
console.log(failed ? 'SMOKE TEST: FAILED' : 'SMOKE TEST: OK')
process.exit(failed ? 1 : 0)
