module.exports = {
    testEnvironment: "node",
    setupFilesAfterEnv: ["./test/setupTests.ts"],
    testMatch: ["**/test/**/*.test.ts"],
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/*.test.ts'
    ],
    coverageThreshold: {
        global: {
            branches: 25,
            functions: 30,
            lines: 25,
            statements: 25
        }
    }
};
