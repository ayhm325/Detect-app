module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'babel-jest'
  },
  testMatch: ['**/__tests__/**/*.test.js']
};
