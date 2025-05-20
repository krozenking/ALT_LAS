import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['./src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{git,cache}/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/main.tsx',
        '**/vite-env.d.ts',
        '**/types/**'
      ]
    },
    alias: {
      '@': resolve(__dirname, './src')
    },
    deps: {
      inline: ['@chakra-ui/react']
    },
    reporters: ['default', 'html'],
    outputFile: {
      html: './test-results/index.html',
    },
    watch: false,
    testTimeout: 10000,
    maxConcurrency: 5,
    maxWorkers: 2,
    minWorkers: 1,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
