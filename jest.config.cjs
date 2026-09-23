/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  verbose: true,
  rootDir: __dirname,
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "esnext",
          target: "es2022",
        },
      },
    ],
  },
  testEnvironment: "node",
  testRegex: "/tests/.*\\.(test|spec)\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: false,
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  reporters: ["default"],
};
