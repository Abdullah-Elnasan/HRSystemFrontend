export function useFixAriaHidden() {
  if (process.server) return

  const nuxtEl = document.getElementById('__nuxt')
  if (!nuxtEl) return

  const observer = new MutationObserver(() => {
    if (nuxtEl.getAttribute('aria-hidden') === 'true') {
      nuxtEl.removeAttribute('aria-hidden')
      nuxtEl.setAttribute('inert', '')
    } else {
      nuxtEl.removeAttribute('inert')
    }
  })

  observer.observe(nuxtEl, {
    attributes: true,
    attributeFilter: ['aria-hidden'],
  })
}
