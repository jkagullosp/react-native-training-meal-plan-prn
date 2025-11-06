module.exports = {
  preset: 'react-native',
  testMatch: [
    '**/src/**/store/**/*.test.[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/modules/**/store/**/*.{ts,tsx}',
    '!src/modules/**/store/**/index.ts',
  ],
};