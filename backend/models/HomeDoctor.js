const mongoose = require('mongoose');

const homeDoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide doctor name']
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  address: {
    type: String,
    required: [true, 'Please provide address']
  },
  hours: {
    type: String,
    required: [true, 'Please provide working hours']
  },
  contact: {
    type: String,
    required: [true, 'Please provide contact number']
  },
  specialization: {
    type: String,
    // Making specialization optional as it might not be in your existing data
    // required: [true, 'Please provide specialization'] 
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Explicitly set the collection name to 'home_doctor_visits'
const HomeDoctor = mongoose.model('HomeDoctor', homeDoctorSchema, 'home_doctor_visits');
module.exports = HomeDoctor;