// @monorepo-template/config-eslint — Next.js app rules
const { FlatCompat } = require("@eslint/eslintrc");
const path = require("path");

const compat = new FlatCompat({ baseDirectory: __dirname });

/** @type {import('eslint').Linter.Config[]} */
const nextConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];

module.exports = nextConfig;
