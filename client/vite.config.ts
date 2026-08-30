import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\/api\/courses.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-courses-cache',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 32, maxAgeSeconds: 60 },
            },
          },
        ],
      },
      manifest: {
        name: 'Somali AI Learning Tutor',
        short_name: 'SomaliTutor',
        description: 'Baro Physics, Biology, English, Chemistry, Mathematics',
        theme_color: '#2563eb',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
        lang: 'so',
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('react-router')) return 'vendor';
          if (id.includes('lucide-react')) return 'icons';
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3850,
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx', './src/index.css'],
    },
    proxy: {
      '/api': 'http://127.0.0.1:3847',
      '/uploads': 'http://127.0.0.1:3847',
    },
  },
})
