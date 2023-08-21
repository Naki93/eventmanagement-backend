
const { mongod } = require('./testUtils');


// This module exports an asynchronous function that stops the MongoDB instance
// if it is currently running. It's intended to be used in the teardown process
// after tests have completed. If the MongoDB instance (mongod) exists, it is
// stopped gracefully to clean up resources.
module.exports = async () => {
    if (mongod) {
      await mongod.stop();
    }
  };



  
