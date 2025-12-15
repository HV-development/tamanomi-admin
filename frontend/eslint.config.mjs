// eslint.config.mjs (Flat Config for ESLint v9 + Next.js + TypeScript + React)
import nextPlugin from '@next/eslint-plugin-next'
import tseslint from 'typescript-eslint'

const eslintConfig = [
  {
    ignores: ['.next/', 'node_modules/', 'dist/', 'build/', 'next-env.d.ts'],
  },
  {
    name: 'next/core-web-vitals',
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-img-element': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    files: ['src/app/api/**/route.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='fetch']",
          message: 'APIルートではsecureFetchWithCommonHeadersを使用してください。直接fetch()の使用は禁止されています。',
        },
        {
          selector: "CallExpression[callee.object.name='Response'][callee.property.name='json']",
          message: 'APIルートではcreateNoCacheResponseを使用してください。Response.json()の直接使用は禁止されています。',
        },
        {
          selector: "CallExpression[callee.object.name='NextResponse'][callee.property.name='json']",
          message: 'APIルートではcreateNoCacheResponseを使用してください。NextResponse.json()の直接使用は禁止されています。',
        },
      ],
    },
  },
]

export default eslintConfig
