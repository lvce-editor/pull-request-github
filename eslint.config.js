import * as config from '@lvce-editor/eslint-config'
import * as actions from '@lvce-editor/eslint-plugin-github-actions'

export default [
  ...config.default,
  {
    files: ['**/*.ts'],
    rules: {
      '@cspell/spellchecker': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'no-case-declarations': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      'prefer-destructuring': 'off',
      'unicorn/no-for-loop': 'off',
      'jest/no-identical-title': 'off',
      'unicorn/prefer-single-call': 'off',
      'unicorn/no-immediate-mutation': 'off',
      'unicorn/empty-brace-spaces': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'error',
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  ...actions.default,
  {
    rules: {
      'github-actions/needs': 'off',
      'github-actions/permissions': 'off',
    },
  },
]
