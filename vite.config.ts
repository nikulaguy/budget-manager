import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'BudgetManager',
        short_name: 'BudgetManager',
        description: 'Application de gestion de budget moderne et accessible',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: command === 'build' ? '/budget/' : '/',
        scope: command === 'build' ? '/budget/' : '/',
        icons: [
          {
            src: command === 'build' ? '/budget/pwa-192x192.png' : '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: command === 'build' ? '/budget/pwa-512x512.png' : '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  // Base path différent selon l'environnement
  base: command === 'build' ? '/budget/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 3000
  }
})) 