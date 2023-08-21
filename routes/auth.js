require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt')

const secretKey = process.env.SECRET_KEY

// Get all users route
router.get('/users', async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json({ users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

//Create email validator
const emailValidator = /^(?=.*[@])(?=.*[.com]$).*$/;


// Register a new user
router.post('/register', async (req, res) => {
    const { username, password, isAdmin } = req.body;
  
    // Check if the password meets the length requirement
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
  
    // Validate email format
    if (!emailValidator.test(username)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
  
      // Create a new user document with the provided role
      const user = new User({
        username,
        password: hashedPassword,
        role: isAdmin ? 'admin' : 'user' ,// Assign role based on isAdmin
        isAdmin: isAdmin, // Set the isAdmin field
      });
  
      // Save the user document to the database
      await user.save();
  
      res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });
  



// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
        console.log('Searching for user:', username);
      // Find the user based on the username
      const user = await User.findOne({ username });
  
      if (!user) {
        console.log('User not found:', username);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Compare the provided password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      console.log('Password match');
      console.log('User role:', user.role);
      // If password matches, generate and send a JWT token
      const tokenPayload = { userId: user._id, role: user.role.toLowerCase()  }; // Include role in payload
      const token = jwt.sign(tokenPayload, process.env.SECRET_KEY, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

 

// Create a middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    try {
      const token = req.header('Authorization').replace('Bearer ', ''); // Get the token from the Authorization header
      const decoded = jwt.verify(token, process.env.SECRET_KEY); // Verify and decode the token
  
      console.log('Decoded token:', decoded);
  
      if (decoded.role === 'admin') {
        next(); // User is an admin, continue to the next middleware
      } else {
        console.log('Access forbidden for non-admin user');
        res.status(403).json({ message: 'Access forbidden' }); // User is not an admin, deny access
      }
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Invalid token' }); // Token verification failed
    }
  };

  
//Create middleware for both admin and regular user
  const hasUserRole = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    console.log('Decoded token:', decoded);

    // Check if the role is either 'admin' or 'user'
    if (decoded.role === 'admin' || decoded.role === 'user') {
      next();
      console.log('Decoded role:', decoded.role);

    } else {
      console.log('Access forbidden for non-admin and non-user user');
      res.status(403).json({ message: 'Access forbidden' });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

  

 // Admin User Route (protected by isAdmin middleware)
router.get('/admin/dashboard', isAdmin, (req, res) => {
    res.send('Welcome to the admin dashboard!');
  });

  // Regular User Route
router.get('/user/dashboard', (req, res) => {
    res.send('Welcome to your user dashboard!');
  });
  
  // Protected Route (accessible to both regular and admin users)
  router.get('/protected', (req, res) => {
    res.send('Welcome to the protected route!');
  });
  
  const Event = require('../models/Event'); // Import Event model



// Fetch all events (for both admin and regular user)

router.get('/events', hasUserRole, async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});


// Create a new event (protected by isAdmin middleware)
router.post('/events', isAdmin, async (req, res) => {
  const { eventName, eventDate, eventTime, eventLocation, eventDescription } = req.body;

  try {
    const newEvent = new Event({
      eventName,
      eventDate,
      eventTime,
      eventLocation,
      eventDescription,
      eventStatus: 'Upcoming', // Set default status
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Event creation failed' });
  }
});

// Update an event by ID (protected by isAdmin middleware)
router.put('/events/:eventId', isAdmin, async (req, res) => {
  const { eventId } = req.params;
  const { eventName, eventDate, eventTime, eventLocation, eventDescription, eventStatus } = req.body;
  console.log('Received event update request:', req.body); // Add this line
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        eventName,
        eventDate,
        eventTime,
        eventLocation,
        eventDescription,
        eventStatus,
      },
      { new: true } // Return the updated event
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    console.log('Updated event:', updatedEvent);
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating event' });
  }
});


  // Delete an event by ID (protected by isAdmin middleware)
router.delete('/events/:eventId', isAdmin, async (req, res) => {
  const { eventId } = req.params;

  try {
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting event' });
  }
});

  
  


module.exports = router;
