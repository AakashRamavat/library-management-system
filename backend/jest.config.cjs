/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: 'src',
  // Jest runs in CommonJS mode even though the package uses ES modules for runtime.
  // ts-jest will transpile TypeScript test files appropriately for Jest.
};

