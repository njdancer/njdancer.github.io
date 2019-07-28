const path = require("path")

module.exports = {
  "settings": {
    "react": {
      "version": "detect",
    }
  },
  "env": {
    "browser": true,
    "es6": true
  },
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:react/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:jsx-a11y/recommended"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint",
    "react",
    "sort-keys-fix",
    "sort-imports-es6-autofix",
    "import",
    "jsx-a11y",
    "react-hooks",
    "graphql"
  ],
  "rules": {
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/member-delimiter-style": [
      "warn",
      {
        "multiline": {
          "delimiter": "none",
          "requireLast": true
        },
        "singleline": {
          "delimiter": "semi",
          "requireLast": false
        }
      }
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/member-ordering": "warn",
    "no-console": "warn",
    "sort-keys-fix/sort-keys-fix": "warn",
    "sort-imports-es6-autofix/sort-imports-es6": "warn",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "import/no-unresolved": "off",
    "react/jsx-sort-props": [
      "warn",
      {
        "callbacksLast": true,
        "shorthandFirst": true,
        "shorthandLast": false,
        "ignoreCase": true,
        "noSortAlphabetically": false,
        "reservedFirst": true
      }
    ],
    "prettier/prettier": "warn",
    "graphql/template-strings": [
      "error",
      {
        "env": "relay",
        "schemaJsonFilepath": path.resolve(__dirname, "./schema.json"),
        "tagName": "graphql"
      }
    ]
  }
}
