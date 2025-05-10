import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/NBA-viewership-decline/',
  plugins: [react()],
  build: {
    assetsDir: 'assets',
  },
  publicDir: '.',
})
