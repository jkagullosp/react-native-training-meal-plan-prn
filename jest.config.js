module.exports = {
  preset: 'react-native',
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/stores/**/*.{ts,tsx}',
    'src/services/**/*.{ts,tsx}',
  ],
};