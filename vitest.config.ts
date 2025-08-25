import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: './tests/setup.ts',
  },
  resolve: {
    alias: {
      '@db': path.resolve(__dirname, './db'),
      '@server': path.resolve(__dirname, './server'),
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
});
