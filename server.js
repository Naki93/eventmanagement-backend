require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cors = require('cors')
const bcrypt = require('bcrypt')

const app = express();
app.use(cors());

// Configure body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// const mongoURI = process.env.MONGO_URI_LOGIN;
const mongoURI = process.env.MONGO_URI



// Connect to MongoDB
mongoose//connect
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('MongoDB connected');

    // Create an admin user 
    const adminUser = await User.findOne({ username: 'admin@example12.com' });
    if (!adminUser) {
        
      const hashedPassword = await bcrypt.hash('securepassword', 10);
      const newAdmin = new User({ username: 'admin@example12.com', password: hashedPassword, isAdmin: true });
      await newAdmin.save();
      console.log('Admin user created');
    }
  })
  .catch((err) => console.log(err));



// Passport configuration
app.use(passport.initialize());

// Create User model
const User = require('./models/User');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const authRoutes = require('./routes/auth');

app.use('/auth', authRoutes);

// Start the server
const port = process.env.PORT || 5000;

if (!module.parent) { // Only start the server if this script is not imported as a module
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
