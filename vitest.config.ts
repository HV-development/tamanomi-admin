import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '__tests__/**',
      ],
      thresholds: {
        global: {
          branches: 40,
          functions: 30,
          lines: 40,
          statements: 40,
        },
      },
    },
    include: ['__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules/', '.next/', 'coverage/', '**/*.d.ts', '**/*.config.{js,ts}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
