module.exports = async () => {
    return {
        rootDir: "./",
        verbose: true,
        transform: {
            "^.+\\.js?$": "babel-jest",
        },
        testEnvironment: "node",
        transformIgnorePatterns: [
            "node_modules/(?!(sc-base-database|sc-common|sc-game-base|sc-base-apis|sc-api-client|jest-auto-fixture|cron)/)",
        ],
        coverageReporters: ["clover", "lcov", "text-summary", "cobertura", "text"],
        reporters: ["default", ["jest-junit", { outputDirectory: "coverage" }]],
        testResultsProcessor: "jest-sonar-reporter",
        collectCoverageFrom: ["src/**/*.js"],
    };
};
