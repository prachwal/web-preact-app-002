/// <reference types="vitest/config" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      // keep in sync with tsconfig.app.json's "paths"
      '@ui': resolve(import.meta.dirname, 'src/ui'),
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        playground: resolve(import.meta.dirname, 'playground.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // e2e/**/*.spec.ts are Playwright visual-regression specs (`npm run
    // test:visual`), not Vitest — exclude them from the default glob.
    exclude: ['**/node_modules/**', 'e2e/**'],
  },
})
