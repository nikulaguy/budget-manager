import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react()
  ],
  // GitHub Pages déploiement via Actions
  base: process.env.GITHUB_ACTIONS ? '/budget/' : './',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Noms de fichiers propres pour GitHub Pages
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    // Optimisation pour les modules ES
    target: 'esnext',
    minify: 'esbuild'
  },
  server: {
    port: 3000
  }
})) 