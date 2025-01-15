import vue from "eslint-plugin-vue";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import parser from "vue-eslint-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  {
    ignores: ["**/node_modules", "**/dist"]
  },
  ...compat.extends(
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ),
  {
    plugins: {
      vue,
      "@typescript-eslint": typescriptEslint,
      prettier
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parser: parser,
      ecmaVersion: 5,
      sourceType: "commonjs",
      parserOptions: {
        parser: "@typescript-eslint/parser"
      }
    },
    rules: {
      "prettier/prettier": ["error"],
      "@typescript-eslint/no-explicit-any": ["off"],
      "vue/valid-v-for": ["off"],
      "vue/multi-word-component-names": ["off"],
      "vue/require-v-for-key": ["off"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],
      "vue/component-tags-order": [
        "error",
        {
          order: ["template", "script", "style"]
        }
      ],
      "no-constant-condition": "off"
    }
  },
  {
    files: ["eslint.config.mjs"],
    rules: { "no-redeclare": "off" }
  }
];
