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
    jest: true
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
  ],
  plugins: [
    'react',
    '@typescript-eslint',
    'jsx-a11y',
    'import',
    'sonarjs',
    'security',
    'react-hooks'
  ],
  rules: {
    // TypeScript özel kurallar
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/ban-ts-comment': ['error', {
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': 'allow-with-description',
      'ts-nocheck': 'allow-with-description',
      'ts-check': 'allow-with-description',
      minimumDescriptionLength: 3
    }],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/prefer-interface': 'off',
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I']
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
        prefix: ['T']
      },
      {
        selector: 'enum',
        format: ['PascalCase'],
        prefix: ['E']
      }
    ],

    // React kuralları
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/display-name': 'off',
    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    'react/jsx-no-useless-fragment': 'warn',
    'react/jsx-pascal-case': 'error',

    // Erişilebilirlik kuralları
    'jsx-a11y/anchor-is-valid': ['error', {
      'components': ['Link'],
      'specialLink': ['to']
    }],
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',

    // Import kuralları
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/namespace': 'error',
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
    }],

    // SonarJS kuralları
    'sonarjs/cognitive-complexity': ['error', 15],
    'sonarjs/no-duplicate-string': ['error', 5],
    'sonarjs/no-identical-functions': 'error',

    // Güvenlik kuralları
    'security/detect-object-injection': 'off',
    'security/detect-non-literal-regexp': 'off',

    // Genel kurallar
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-debugger': 'warn',
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'warn',
    'prefer-const': 'error',
    'prefer-template': 'warn',
    'eqeqeq': ['error', 'always'],
  },
  overrides: [
    {
      files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      env: {
        jest: true,
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
      files: ['**/types/**/*.{ts,tsx}', '**/*.d.ts'],
      rules: {
        '@typescript-eslint/naming-convention': 'off',
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
    {
      files: ['vite.config.ts', 'vitest.config.ts', 'jest.config.ts', '**/*.config.{js,ts}'],
      rules: {
        'import/no-default-export': 'off',
        'no-console': 'off',
      },
    },
  ],
};
