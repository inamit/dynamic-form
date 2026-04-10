import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'dynamic_form_form',
      filename: 'remoteEntry.js',
      exposes: {
        './EntityForm': './src/components/EntityForm.tsx',
        './WebComponents': './src/web-components.tsx'
      },
      shared: ['react', 'react-dom', 'react-router-dom', 'axios']
    })
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 5002,
  },
  preview: {
    port: 5002,
  }
})
