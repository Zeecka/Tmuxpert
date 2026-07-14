import { defineConfig } from 'vitest/config'

// The tmux engine is pure TypeScript (no DOM), so tests run in a plain node
// environment — no jsdom, no setup shims needed.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
