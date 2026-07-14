import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import cesiumPlugin from 'vite-plugin-cesium'

const cesium = cesiumPlugin as unknown as () => Plugin

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), cesium()],
})
