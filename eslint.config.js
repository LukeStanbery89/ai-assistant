const importPlugin = require("eslint-plugin-import");
const tsParser = require("@typescript-eslint/parser");
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = [
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
                sourceType: "module",
            },
        },
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            "prettier/prettier": "error",
        },
    },
    {
        plugins: {
            import: importPlugin,
        },
        files: ["client/**/*.{js,ts,jsx,tsx}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: ["server/*"],
                },
            ],
        },
    },
    {
        plugins: {
            import: importPlugin,
        },
        files: ["server/**/*.{js,ts,jsx,tsx}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: ["client/*"],
                },
            ],
        },
    },
];
