import * as config from '@lvce-editor/eslint-config'

export default [
  ...config.default,
  ...config.recommendedActions,
  ...config.recommendedTsconfig,
  ...config.recommendedRegex,
  ...config.recommendedVirtualDom,
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    rules: {
      'github-actions/needs': 'off',
      'github-actions/permissions': 'off',
    },
  },
]
