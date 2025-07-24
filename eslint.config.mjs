import { configs as tseslintConfigs } from "@typescript-eslint/eslint-plugin";
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default [
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      ...tseslintConfigs.strictTypeChecked,
      reactX.configs["recommended-typescript"],
      reactDom.configs.recommended,
      "next/core-web-vitals",
      "next/typescript",
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "jsx-a11y/alt-text": "off",
    },
  },
];
