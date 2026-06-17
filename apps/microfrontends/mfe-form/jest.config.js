export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '^@dynamic-form/shared-ui$': '<rootDir>/../../../libs/shared-ui/src/index.ts',
    '^@dynamic-form/geo-utils$': '<rootDir>/../../../libs/geo-utils/src/index.ts'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.test.json'
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
};
