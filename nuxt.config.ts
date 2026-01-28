// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/image', '@pinia/nuxt'],

  devtools: {
    enabled: true,

  },
  debug: true,
  app: {

    baseURL: ''
  },

  routeRules: {
    '/': { prerender: true },
    '/api/departments/departments': {
      cors: true,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    },
    '/api/branches/branches': {
      cors: true,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    }
  },


  ssr:false,

  runtimeConfig: {
    // The private keys which are only available server-side
    apiSecret: '123',
    // Keys within public are also exposed client-side
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
    },
  },

  css: ['~/assets/css/main.css'],

  // routeRules: {
  //   '/': { prerender: true }
  // },

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
