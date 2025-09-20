// @ts-check
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginNode from "eslint-plugin-node";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginPromise from "eslint-plugin-promise";
import tseslint from "typescript-eslint";

const commonPrettierConfig = {
  endOfLine: "lf",
  tabWidth: 2,
  useTabs: false,
  printWidth: 120,
  trailingComma: "es5",
  arrowParens: "avoid",
};

const commonImportOrder = {
  groups: ["builtin", "external", "internal", ["parent", "sibling", "index"], "object", "type"],
  "newlines-between": "always",
  alphabetize: { order: "asc", caseInsensitive: true },
};

const commonRules = {
  "no-console": "warn",
  "no-debugger": "error",
  "no-duplicate-imports": "error",
  "no-unused-expressions": "error",
  "prefer-const": "error",
  "no-var": "error",
  "object-shorthand": "error",
  "prefer-template": "error",
};

const tsScoped = tseslint.configs.recommendedTypeChecked.map(c => ({
  ...c,
  files: ["**/*.{ts,tsx}"],
}));

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "**/*.d.ts",
      "docs/**",
      "**/*.js.map",
      "**/*.d.ts.map",
      "coverage/**",
      ".next/**",
      ".nuxt/**",
      ".output/**",
      ".vite/**",
      "tsup.config.ts",
    ],
  },
  js.configs.recommended,
  ...tsScoped,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: eslintPluginImport,
      node: eslintPluginNode,
      promise: eslintPluginPromise,
      prettier: eslintPluginPrettier,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json"],
      },
    },
    rules: {
      "prettier/prettier": ["error", { ...commonPrettierConfig, singleQuote: true }],
      "import/order": ["warn", commonImportOrder],
      "import/no-duplicates": "off",
      "import/no-unresolved": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-unsafe-function-type": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      ...commonRules,
      "no-duplicate-imports": "off",
      "node/no-missing-import": "off",
      "node/no-unsupported-features/es-syntax": "off",
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: {
      import: eslintPluginImport,
      node: eslintPluginNode,
      promise: eslintPluginPromise,
      prettier: eslintPluginPrettier,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "prettier/prettier": ["error", { ...commonPrettierConfig, singleQuote: false }],
      "import/order": ["warn", commonImportOrder],
      "import/no-duplicates": "error",
      ...commonRules,
    },
  },
  eslintConfigPrettier,
];
