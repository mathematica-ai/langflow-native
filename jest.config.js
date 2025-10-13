module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'packages/**/src/**/*.ts',
    '!packages/**/src/**/*.d.ts',
    '!packages/**/src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@langflow-native/core$': '<rootDir>/packages/core/src',
    '^@langflow-native/runtime$': '<rootDir>/packages/runtime/src',
    '^@langflow-native/services$': '<rootDir>/packages/services/src',
    '^@langflow-native/components$': '<rootDir>/packages/components/src',
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
};

