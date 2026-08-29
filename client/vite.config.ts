import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3850,
    proxy: {
      '/api': 'http://127.0.0.1:3847',
      '/uploads': 'http://127.0.0.1:3847',
    },
  },
})
