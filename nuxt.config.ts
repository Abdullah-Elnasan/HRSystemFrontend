// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/image', '@pinia/nuxt'],

  devtools: { enabled: true },
  debug: true,

  // ========================================
  // ⚙️ إعدادات الأيقونات
  // ========================================
  icon: {
    // تعطيل server bundle لتجنب /api/_nuxt_icon
    serverBundle: false,

    // أو استخدم collections محددة
    // collections: ['lucide', 'heroicons']
  },

  // ========================================
  // 🔀 Route Rules
  // ========================================
  routeRules: {
    '/': { ssr: true },
    '/app/**': { ssr: false },
    '/login': { ssr: false }
  },

  // ========================================
  // 🌐 Runtime Config
  // ========================================
  runtimeConfig: {
    apiSecret: '123',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      apiToken: process.env.NUXT_TOKEN
    }
  },

  // ========================================
  // 🎨 Styling & Paths
  // ========================================
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-01-15',

  alias: {
    '@server': './server',
    '@utils': './server/utils'
  },

  // ========================================
  // 📝 ESLint Config
  // ========================================
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
