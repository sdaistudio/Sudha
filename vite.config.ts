/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `base` is configurable so the site can be hosted under any sub-path:
//   SUDHA_BASE=/sudha/ npm run build
export default defineConfig({
  base: process.env.SUDHA_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  server: {
    // The project lives in iCloud Drive; keep the watcher away from synced build/dependency folders.
    watch: { ignored: ['**/node_modules.nosync/**', '**/dist/**'] },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: false,
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
