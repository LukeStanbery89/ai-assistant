const importPlugin = require("eslint-plugin-import");
const tsParser = require("@typescript-eslint/parser");
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = [
    {
        files: ["server/**/*.{ts,tsx}"],
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
        files: ["server/**/*.{js,ts,jsx,tsx}"],
        plugins: {
            import: importPlugin,
        },
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
