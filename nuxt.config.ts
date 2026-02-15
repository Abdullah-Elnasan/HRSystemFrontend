// export default defineNuxtConfig({
//   modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/image', '@pinia/nuxt'],

//   devtools: {
//     enabled: true,
//   },

//   debug: true,

//   app: {
//     // خليه افتراضي /
//     baseURL: '/HRSystemFrontend/',
//   },

//   // بما أنك ssr:false والديبلوي على Vercel، ألغِ الـ prerender مؤقتًا
//   // أو علّق routeRules كلها حتى نتأكد أن المشكلة ليست منها
//   // routeRules: {
//   //   '/': { prerender: true },
//   //   '/api/departments/departments': {
//   //     cors: true,
//   //     headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
//   //   },
//   //   '/api/branches/branches': {
//   //     cors: true,
//   //     headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
//   //   }
//   // },

//   ssr: false,

//   runtimeConfig: {
//     apiSecret: '123',
//     public: {
//       apiBase: process.env.NUXT_PUBLIC_API_BASE,
//       apiToken: process.env.NUXT_TOKEN,
//     },
//   },

//   css: ['~/assets/css/main.css'],

//   compatibilityDate: '2025-01-15',

//   alias: {
//     '@server': './server',
//     '@utils': './server/utils',
//   },

//   eslint: {
//     config: {
//       stylistic: {
//         commaDangle: 'never',
//         braceStyle: '1tbs',
//       },
//     },
//   },
// })


// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/image', '@pinia/nuxt'],

  devtools: { enabled: true },
  debug: true,

  // لا تضع baseURL إذا على دومين/ساب دومين مستقل
  // ssr: false,
  // app: { baseURL: '/' },
  // لا تضع ssr:false هنا

  routeRules: {
    '/': { ssr: true },
    '/app/**': { ssr: false },
    '/login': { ssr: false }
    // '/HRSystemFrontend/': { ssr: true },
    // '/HRSystemFrontend/app/**': { ssr: false },
    // '/HRSystemFrontend/login': { ssr: false }
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
