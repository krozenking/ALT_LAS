import globals from "globals";
import tseslint from "typescript-eslint";
import pluginSecurity from "eslint-plugin-security";

export default [
  {
    ignores: ["dist/**/*", "node_modules/**/*", "*.js", "*.test.js"] // Ignore JS files, dist, node_modules
  },
  // Config for source files
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: true, // Assumes tsconfig.json includes src files
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      security: pluginSecurity,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...pluginSecurity.configs.recommended.rules,
      // Add any specific rule overrides here
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "warn", // Warn instead of error for 'any'
      "security/detect-object-injection": "warn", // Adjust severity as needed
      // Disable rules if necessary
    },
  },
  // Config for test files
  {
    files: ["tests/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.jest // Add jest globals for test files
      },
      parser: tseslint.parser,
      // Avoid project setting for tests if they are not included in tsconfig.json
      // or create a separate tsconfig.test.json
      // parserOptions: {
      //   project: true, 
      // },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      security: pluginSecurity,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...pluginSecurity.configs.recommended.rules,
      // Relax some rules for tests if needed
      "@typescript-eslint/no-explicit-any": "off", // Allow 'any' in tests
      "security/detect-object-injection": "off", // May be less critical in tests
      // Add other test-specific rules or overrides
    },
  }
];
