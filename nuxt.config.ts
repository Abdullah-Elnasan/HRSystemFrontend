// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/image', '@pinia/nuxt'],

  devtools: { enabled: true },
  debug: true,

  // ========================================
  // ⚙️ حل نهائي: Bundle الأيقونات في البناء
  // ========================================
  icon: {
    provider: 'server',
    serverBundle: {
      collections: ['lucide', 'heroicons'] // bundle محلي
    }
  },

  // ========================================
  // 🚫 منع /api/_nuxt_icon من الوصول للـ Laravel
  // ========================================
  nitro: {
    routeRules: {
      '/api/_nuxt_icon/**': {
        headers: {
          'cache-control': 'public, max-age=31536000, immutable'
        }
      }
    }
  },

  routeRules: {
    '/': { ssr: true },
    '/app/**': { ssr: false },
    '/login': { ssr: false }
  },

  runtimeConfig: {
    apiSecret: '123',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      apiToken: process.env.NUXT_TOKEN
    }
  },

  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-01-15',

  alias: {
    '@server': './server',
    '@utils': './server/utils'
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
