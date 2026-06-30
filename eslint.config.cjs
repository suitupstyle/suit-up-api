const { flatConfigs } = require('@typescript-eslint/eslint-plugin/use-at-your-own-risk/raw-plugin')
const eslintConfigPrettier = require('eslint-config-prettier/flat')
const importPlugin = require('eslint-plugin-import')
const globals = require('globals')

const tsFiles = ['src/**/*.ts']

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
    {
        ignores: ['dist/**', 'node_modules/**'],
    },
    ...flatConfigs['flat/recommended'].map((config) => ({
        ...config,
        files: tsFiles,
    })),
    {
        files: tsFiles,
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        plugins: {
            import: importPlugin,
        },
        rules: {
            'import/order': ['error', { 'newlines-between': 'always' }],
        },
    },
    {
        ...eslintConfigPrettier,
        files: tsFiles,
    },
]
