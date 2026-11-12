import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const guidesMetaSrc = resolve(rootDir, 'src/data/guides-meta.json')

/** Copy guides SEO source into dist so FastAPI can inject per-guide OG meta. */
function emitGuidesMeta(): Plugin {
  return {
    name: 'emit-guides-meta',
    writeBundle(outputOptions) {
      const outDir = outputOptions.dir ?? resolve(rootDir, 'dist')
      mkdirSync(outDir, { recursive: true })
      copyFileSync(guidesMetaSrc, resolve(outDir, 'guides-meta.json'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    emitGuidesMeta(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
