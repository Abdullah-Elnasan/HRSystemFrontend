import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
  },
  ignorePatterns: [
    'E-System-Frontend*.ts',
    'E-System-Frontend*.config.*',
  ],
})
