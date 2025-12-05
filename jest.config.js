module.exports = {
  preset: 'react-native',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverageFrom: [
    'src/stores/**/*.{ts,tsx}',
    'src/services/**/*.{ts,tsx}',
    'src/api/**/*.{ts,tsx}',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native-url-polyfill|@react-native|react-native|@react-native-community|@react-navigation|react-native-toast-message)/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
