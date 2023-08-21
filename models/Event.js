const mongoose = require('mongoose');

const scheduleConnection = mongoose.connection.useDb('schedule'); // Use the 'schedule' database connection


const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date, // Use Date data type for eventDate
    required: true,
  },
  eventTime: {
    type: String, // Use String data type for eventTime
    required: true,
  },
  eventLocation: {
    type: String, // Use String data type for eventDescription
    required: true,
  },
  eventDescription: {
    type: String, // Use String data type for eventDescription
    required: true,
  },
  eventStatus: {
    type: String,
    enum: ['Upcoming', 'Postponed', 'Canceled'],
    default: 'Upcoming',
    required: true,
  },
  
});

// const Event = mongoose.model('Event', eventSchema);
const Event = scheduleConnection.model('Event', eventSchema); // Use the 'schedule' database connection

module.exports = Event;

