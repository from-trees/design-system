import js from "@eslint/js";
import ts from "typescript-eslint";
import stylex from "@stylexjs/eslint-plugin";
import globals from "globals";
export default ts.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "output/**"] },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { "@stylexjs": stylex },
    rules: {
      "@stylexjs/valid-styles": "error",
      "@stylexjs/valid-shorthands": "error",
    },
  },
);
