// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
 quotes: ['error', 'single', { allowTemplateLiterals: true }]
)
