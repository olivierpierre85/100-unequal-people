import { copyFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages serves 404.html for unknown paths. A copy of index.html lets
// the client-side router handle deep links (old /profiles URLs, a shared
// link after a refresh) instead of showing a dead page.
function spaFallback() {
  let outDir = 'dist'
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = join(config.root, config.build.outDir)
    },
    closeBundle() {
      copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), spaFallback()],
  base: process.env.GITHUB_ACTIONS ? '/100-unequal-people/' : '/',
})
