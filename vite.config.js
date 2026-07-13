import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'atomacik-icon.svg',
        'atomacik-icon-192.png',
        'atomacik-icon-512.png',
        'apple-touch-icon.png',
        'atomacik-og.png',
      ],
      manifest: {
        name: 'Atómáčik – vedecká výprava za čistou vodou',
        short_name: 'Atómáčik',
        description: 'Edukačná hra o odbere vody, laboratórnom meraní a izotopoch.',
        theme_color: '#1858a8',
        background_color: '#f5fbff',
        display: 'standalone',
        start_url: '/atomacik/',
        scope: '/atomacik/',
        lang: 'sk',
        icons: [
          { src: 'atomacik-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'atomacik-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'atomacik-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/atomacik/index.html',
        globPatterns: ['**/*.{js,css,html,svg,json}'],
        runtimeCaching: [{
          urlPattern: /^https:\/\/open\.spotify\.com\//,
          handler: 'NetworkOnly',
        }],
      },
    }),
  ],
  base: '/atomacik/',
})
