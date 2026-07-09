import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Load next.config.ts and .env files in the test environment
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // e2e specs run under the Playwright runner, not Jest
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/tests/e2e/'],
  testMatch: ['<rootDir>/tests/jest/**/*.test.{ts,tsx}'],
};

export default createJestConfig(config);
