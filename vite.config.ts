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
      includeAssets: ['favicon.ico', 'shield-favicon.svg', 'robots.txt', 'offline.html'],
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
            sizes: '64x64 192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        categories: ['business', 'productivity'],
        lang: 'pt-BR',
      },
      devOptions: {
        enabled: true,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
