// jest.config.js
module.exports = {
    preset: './jest-preset.js', // Use the path to your jest-preset.js file
    setupFilesAfterEnv: ['./jest.setup.js'], // Set up files or configurations before running tests
    globalTeardown: './teardown.js',
    testTimeout: 10000,
  };


  