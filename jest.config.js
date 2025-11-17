const nextJest = require('next/jest');

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    'store/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/build/**',
    // Exclude specific files
    '!app/layout.tsx', // Root layout with providers
    '!app/globals.css', // CSS file
    '!components/ui/**', // shadcn/ui components (external library)
    '!components/theme-provider.tsx', // Third-party wrapper
    '!lib/utils.ts', // Simple utility functions (can be tested if needed)
    '!**/types/**', // Type definitions
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      lines: 60,
      branches: 50,
      functions: 60,
      statements: 60,
    },
    // Higher thresholds for critical business logic
    './services/**/*.{js,jsx,ts,tsx}': {
      lines: 80,
      branches: 70,
      functions: 80,
      statements: 80,
    },
  },

  // Transform configuration for TypeScript and JSX
  // Next.js built-in transform handles this automatically

  // Module paths
  modulePaths: ['<rootDir>'],

  // Test timeout
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);
