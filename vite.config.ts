import path from 'node:path'
import { existsSync } from 'node:fs'
import { rename, rm } from 'node:fs/promises'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import cesiumPlugin from 'vite-plugin-cesium'

const cesium = cesiumPlugin as unknown as () => Plugin

/**
 * vite-plugin-cesium copies assets to dist/Maptrip/cesium when base=/Maptrip/,
 * but GitHub Pages serves /Maptrip/cesium/* from dist/cesium/* on gh-pages.
 */
function fixCesiumForGitHubPages(): Plugin {
  return {
    name: 'fix-cesium-gh-pages',
    apply: 'build',
    closeBundle: {
      order: 'post',
      async handler() {
        const base = process.env.BASE_PATH ?? '/'
        if (base !== '/Maptrip/') return

        const distDir = path.resolve('dist')
        const nested = path.join(distDir, 'Maptrip', 'cesium')
        const target = path.join(distDir, 'cesium')

        if (!existsSync(nested)) return

        if (existsSync(target)) {
          await rm(target, { recursive: true })
        }

        await rename(nested, target)

        const mapTripDir = path.join(distDir, 'Maptrip')
        if (existsSync(mapTripDir)) {
          await rm(mapTripDir, { recursive: true })
        }
      },
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const base = process.env.BASE_PATH ?? '/'
        if (base !== '/Maptrip/') return html

        const cesiumBaseScript = `<script>window.CESIUM_BASE_URL = '${base}cesium/';</script>`
        if (html.includes('CESIUM_BASE_URL')) return html

        return html.replace(
          /(<script src="[^"]*cesium\/Cesium\.js"><\/script>)/,
          `${cesiumBaseScript}\n    $1`,
        )
      },
    },
  }
}

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), cesium(), fixCesiumForGitHubPages()],
})
