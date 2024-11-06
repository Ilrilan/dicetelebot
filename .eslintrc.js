module.exports = {
  ignorePatterns: [
    'lib',
    'node_modules',
    'public',
  ],
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
    },
  },
  plugins: [],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  extends: [
    // https://github.com/prettier/eslint-config-prettier
    'prettier',
  ],
  rules: {
    // https://eslint.org/docs/rules/
    curly: 'error',
    'keyword-spacing': 'error',
    'max-params': ['error', 8], // service-caller может работать с восемью аргументами
    'no-warning-comments': ['error', { terms: ['fixme'], location: 'anywhere' }],
    'no-unused-vars': ['error', { vars: 'all', args: 'none', ignoreRestSiblings: true }],
    'no-restricted-imports': ['error', 'prop-types'],
    'object-curly-spacing': ['error', 'always'],
    semi: ['error', 'never'],
    'space-before-blocks': 'error',
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: ['break', 'continue'] },
      { blankLine: 'always', prev: ['const', 'let'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
      // example of directive - "use strict"
      { blankLine: 'always', prev: 'directive', next: '*' },
      { blankLine: 'any', prev: 'directive', next: 'directive' },
      { blankLine: 'always', prev: 'block-like', next: '*' },
      { blankLine: 'always', prev: '*', next: 'block-like' },
    ],
    'import/prefer-default-export': 'off',
    quotes: ['error', 'single', { avoidEscape: true }],
    'quote-props': ['error', 'as-needed'],
  },
  overrides: [],
}
