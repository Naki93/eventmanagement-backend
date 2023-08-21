const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const loginConnection = mongoose.connection.useDb('login')// Use the 'login' database connection

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, default: 'admin' },
//   isAdmin: { type: Boolean, default: false },
});

userSchema.plugin(passportLocalMongoose);



module.exports = loginConnection.model('User', userSchema);
