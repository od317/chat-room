// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import js from "@eslint/js";
import globals from "globals";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Add JavaScript recommended config
  js.configs.recommended,

  // Server-specific configuration
  {
    files: ["server.js"], // Target your server file
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node, // Adds all Node.js globals
        ...globals.es2021, // Adds modern JS globals
        // Socket.IO specific (if needed)
        io: "readable",
        socket: "readable",
      },
    },
    rules: {
      "@typescript-eslint/no-var-require": "off", // Allow require statements
      "@typescript-eslint/no-require-imports": "off", // Allow require statements
      "no-console": "off", // Allow console in server
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  // Global ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "*.config.js",
  ]),
]);

export default eslintConfig;
