module.exports = {
    parser: '@typescript-eslint/parser',
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    plugins: ['@typescript-eslint', 'import'],
    env: {
        node: true,
        es2021: true,
    },
    rules: {
        'import/order': ['error', { 'newlines-between': 'always' }],
    },
}
