// jest.setup.js
// Extend global objects
// Define a global customLog function for logging custom messages
global.customLog = (message) => {
    // Log a custom message with "Custom Log" prefix
  console.log(`Custom Log: ${message}`);
};
