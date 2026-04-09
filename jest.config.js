module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^react-native$': '<rootDir>/node_modules/react-native',
    '^react-native-mlkit-ocr$': '<rootDir>/node_modules/react-native-mlkit-ocr',
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
};
