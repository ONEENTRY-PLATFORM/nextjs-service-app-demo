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
    // Default ignores of eslint-config-next:
    '.next/**',
    // E2E build output (next.config distDir when E2E_BUILD=1) — compiled
    // artifacts break the type-aware parser, same as `.next/**`.
    '.next-e2e/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Figma-экспорт верстки — референс дизайна, не рабочий код
    'static-html/**',
    // Служебные скрипты Claude (инспекция/наполнение CMS) — не рабочий код проекта
    '.claude/**',
    // Сгенерированные артефакты тестов Playwright (минифицированные бандлы отчёта
    // весом 500KB+). ESLint flat config НЕ читает .gitignore, поэтому эти каталоги
    // надо гасить явно — иначе type-aware парсинг + tailwindcss/prettier по бандлам
    // подвешивают линт на минуты.
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
    // `@next/next` is registered by `eslint-config-next` above — registering the
    // plugin again here under the name `next` was inert (its rules are all in the
    // `@next/next/*` namespace) and made the config depend on a package that is
    // not in package.json, resolved only by hoisting.
    plugins: {
      prettier: prettierPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      tailwindcss: tailwindcssPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      jsdoc: jsdocPlugin,
    },
    rules: {
      // Bring in recommended configs as base.
      // NOTE: `reactPlugin.configs.flat` is a MAP of configs, not a config —
      // spreading `.rules` / `.languageOptions` off it yielded `undefined` and
      // silently applied nothing. The react rules this project actually wants are
      // set explicitly below. `@next/next` recommended + core-web-vitals come from
      // `eslint-config-next` at the top of this file, so re-spreading them here
      // was duplication.
      ...typescriptPlugin.configs.recommended.rules,
      ...prettierPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs['recommended-latest'].rules,
      // eslint-plugin-tailwindcss v4: only `recommended` flat config remains
      // ('flat/recommended' was removed with the 4.x stable release)
      ...tailwindcssPlugin.configs.recommended.rules,
      ...jsdocPlugin.configs['flat/recommended'].rules,

      // Custom (non-Tailwind) classes: GSAP animation hooks and component
      // classes styled in app/globals.css
      'tailwindcss/no-custom-classname': [
        'warn',
        {
          whitelist: [
            // GSAP / animation selector hooks
            '^(beauty|salon|mask_path|intro|logo|loader|slide|slider|title|item|arrow)$',
            '^hero-(bg|title|description|button)$',
            '^(menu-item|animate-loader)$',
            // component classes defined in globals.css
            '^review-fade$',
          ],
        },
      ],

      // Prettier — options live in .prettierrc, NOT inline here.
      // eslint-plugin-prettier reads that file itself, so a single config drives
      // both `eslint --fix` and standalone `prettier` / format-on-save. Inlining
      // them again would fork the source of truth: whatever is missing here
      // silently falls back to Prettier's defaults (double quotes), which is how
      // format-on-save used to fight ESLint.
      'prettier/prettier': 'error',

      // React
      'react/react-in-jsx-scope': 'off', // Next/React automatic runtime
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/function-component-definition': 'off',
      'react/destructuring-assignment': 'off',
      'react/require-default-props': 'off',
      'react/jsx-props-no-spreading': 'off',

      // Typescript / unused vars
      // disable base rule and use typescript-aware rule instead
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],

      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/comma-dangle': 'off',

      // Import / sorting
      'import/extensions': 'off',
      'import/order': 'off',
      'import/prefer-default-export': 'off',

      // Merge multiple imports from the same module into one statement.
      // `simple-import-sort` sorts but never dedupes; without this, several
      // named imports from the same source stay on separate lines. `prefer-inline`
      // stays off so `import type`/value imports remain split under
      // `consistent-type-imports`.
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

  // Jest unit tests type-check under their OWN program (`tests/jest/tsconfig.json`,
  // which keeps Next's `.next/types` out to avoid the @types/jest global clash — see
  // that file's header). Point the type-aware parser at it for these files, otherwise
  // ESLint fails every test with "file was not found in any of the provided project(s)"
  // (the root tsconfig excludes `tests/jest`). This is also what makes the editor lint
  // them with the jest globals and the `@/*` alias in scope.
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
