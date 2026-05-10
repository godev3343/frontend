// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tailwindcss from 'eslint-plugin-tailwindcss';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { 'simple-import-sort': simpleImportSort, tailwindcss },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'tailwindcss/no-custom-classname': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'src/lib/api/generated/**']),
]);

export default eslintConfig;