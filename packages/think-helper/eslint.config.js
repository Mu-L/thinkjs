const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        think: 'readonly'
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': ['error', {allow: ['warn', 'error']}],
      'no-constant-binary-expression': 'off',
      'no-unused-vars': ['error', {args: 'none', caughtErrors: 'none'}]
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      sourceType: 'module'
    }
  }
];
