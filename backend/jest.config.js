/**
 * Jest Configuration for SchoolTrack Backend
 * Uses ESM with experimental VM modules
 */
export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: [],
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', 'avatar-e2e'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 30000
};
