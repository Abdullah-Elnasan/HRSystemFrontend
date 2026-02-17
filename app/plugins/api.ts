export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',

    onRequest({ options }) {
      const token = useCookie('XSRF-TOKEN').value

      if (token) {
        const headers = new Headers(options.headers || {})
        headers.set('X-XSRF-TOKEN', token)
        options.headers = headers
      }
    },
  })

  return {
    provide: {
      api,
    },
  }
})
