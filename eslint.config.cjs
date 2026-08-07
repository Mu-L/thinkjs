const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/runtime/**',
      '**/test/fixtures/**',
      '**/test/fixture/**'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.mocha,
        think: 'readonly',
        thinkCache: 'readonly'
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn'
    },
    rules: {
      'no-console': ['error', {allow: ['warn', 'error']}],
      'no-case-declarations': 'off',
      'no-constant-condition': ['error', {checkLoops: false}],
      'no-empty': ['error', {allowEmptyCatch: true}],
      'no-prototype-builtins': 'off',
      'no-unassigned-vars': 'off',
      'no-useless-assignment': 'off',
      'no-unused-vars': ['error', {
        args: 'none',
        caughtErrors: 'none',
        ignoreRestSiblings: true
      }],
      'no-unused-expressions': ['error', {
        allowShortCircuit: true,
        allowTaggedTemplates: true,
        allowTernary: true
      }],
      'eqeqeq': ['error', 'always', {null: 'ignore'}],
      'prefer-const': 'off'
    }
  },
  {
    files: ['packages/think-cli/**/*.js', 'packages/thinkjs/test/**/*.js'],
    rules: {
      'no-console': ['error', {allow: ['warn', 'error', 'log']}]
    }
  }
];
