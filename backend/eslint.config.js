import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        ...globals.node, // ✅ Enables process, __dirname, etc.
      },
    },

    rules: {
      // You can add backend rules here
    },
  },
];