import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'example_app',
      remotes: {
        dynamic_form: 'http://localhost:5001/assets/remoteEntry.js'
      },
      shared: {
        react: {
            requiredVersion: "^19.2.4"
        },
        'react-dom': {
            requiredVersion: "^19.2.4"
        },
        'react-router-dom': {
            requiredVersion: "^7.13.1"
        },
        axios: {
            requiredVersion: "^1.13.6"
        }
      }
    })
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 5000,
  },
  preview: {
    port: 5000,
  }
})
