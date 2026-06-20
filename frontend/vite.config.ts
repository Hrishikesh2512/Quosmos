/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Coverage targets the pure logic layer (quantum engine, stores, content).
      // UI components are validated via smoke tests rather than line coverage.
      include: ['src/quantum/**/*.ts', 'src/store/**/*.ts', 'src/content/challenges.ts'],
      // Barrels and pure-data modules carry no logic to cover.
      exclude: ['src/**/*.d.ts', 'src/**/__tests__/**', 'src/quantum/index.ts'],
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 90,
        lines: 90,
      },
    },
  },
});
