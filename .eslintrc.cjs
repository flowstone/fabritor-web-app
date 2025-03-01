const { getESLintConfig } = require('@applint/spec');

module.exports = getESLintConfig('react-ts', {
  rules: {
    '@typescript-eslint/semi': ['error', 'always']
  }
});
