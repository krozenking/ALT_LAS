import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    // setupFiles: './tests/setup.ts', // Optional: for global setup
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '@core': path.resolve(__dirname, './src/renderer/components/core'),
      '@composition': path.resolve(__dirname, './src/renderer/components/composition'),
      '@feature': path.resolve(__dirname, './src/renderer/components/feature'),
      '@layouts': path.resolve(__dirname, './src/renderer/components/layouts'),
      '@hooks': path.resolve(__dirname, './src/renderer/hooks'),
      '@utils': path.resolve(__dirname, './src/renderer/utils'),
      '@store': path.resolve(__dirname, './src/renderer/store'),
      '@styles': path.resolve(__dirname, './src/renderer/styles'),
      '@assets': path.resolve(__dirname, './src/renderer/assets'),
    },
  },
});

