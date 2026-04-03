import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@dynamic-form/shared-ui": path.resolve(__dirname, "../../libs/shared-ui/src/index.ts")
    }
  }
})
