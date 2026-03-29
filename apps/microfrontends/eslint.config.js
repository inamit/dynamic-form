import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    rules: { "@typescript-eslint/no-explicit-any": "off", "@typescript-eslint/no-unused-vars": "off", "no-use-before-define": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-compiler/react-compiler": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "no-empty": "off", "prefer-const": "off", "react-hooks/exhaustive-deps": "off" },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
