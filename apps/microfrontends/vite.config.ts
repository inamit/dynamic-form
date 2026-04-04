import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@dynamic-form/shared-ui": path.resolve(__dirname, "../../libs/shared-ui/src/index.ts")
    }
  },
  plugins: [
    react(),
    federation({
      name: 'dynamic_form',
      filename: 'remoteEntry.js',
      exposes: {
        './EntityList': './src/components/EntityList.tsx',
        './EntityForm': './src/components/EntityForm.tsx',
        './WebComponents': './src/web-components.tsx'
      },
      shared: {
        react: {
            requiredVersion: "19.2.4"
        },
        'react-dom': {
            requiredVersion: "19.2.4"
        },
        'react-router-dom': {
            requiredVersion: "7.13.1"
        },
        axios: {
            requiredVersion: "1.13.6"
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
    port: 5001,
  },
  preview: {
    port: 5001,
  }
})
