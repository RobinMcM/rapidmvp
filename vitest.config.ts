import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/repository/**'],
      exclude: ['src/lib/repository/__tests__/**'],
      thresholds: { branches: 90 },
    },
  },
})
