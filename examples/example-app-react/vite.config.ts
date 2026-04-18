import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      federation({
        name: 'example_app',
        remotes: {
          dynamic_list: env.VITE_MFE_LIST_URL || 'http://localhost:5001/assets/remoteEntry.js',
          dynamic_form: env.VITE_MFE_FORM_URL || 'http://localhost:5002/assets/remoteEntry.js'
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
      port: 5000,
    },
    preview: {
      port: 5000,
    }
  }
})
