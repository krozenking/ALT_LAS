module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true,
    'vitest-globals/env': true
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {}
    }
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:sonarjs/recommended',
    'plugin:security/recommended',
    'plugin:vitest/recommended',
    'plugin:vitest-globals/recommended',
    'plugin:testing-library/react'
  ],
  plugins: [
    'react',
    '@typescript-eslint',
    'jsx-a11y',
    'import',
    'sonarjs',
    'security',
    'react-hooks',
    'vitest',
    'vitest-globals',
    'testing-library'
  ],
  rules: {
    // TypeScript özel kurallar
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': ['warn', {
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': 'allow-with-description',
      'ts-nocheck': 'allow-with-description',
      'ts-check': 'allow-with-description',
      minimumDescriptionLength: 3
    }],

    // React kuralları
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'react/display-name': 'off',

    // Test kuralları
    'vitest/expect-expect': 'error',
    'vitest/no-disabled-tests': 'warn',
    'vitest/no-focused-tests': 'error',
    'vitest/valid-expect': 'error',
    'testing-library/await-async-query': 'error',
    'testing-library/no-await-sync-query': 'error',
    'testing-library/no-container': 'error',
    'testing-library/no-debugging-utils': 'warn',
    'testing-library/no-dom-import': ['error', 'react'],
    'testing-library/no-node-access': 'warn',
    'testing-library/no-render-in-setup': 'error',
    'testing-library/prefer-find-by': 'error',
    'testing-library/prefer-presence-queries': 'error',
    'testing-library/prefer-screen-queries': 'error',
    'testing-library/prefer-wait-for': 'error',

    // Erişilebilirlik kuralları
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',

    // Genel kurallar
    'no-console': 'off',
    'no-debugger': 'warn',
  },
  overrides: [
    {
      files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      env: {
        jest: true,
        'vitest-globals/env': true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/naming-convention': 'off',
        'no-console': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/no-identical-functions': 'off',
        'security/detect-non-literal-fs-filename': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
      },
    },
    {
      files: ['cypress/**/*.ts', 'cypress/**/*.tsx', 'cypress.config.ts'],
      rules: {
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'security/detect-non-literal-fs-filename': 'off',
        'no-console': 'off',
      },
    },
  ],
};
