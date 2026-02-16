// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/image', '@pinia/nuxt'],

  devtools: { enabled: true },
  debug: true,

  // ========================================
  // ⚙️ تغيير مسار الأيقونات من /api إلى /_icons
  // ========================================
  icon: {
    localApiEndpoint: '/_icons', // ✅ هذا هو الحل!
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
