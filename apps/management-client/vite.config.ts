import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['@dynamic-form/shared-ui']
    }
  },
  optimizeDeps: {
    exclude: ['@dynamic-form/shared-ui']
  },
  resolve: {
    alias: {
      '@dynamic-form/shared-ui': '/app/libs/shared-ui/src/index.ts'
    }
  }
})
