const importPlugin = require("eslint-plugin-import");
const tsParser = require("@typescript-eslint/parser");

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