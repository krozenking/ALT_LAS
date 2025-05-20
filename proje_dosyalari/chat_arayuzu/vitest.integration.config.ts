import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.integration.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist', 'cypress'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/integration',
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/index.{js,ts}',
        '**/*.{test,spec}.{js,jsx,ts,tsx}',
      ],
    },
    reporters: ['default', 'json'],
    outputFile: {
      json: './reports/integration/results.json',
    },
  },
});
