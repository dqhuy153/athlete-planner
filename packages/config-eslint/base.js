// @athlete-planner/config-eslint — base shared rules
/** @type {import('eslint').Linter.Config[]} */
const base = [
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

module.exports = base;
