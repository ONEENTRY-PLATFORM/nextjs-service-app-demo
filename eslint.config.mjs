import { dirname } from 'path';
import { fileURLToPath } from 'url';

import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier';
import tailwindcssPlugin from 'eslint-plugin-tailwindcss';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import jsdocPlugin from 'eslint-plugin-jsdoc';

import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    'node_modules/**',
    '.next/**',
    '.next-e2e/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'static-html/**',
    '.claude/**',
    'playwright-report/**',
    'test-results/**',
    'blob-report/**',
    'playwright/.cache/**',
    'coverage/**',
  ]),

  // Main ruleset for JS/TS/JSX/TSX
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    ignores: ['node_modules/**', '.next/**', 'out/**', '.claude/**'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      // import/resolver settings are useful if you use path aliases (adjust if needed)
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      // eslint-plugin-tailwindcss v4 resolves the theme from the CSS
      // entrypoint (defaults to src/style.css, which doesn't exist here)
      tailwindcss: {
        cssConfigPath: './app/globals.css',
      },
    },
    plugins: {
      prettier: prettierPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      tailwindcss: tailwindcssPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      jsdoc: jsdocPlugin,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      ...prettierPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs['recommended-latest'].rules,
      ...tailwindcssPlugin.configs.recommended.rules,
      ...jsdocPlugin.configs['flat/recommended'].rules,
      'tailwindcss/no-custom-classname': [
        'warn',
        {
          whitelist: [
            '^(beauty|salon|mask_path|intro|logo|loader|slide|slider|title|item|arrow)$',
            '^hero-(bg|title|description|button)$',
            '^(menu-item|animate-loader)$',
            '^review-fade$',
          ],
        },
      ],

      'prettier/prettier': 'error',

      // React
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/function-component-definition': 'off',
      'react/destructuring-assignment': 'off',
      'react/require-default-props': 'off',
      'react/jsx-props-no-spreading': 'off',

      // Typescript / unused vars
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],

      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/comma-dangle': 'off',

      // Import / sorting
      'import/extensions': 'off',
      'import/order': 'off',
      'import/prefer-default-export': 'off',

      // Merge multiple imports
      'import/no-duplicates': ['error', { 'prefer-inline': false }],

      // strict sorting
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Style / safety
      'no-restricted-syntax': [
        'error',
        'ForInStatement',
        'LabeledStatement',
        'WithStatement',
      ],

      'no-console': 'warn',

      // JSDoc rules
      'jsdoc/check-line-alignment': ['warn', 'always'],
    },
  },

  // Jest unit tests
  {
    files: ['tests/jest/**/*.ts', 'tests/jest/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tests/jest/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
]);

export default eslintConfig;
