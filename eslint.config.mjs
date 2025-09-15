// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPromise from 'eslint-plugin-promise';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default [
    {
        ignores: ['dist/**', 'node_modules/**', '**/*.d.ts'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        plugins: {
            import: eslintPluginImport,
            promise: eslintPluginPromise,
            prettier: eslintPluginPrettier,
        },
        rules: {
            'prettier/prettier': 'error',
            'import/order': [
                'warn',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        ['parent', 'sibling', 'index'],
                        'object',
                        'type',
                    ],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                },
            ],
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
            ],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-require-imports': 'error',
            '@typescript-eslint/no-unsafe-function-type': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            'no-console': 'warn',
        },
        settings: {
            'import/resolver': {
                typescript: true,
            },
        },
        languageOptions: {
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: ['./tsconfig.json'],
            },
        },
    },
    {
        files: ['src/**/*.{ts,tsx,js}'],
    },
];
