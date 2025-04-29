module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.js'], // Include both .ts and .js test files
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Adjust transformIgnorePatterns to allow transforming ESM modules like formidable and superagent
  transformIgnorePatterns: [
    '/node_modules/(?!formidable|supertest|superagent)/' 
  ],
  // Remove moduleNameMapper for formidable as transformIgnorePatterns should handle it
  // moduleNameMapper: {
  //   '^formidable$': '<rootDir>/node_modules/formidable/src/index.js' 
  // },
  // Add any other Jest configurations needed
};
