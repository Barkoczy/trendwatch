import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    ignores: ['src/components/ui/**/*'],
  },
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:prettier/recommended'
  ),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/no-explicit-any': ['error'],
      '@typescript-eslint/explicit-function-return-type': ['off'],
      'react/react-in-jsx-scope': ['off'],
      'react/jsx-props-no-spreading': ['off'],
      'import/prefer-default-export': ['off'],
      'import/extensions': ['off'],
      'import/no-extraneous-dependencies': ['off'],
      'no-underscore-dangle': ['off'],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/lines-between-class-members': 'off',
    },
  },
];

export default eslintConfig;
