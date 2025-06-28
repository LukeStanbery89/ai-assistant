module.exports = {
    testEnvironment: "node",
    setupFilesAfterEnv: ["./test/setupTests.ts"],
    testMatch: ["**/test/**/*.test.ts"],
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    verbose: true,
};
