import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    // Habilitar o histórico de navegação para SPA
    historyApiFallback: true,
  },
  preview: {
    port: 8080,
    strictPort: true,
    // Habilitar o histórico de navegação para SPA
    historyApiFallback: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'shield-favicon.svg', 'robots.txt', 'offline.html', 'almoxarifado_endemias_192x192.png', 'almoxarifado_endemias_512x512.png'],
      manifest: {
        name: 'Almoxarifado - Divisão de Endemias',
        short_name: 'Almoxarifado',
        description: 'Sistema de Gestão de Estoque - Divisão de Endemias',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'shield-favicon.svg',
            sizes: '64x64 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'almoxarifado_endemias_192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'almoxarifado_endemias_512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        categories: ['business', 'productivity'],
        lang: 'pt-BR',
      },
      devOptions: {
        enabled: true,
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
