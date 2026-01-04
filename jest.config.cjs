module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/__tests__/jest.setup.js'],
  transform: {
    '^.+\\.[tj]s$': 'babel-jest'
  },
  testMatch: ['**/__tests__/**/*.test.js']
};
