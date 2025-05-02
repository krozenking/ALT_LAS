module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'], // Focus on .ts test files for now
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Explicitly define the transform for .ts files
  transform: {
    '^.+\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json' // Use the test-specific tsconfig
      }
    ]
  },
  // Adjust transformIgnorePatterns to allow transforming ESM modules like formidable and superagent
  transformIgnorePatterns: [
    '/node_modules/(?!formidable|supertest|superagent)/'
  ],
  // Remove moduleNameMapper for formidable as transformIgnorePatterns should handle it
  // moduleNameMapper: {
  //   '^formidable$': '<rootDir>/node_modules/formidable/src/index.js'
  // },
  // Remove the globals section as tsconfig is now specified within the transform
  // globals: {
  //   'ts-jest': {
  //     tsconfig: 'tsconfig.test.json'
  //   }
  // }
};

