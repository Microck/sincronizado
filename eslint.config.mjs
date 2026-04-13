// ESLint flat config for sincronizado
// Migration from .eslintrc.json (legacy format) to flat config format
// Requires: npm install -D typescript-eslint @typescript-eslint/parser globals

import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    rules: {
      "indent": ["error", 2],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "double", { "avoidEscape": true }],
      "semi": ["error", "always"],
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: ["node_modules/", "dist/", "build/", "legacy/", "bin/", "tests/"],
  },
);
